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

  const padding = 30;
  const width = 400;
  const height = 300;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

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
        const x = (i / arr.length) * usableWidth + padding;
        return `${i === 0 ? "M" : "L"} ${x} ${
          usableHeight / 2 - ((d / max) * usableHeight * 0.8) / 2 + padding
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

  const currentXPos = useTransform(currentX, (v) => (v ?? 0) * usableWidth);
  const y2Motion = useTransform(() => {
    const arr = (precomputedDisplacementMap.get() as unknown as number[]) || [];
    const v = currentX.get() ?? 0;
    const max = (maximumDisplacement.get() as unknown as number) || 1;
    const idx = Math.min(arr.length - 1, Math.max(0, (v * arr.length) | 0));
    const d = arr[idx] ?? 0;
    return usableHeight / 2 - (d / max) * (usableHeight / 2) * 0.8;
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
      className="-ml-[18px] w-[calc(100%+36px)] text-neutral-900 dark:text-neutral-100 select-none touch-pan-y contain-layout contain-style contain-paint [content-visibility:auto]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
        <div className={`flex flex-col ${panel}`}>
          <h4 className={`absolute ${heading} px-2 pt-2 z-40 grow-0`}>
            Surface
          </h4>
          <div className="p-4 flex items-center justify-center gap-4 grow">
            <SurfaceEquationSelector surface={surface} />
          </div>
        </div>

        <div className={`${panel}`}>
          <h4 className={`${heading} px-2 pt-2 z-40`}>Controls</h4>
          <div className="text-xs grid grid-cols-[25%_1fr] gap-x-4 gap-y-3.5 p-5 pt-4 pr-6 items-center">
            <label className="text-right opacity-80">Bezel Width</label>
            <motion.input
              type="range"
              min="0"
              max="100"
              step="1"
              defaultValue={bezelWidth.get()}
              onChange={(e) => bezelWidth.set(Number(e.target.value))}
              className="w-full accent-sky-700 dark:accent-slate-500"
              style={{
                height: "2px",
                background: "rgb(163 163 163 / 0.1)",
              }}
            />
            <label className="text-right opacity-80">Glass Thickness</label>
            <motion.input
              type="range"
              min="0"
              max="100"
              step="1"
              defaultValue={glassThickness.get()}
              onChange={(e) => glassThickness.set(Number(e.target.value))}
              className="w-full accent-sky-700 dark:accent-slate-500"
              style={{
                height: "2px",
                background: "rgb(163 163 163 / 0.5)",
              }}
            />
            <label className="text-right opacity-80">Scale Ratio</label>
            <motion.input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue={scaleRatio.get()}
              onChange={(e) => scaleRatio.set(Number(e.target.value))}
              className="w-full accent-sky-700 dark:accent-slate-500"
              style={{
                height: "2px",
                background: "rgb(163 163 163 / 0.5)",
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
              viewBox="0 0 400 300"
              className="text-neutral-900 dark:text-neutral-100"
              width="100%"
              onPointerDown={(e) => {
                const { left } = e.currentTarget.getBoundingClientRect();
                const xRatio = (e.clientX - left - padding) / usableWidth;
                const chartXRatio = Math.max(0, Math.min(1, xRatio));
                currentX.set(chartXRatio);
                try {
                  (
                    e.currentTarget as Element & { setPointerCapture: any }
                  ).setPointerCapture((e as any).pointerId);
                } catch {}
              }}
              onPointerMove={(e) => {
                if (!(e.buttons & 1)) return;
                const { left } = e.currentTarget.getBoundingClientRect();
                const xRatio = (e.clientX - left - padding) / usableWidth;
                const chartXRatio = Math.max(0, Math.min(1, xRatio));
                currentX.set(chartXRatio);
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

              <motion.line
                style={{ display: showIndicator }}
                x1={useTransform(currentXPos, (x) => x + padding)}
                y1={usableHeight / 2 + padding}
                x2={useTransform(currentXPos, (x) => x + padding)}
                y2={useTransform(y2Motion, (y) => y + padding)}
                stroke={displacementColor}
                strokeWidth={2}
              />

              <motion.path
                d={pathData}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.6"
                strokeLinecap="round"
              />

              <line
                y1={usableHeight / 2 + padding}
                y2={usableHeight / 2 + padding}
                x1={padding}
                x2={padding + usableWidth}
                stroke="currentColor"
                strokeWidth={1}
                opacity={0.25}
                strokeDasharray="4 1"
              />
              <line
                x1={padding}
                x2={padding}
                y1={usableHeight + padding}
                y2={padding}
                stroke="currentColor"
                opacity={0.25}
                strokeWidth={1}
                markerEnd="url(#axisArrow)"
              />
              <text
                x={6}
                y={7}
                alignmentBaseline="middle"
                textAnchor="end"
                transform="rotate(-90 30 20)"
                fill="currentColor"
                opacity="0.5"
              >
                Displacement
              </text>
              <line
                x1={padding}
                x2={usableWidth + padding}
                y1={usableHeight + padding}
                y2={usableHeight + padding}
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.28"
                markerEnd="url(#axisArrow)"
              />
              <text
                x={usableWidth + padding - 10}
                y={usableHeight + padding + 15}
                alignmentBaseline="middle"
                textAnchor="end"
                fill="currentColor"
                opacity="0.5"
              >
                Distance to border
              </text>
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
