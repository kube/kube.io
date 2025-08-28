import type { ImageData as CanvasImageData } from "canvas";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useId } from "react";
import { ConcaveButton, ConvexButton, LipButton } from "../components/Buttons";
import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
} from "../lib/displacementMap";
import { imageDataToUrl } from "../lib/imageDataToUrl";
import { getRayColor } from "../lib/rayColor";
import { RayRefractionSimulationMini } from "./RayRefractionSimulationMini";

type BezelFn = (x: number) => number;
const CONCAVE: BezelFn = (x) => 1 - Math.sqrt(1 - (1 - x) ** 2);
const CONVEX: BezelFn = (x) => Math.sqrt(1 - (1 - x) ** 2);
const LIP: BezelFn = (x) => {
  const circle = Math.sqrt(1 - (1 - x * 2) ** 2);
  const sin = Math.cos((x + 0.5) * 2 * Math.PI) / 40 + 0.5;
  const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  const ratioCircle = 1 - smootherstep;
  return circle * ratioCircle + sin * (1 - ratioCircle);
};

export const Playground: React.FC = () => {
  const filterId = useId();

  const width = 400;
  const height = 300;

  // Inputs as MotionValues to avoid React re-renders
  const currentX = useMotionValue<number | null>(null);
  const glassThickness = useMotionValue(50);
  const bezelWidth = useMotionValue(60);
  const refractiveIndex = 1.5;
  const objectWidth = 200;
  const objectHeight = 200;
  const radius = 100;
  const scaleRatio = useMotionValue(1);
  // Surface selection (pure Motion)
  const surface = useMotionValue<"convex" | "concave" | "lip">("convex");

  // Heavy computations as derived MotionValues
  const precomputedDisplacementMap = useTransform(() =>
    calculateDisplacementMap(
      glassThickness.get(),
      bezelWidth.get(),
      (surface.get() === "convex"
        ? CONVEX
        : surface.get() === "concave"
        ? CONCAVE
        : LIP) as BezelFn,
      refractiveIndex
    )
  );

  const maximumDisplacement = useTransform(() => {
    const arr = precomputedDisplacementMap.get() as number[];
    return Math.max(...arr.map(Math.abs));
  });

  const imageData = useTransform(
    () =>
      calculateDisplacementMap2(
        width,
        height,
        objectWidth,
        objectHeight,
        radius,
        bezelWidth.get(),
        (maximumDisplacement.get() as unknown as number) || 1,
        (precomputedDisplacementMap.get() as unknown as number[]) || []
      ) as CanvasImageData
  );

  const displacementMapUrl = useTransform(() =>
    imageDataToUrl(imageData.get() as unknown as CanvasImageData)
  );

  const pathData = useTransform(() => {
    const arr = (precomputedDisplacementMap.get() as unknown as number[]) || [];
    const max = (maximumDisplacement.get() as unknown as number) || 1;
    return arr
      .map((d, i) => {
        const x = (i / arr.length) * width;
        return `${i === 0 ? "M" : "L"} ${x} ${
          height / 2 - ((d / max) * height) / 2
        }`;
      })
      .join(" ");
  });

  // Derived MotionValues for UI bindings
  const backgroundImageCss = useTransform(
    displacementMapUrl,
    (u) => `url(${u})`
  );
  const currentXPos = useTransform(currentX, (v) => (v ?? 0) * width);
  const y2Motion = useTransform(() => {
    const arr = (precomputedDisplacementMap.get() as unknown as number[]) || [];
    const v = currentX.get() ?? 0;
    const max = (maximumDisplacement.get() as unknown as number) || 1;
    const idx = Math.min(arr.length - 1, Math.max(0, (v * arr.length) | 0));
    const d = arr[idx] ?? 0;
    return height / 2 - (d / max) * (height / 2);
  });
  const scaleMotion = useTransform(
    scaleRatio,
    (ratio) => maximumDisplacement.get() * ratio
  );

  // No React state: pass MotionValues to the Mini directly

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
  const displacementColor = useTransform(displacementIntensity, getRayColor);
  const showIndicator = useTransform(currentX, (v) =>
    v == null || v < 0 || v > 1 ? "none" : "block"
  );

  // Swiss-style panel + heading helpers
  const panel =
    "relative rounded-lg border border-neutral-900/10 dark:border-white/10 bg-white dark:bg-zinc-900/60 overflow-hidden";
  const heading =
    "uppercase tracking-[0.15em] text-[10px] leading-none text-neutral-500 dark:text-neutral-400";

  return (
    <div className="grid grid-cols-2 gap-2 text-neutral-900 dark:text-neutral-100 select-none -ml-[15px] w-[calc(100%+30px)]">
      <div className={`flex flex-col ${panel}`}>
        <h4 className={`${heading} px-2 pt-2 z-40 grow-0`}>Surface</h4>
        <div className="p-4 flex items-center justify-center gap-4 grow">
          <ConvexButton
            active={useTransform(surface, (s) => s === "convex")}
            onClick={() => surface.set("convex")}
          />
          <ConcaveButton
            active={useTransform(surface, (s) => s === "concave")}
            onClick={() => surface.set("concave")}
          />
          <LipButton
            active={useTransform(surface, (s) => s === "lip")}
            onClick={() => surface.set("lip")}
          />
        </div>
      </div>

      <div className={`${panel}`}>
        <h4 className={`${heading} px-2 pt-2 z-40`}>Controls</h4>
        <div className="text-xs grid grid-cols-[25%_1fr] gap-3 p-3 pt-4">
          <label>Bezel Width</label>
          <motion.input
            type="range"
            min="0"
            max="100"
            step="1"
            defaultValue={bezelWidth.get()}
            onChange={(e) => bezelWidth.set(Number(e.target.value))}
            className="w-full accent-neutral-900 dark:accent-neutral-100"
          />
          <label>Glass Thickness</label>
          <motion.input
            type="range"
            min="0"
            max="100"
            step="1"
            defaultValue={glassThickness.get()}
            onChange={(e) => glassThickness.set(Number(e.target.value))}
            className="w-full accent-neutral-900 dark:accent-neutral-100"
          />
          <label>Scale Ratio</label>
          <motion.input
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue={scaleRatio.get()}
            onChange={(e) => scaleRatio.set(Number(e.target.value))}
            className="w-full accent-neutral-900 dark:accent-neutral-100"
          />
        </div>
      </div>
      <div className={`${panel}`}>
        <h4 className={`absolute ${heading} px-2 pt-2 z-40`}>Ray Simulation</h4>
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
        <motion.div
          className="text-sm select-none"
          aria-label="Displacement Map"
          style={{
            width: "100%",
            aspectRatio: "4 / 3",
            backgroundImage: backgroundImageCss,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      <div className={`${panel}`}>
        <h4 className={`absolute ${heading} px-2 pt-2 z-40`}>
          Calculated Displacements
        </h4>
        <div className="text-sm">
          <motion.svg
            viewBox="-30 -30 460 360"
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
                markerWidth="6"
                markerHeight="6"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 0 L 10 5 L 0 10 z"
                  fill="currentColor"
                  opacity="0.3"
                />
              </marker>
            </defs>
            <motion.path
              d={pathData}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
            <line
              y1={height / 2}
              y2={height / 2}
              x1={0}
              x2={width}
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.34"
            />
            <line
              x1={-1}
              x2={-1}
              y1={height}
              y2={0}
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.34"
              markerEnd="url(#axisArrow)"
            />
            <text
              x={-10}
              y={-12}
              alignmentBaseline="middle"
              textAnchor="end"
              transform="rotate(-90 0 0)"
              fill="currentColor"
              opacity="0.6"
            >
              Displacement on background
            </text>
            <line
              x1={0}
              x2={width}
              y1={height}
              y2={height}
              stroke="currentColor"
              strokeWidth="1"
              strokeOpacity="0.28"
              markerEnd="url(#axisArrow)"
            />
            <text
              x={width - 10}
              y={height + 12}
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
              strokeWidth="2.5"
              strokeDasharray="3"
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
          color-interpolation-filters="sRGB"
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
              x={-25}
              y={-25}
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              {/* Safari workaround: animate x/y instead of patternTransform */}
              <animate
                attributeName="x"
                from="-25"
                to="25"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="y"
                from="-25"
                to="25"
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
  );
};
