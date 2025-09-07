import type { ImageData as CanvasImageData } from "canvas";
import { motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { SurfaceEquationSelector } from "../components/SurfaceEquationSelector";
import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
} from "../lib/displacementMap";
import { getRayColorDimmed } from "../lib/rayColor";
import { CONCAVE, CONVEX, CONVEX_CIRCLE, LIP } from "../lib/surfaceEquations";
import { RayRefractionSimulationMini } from "./RayRefractionSimulationMini";

export const Playground: React.FC = () => {
  const filterId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(containerRef, { amount: 0.05 });

  const width = 400;
  const height = 300;

  // Inputs as MotionValues to avoid React re-renders
  const currentX = useMotionValue<number | null>(null);
  const glassThickness = useMotionValue(50);
  const bezelWidth = useMotionValue(60);
  const refractiveIndex = 1.5;
  const objectWidth = 220;
  const objectHeight = 220;
  const radius = 110;
  const scaleRatio = useMotionValue(1);
  // Surface selection (pure Motion)
  const surface = useMotionValue<
    "convex_circle" | "convex_squircle" | "concave" | "lip"
  >("convex_circle");

  // Heavy computations as derived MotionValues
  const precomputedDisplacementMap = useTransform(() =>
    calculateDisplacementMap(
      glassThickness.get(),
      bezelWidth.get(),
      surface.get() === "convex_circle"
        ? CONVEX_CIRCLE.fn
        : surface.get() === "convex_squircle"
        ? CONVEX.fn
        : surface.get() === "concave"
        ? CONCAVE.fn
        : LIP.fn,
      refractiveIndex,
      512
    )
  );

  const maximumDisplacement = useTransform(() => {
    const arr = precomputedDisplacementMap.get() as number[];
    return Math.max(...arr.map(Math.abs));
  });

  const imageData = useTransform(() => {
    if (!isInView) return null;
    return calculateDisplacementMap2(
      width,
      height,
      objectWidth,
      objectHeight,
      radius,
      bezelWidth.get(),
      (maximumDisplacement.get() as unknown as number) || 1,
      (precomputedDisplacementMap.get() as unknown as number[]) || []
    ) as CanvasImageData;
  });

  // Update canvas when image data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const unsubscribe = imageData.on("change", (canvasImageData) => {
      if (!canvasImageData) return;
      // Convert canvas ImageData to browser ImageData
      canvas.width = canvasImageData.width;
      canvas.height = canvasImageData.height;
      const browserImageData = new ImageData(
        new Uint8ClampedArray(canvasImageData.data),
        canvasImageData.width,
        canvasImageData.height
      );
      ctx.putImageData(browserImageData, 0, 0);
    });

    // Initialize with current value
    const initialCanvasImageData = imageData.get();
    if (!initialCanvasImageData) return;
    canvas.width = initialCanvasImageData.width;
    canvas.height = initialCanvasImageData.height;
    const initialBrowserImageData = new ImageData(
      new Uint8ClampedArray(initialCanvasImageData.data),
      initialCanvasImageData.width,
      initialCanvasImageData.height
    );
    ctx.putImageData(initialBrowserImageData, 0, 0);

    return () => unsubscribe();
  }, [isInView, imageData]);

  const pathData = useTransform(() => {
    const arr = (precomputedDisplacementMap.get() as unknown as number[]) || [];
    const max = (maximumDisplacement.get() as unknown as number) || 1;
    return arr
      .map((d, i) => {
        const x = (i / arr.length) * width;
        return `${i === 0 ? "M" : "L"} ${x} ${
          height / 2 - ((d / max) * height * 0.9) / 2
        }`;
      })
      .join(" ");
  });

  // Create a data URL from canvas for SVG filter
  const displacementMapUrl = useTransform(imageData, (canvasImageData) => {
    if (!canvasImageData) return null;
    // Create a temporary canvas to convert ImageData to data URL
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvasImageData.width;
    tempCanvas.height = canvasImageData.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return "";

    const browserImageData = new ImageData(
      new Uint8ClampedArray(canvasImageData.data),
      canvasImageData.width,
      canvasImageData.height
    );
    tempCtx.putImageData(browserImageData, 0, 0);
    return tempCanvas.toDataURL();
  });

  const currentXPos = useTransform(currentX, (v) => (v ?? 0) * width);
  const y2Motion = useTransform(() => {
    const arr = (precomputedDisplacementMap.get() as unknown as number[]) || [];
    const v = currentX.get() ?? 0;
    const max = (maximumDisplacement.get() as unknown as number) || 1;
    const idx = Math.min(arr.length - 1, Math.max(0, (v * arr.length) | 0));
    const d = arr[idx] ?? 0;
    return height / 2 - (d / max) * (height / 2) * 0.9;
  });
  const scaleMotion = useTransform(
    scaleRatio,
    (ratio) => maximumDisplacement.get() * ratio
  );

  // Color for the displacement indicator based on normalized intensity at currentX
  const displacementIntensity = useTransform(() => {
    const arr = (precomputedDisplacementMap.get() as unknown as number[]) || [];
    const v = currentX.get();
    if (v == null || v < 0 || v > 1) return 0;
    const idx = Math.min(arr.length - 1, Math.max(0, (v * arr.length) | 0));
    const d = Math.abs(arr[idx] ?? 0);
    const max = (maximumDisplacement.get() as unknown as number) || 1;
    return d / max;
  });
  const displacementColor = useTransform(
    displacementIntensity,
    getRayColorDimmed
  );
  const showIndicator = useTransform(currentX, (v) =>
    v == null || v < 0 || v > 1 ? "none" : "block"
  );

  // Swiss-style panel + heading helpers
  const panel =
    "relative rounded-md border border-neutral-900/15 dark:border-white/15 bg-white dark:bg-zinc-900/60 overflow-hidden";
  const heading =
    "uppercase tracking-[0.15em] text-[9px] sm:[11px] leading-none text-neutral-500 dark:text-neutral-400";

  return (
    <div
      ref={containerRef}
      className="-ml-[18px] w-[calc(100%+36px)] text-neutral-900 dark:text-neutral-100 select-none touch-pan-y"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
        <div className={`flex flex-col ${panel}`}>
          <h4 className={`${heading} px-2 pt-2 z-40 grow-0`}>Surface</h4>
          <div className="p-4 flex items-center justify-center gap-4 grow">
            <SurfaceEquationSelector surface={surface} />
          </div>
        </div>

        <div className={`${panel}`}>
          <h4 className={`${heading} px-2 pt-2 z-40`}>Controls</h4>
          <div className="text-xs grid grid-cols-[25%_1fr] gap-x-4 gap-y-3 p-3 pt-4 items-center">
            <label className="text-right">Bezel Width</label>
            <motion.input
              type="range"
              min="0"
              max="100"
              step="1"
              defaultValue={bezelWidth.get()}
              onChange={(e) => bezelWidth.set(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-neutral-100"
              style={{
                height: "3px",
                background: "rgb(163 163 163 / 0.5)",
                outline: "none",
                WebkitAppearance: "none",
              }}
            />
            <label className="text-right">Glass Thickness</label>
            <motion.input
              type="range"
              min="0"
              max="100"
              step="1"
              defaultValue={glassThickness.get()}
              onChange={(e) => glassThickness.set(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-neutral-100"
              style={{
                height: "3px",
                background: "rgb(163 163 163 / 0.5)",
                outline: "none",
                WebkitAppearance: "none",
              }}
            />
            <label className="text-right">Scale Ratio</label>
            <motion.input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue={scaleRatio.get()}
              onChange={(e) => scaleRatio.set(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-neutral-100"
              style={{
                height: "3px",
                background: "rgb(163 163 163 / 0.5)",
                outline: "none",
                WebkitAppearance: "none",
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
        <div className={`${panel}`}>
          <h4 className={`absolute ${heading} px-2 pt-2 z-40`}>
            Radius Simulation
          </h4>
          <div className="text-sm">
            <RayRefractionSimulationMini
              surface={surface}
              bezelWidth={bezelWidth}
              glassThickness={glassThickness}
              refractionIndex={refractiveIndex}
              currentX={currentX}
            />
          </div>
        </div>

        <div className={`${panel}`}>
          <h4
            className={`absolute ${heading} px-2 pt-2 z-40 text-white/70 dark:text-white/70`}
          >
            Displacement Map
          </h4>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>

        <div className={`${panel}`}>
          <h4 className={`absolute ${heading} px-2 pt-2 z-40`}>
            Radius Displacements
          </h4>
          <div className="text-sm">
            <motion.svg
              viewBox="-30 -40 450 370"
              className="text-neutral-900 dark:text-neutral-100"
              width="100%"
              onPointerDown={(e) => {
                const { left, width } = e.currentTarget.getBoundingClientRect();
                const xRatio = (e.clientX - left) / width;
                currentX.set(Math.max(0, Math.min(1, xRatio)));
                try {
                  (
                    e.currentTarget as Element & { setPointerCapture: any }
                  ).setPointerCapture((e as any).pointerId);
                } catch {}
              }}
              onPointerMove={(e) => {
                if (!(e.buttons & 1)) return;
                const { left, width } = e.currentTarget.getBoundingClientRect();
                const xRatio = (e.clientX - left) / width;
                currentX.set(Math.max(0, Math.min(1, xRatio)));
              }}
            >
              <defs>
                <marker
                  id="axisArrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="9"
                  markerHeight="9"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              <motion.path
                d={pathData}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.6"
              />
              <line
                y1={height / 2}
                y2={height / 2}
                x1={0}
                x2={width}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.25}
                strokeDasharray="4 1"
              />
              <line
                x1={0}
                x2={0}
                y1={height}
                y2={0}
                stroke="currentColor"
                opacity={0.25}
                strokeWidth={1}
                markerEnd="url(#axisArrow)"
              />
              <text
                x={-15}
                y={-14}
                alignmentBaseline="middle"
                textAnchor="end"
                transform="rotate(-90 0 0)"
                fill="currentColor"
                opacity="0.5"
              >
                Displacement
              </text>
              <line
                x1={0}
                x2={width}
                y1={height}
                y2={height}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.28"
                markerEnd="url(#axisArrow)"
              />
              <text
                x={width - 10}
                y={height + 13}
                alignmentBaseline="middle"
                textAnchor="end"
                fill="currentColor"
                opacity="0.5"
              >
                Distance to border
              </text>
              <motion.line
                style={{ display: showIndicator }}
                x1={currentXPos}
                y1={height / 2}
                x2={currentXPos}
                y2={y2Motion}
                stroke={displacementColor}
                strokeWidth="2"
              />
            </motion.svg>
          </div>
        </div>

        <div className={`${panel}`}>
          <h4
            className={`absolute ${heading} px-2 pt-2 z-40 text-white dark:text-white`}
          >
            Preview
          </h4>
          <motion.svg
            className="object-cover"
            viewBox="0 0 400 300"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <defs>
              <filter id={filterId} colorInterpolationFilters="sRGB">
                <motion.feImage
                  href={displacementMapUrl as unknown as string}
                  x={0}
                  y={0}
                  width={width}
                  height={height}
                  result="displacement_map"
                />
                <motion.feDisplacementMap
                  in="SourceGraphic"
                  in2="displacement_map"
                  scale={scaleMotion}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>

              <pattern
                id="grid"
                x={-15}
                y={-15}
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                {isInView && (
                  <>
                    {/* Safari workaround: animate x/y instead of patternTransform */}
                    <animate
                      attributeName="x"
                      from="-15"
                      to="15"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y"
                      from="-15"
                      to="15"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="#D7E8E6"
                      strokeWidth="3"
                      opacity={0.8}
                    />
                  </>
                )}
              </pattern>

              <linearGradient
                id="doubleGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#4FBDBB" /> {/* Top-left */}
                <stop offset="50%" stopColor="#AFBDBB" /> {/* Center */}
                <stop offset="100%" stopColor="#DFBDBB" /> {/* Bottom-right */}
              </linearGradient>
            </defs>

            <g filter={`url(#${filterId})`}>
              <rect width="400" height="300" fill="url(#doubleGradient)" />
              <rect width="400" height="300" fill="url(#grid)" />
            </g>
          </motion.svg>
        </div>
      </div>
    </div>
  );
};
