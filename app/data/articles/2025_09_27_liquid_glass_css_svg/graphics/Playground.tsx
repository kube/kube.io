import type { ImageData as CanvasImageData } from "canvas";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useId, useState } from "react";
import { ConcaveButton, ConvexButton, LipButton } from "../components/Buttons";
import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
} from "../lib/displacementMap";
import { imageDataToUrl } from "../lib/imageDataToUrl";
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
  const hasCurrentX = useMotionValue(false);
  const glassThickness = useMotionValue(50);
  const bezelWidth = useMotionValue(60);
  const refractiveIndex = 1.5;
  const objectWidth = 200;
  const objectHeight = 200;
  const radius = 100;
  const scaleRatio = useMotionValue(1);
  // Surface selection
  const [surface, setSurface] = useState<"convex" | "concave" | "lip">(
    "convex"
  );
  const equationFn: BezelFn =
    surface === "convex" ? CONVEX : surface === "concave" ? CONCAVE : LIP;

  // Heavy computations as derived MotionValues
  const precomputedDisplacementMap = useTransform(
    [glassThickness, bezelWidth],
    () =>
      calculateDisplacementMap(
        glassThickness.get(),
        bezelWidth.get(),
        equationFn,
        refractiveIndex
      )
  );

  const maximumDisplacement = useTransform(
    precomputedDisplacementMap,
    (arr: number[]) => Math.max(...arr.map(Math.abs))
  );

  const imageData = useTransform(
    precomputedDisplacementMap,
    (arr: number[]): CanvasImageData =>
      calculateDisplacementMap2(
        width,
        height,
        objectWidth,
        objectHeight,
        radius,
        bezelWidth.get(),
        maximumDisplacement.get(),
        arr
      )
  );

  const displacementMapUrl = useTransform(imageData, (img: CanvasImageData) =>
    imageDataToUrl(img)
  );

  const pathData = useTransform(
    precomputedDisplacementMap,
    (arr: number[]): string => {
      const max = maximumDisplacement.get();
      return arr
        .map((d, i) => {
          const x = (i / arr.length) * width;
          return `${i === 0 ? "M" : "L"} ${x} ${
            height / 2 - ((d / max) * height) / 2
          }`;
        })
        .join(" ");
    }
  );

  // Derived MotionValues for UI bindings
  const backgroundImageCss = useTransform(
    displacementMapUrl,
    (u) => `url(${u})`
  );
  const showCurrentX = useTransform(hasCurrentX, (v) => (v ? "block" : "none"));
  const currentXPos = useTransform(currentX, (v) => (v ?? 0) * width);
  const y2Motion = useTransform(precomputedDisplacementMap, (arr: number[]) => {
    const vx = currentX.get() ?? 0;
    const max = maximumDisplacement.get();
    const idx = Math.min(arr.length - 1, Math.max(0, (vx * arr.length) | 0));
    const d = arr[idx];
    return height / 2 - (d / max) * (height / 2);
  });
  const scaleMotion = useTransform(
    scaleRatio,
    (ratio) => maximumDisplacement.get() * ratio
  );

  // Bridge MotionValues to React props for the Mini simulation only (cheap re-renders)
  const [bw, setBw] = useState<number>(bezelWidth.get());
  const [gt, setGt] = useState<number>(glassThickness.get());
  const [cx, setCx] = useState<number | undefined>(
    currentX.get() == null ? undefined : (currentX.get() as number)
  );
  useMotionValueEvent(bezelWidth, "change", (v) => setBw(v));
  useMotionValueEvent(glassThickness, "change", (v) => setGt(v));
  useMotionValueEvent(currentX, "change", (v) =>
    setCx(v == null ? undefined : (v as number))
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
            active={surface === "convex"}
            onClick={() => setSurface("convex")}
          />
          <ConcaveButton
            active={surface === "concave"}
            onClick={() => setSurface("concave")}
          />
          <LipButton
            active={surface === "lip"}
            onClick={() => setSurface("lip")}
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
            bezelHeightFn={equationFn}
            bezelWidth={bw}
            glassThickness={gt}
            refractionIndex={refractiveIndex}
            currentX={cx}
            onCurrentXChange={(x) => {
              currentX.set(x);
              hasCurrentX.set(true);
            }}
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
          Pre-calculated Displacements
        </h4>
        <div className="text-sm">
          <motion.svg
            viewBox="-30 -30 460 360"
            className="text-neutral-900 dark:text-neutral-100"
            width="100%"
            onClick={(e) => {
              const { left, width } = e.currentTarget.getBoundingClientRect();
              const xRatio = (e.clientX - left) / width;
              const newRayOriginX = xRatio * width;
              currentX.set(newRayOriginX / width);
              hasCurrentX.set(true);
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            <motion.path
              d={pathData as unknown as string}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              y1={height / 2}
              y2={height / 2}
              x1={0}
              x2={width}
              stroke="currentColor"
              strokeWidth="1"
            />
            <line
              x1={-1}
              x2={-1}
              y1={height}
              y2={0}
              stroke="currentColor"
              strokeWidth="1"
              markerEnd="url(#axisArrow)"
            />
            <text
              x={0}
              y={-12}
              alignmentBaseline="middle"
              textAnchor="end"
              transform="rotate(-90 0 0)"
              fill="currentColor"
            >
              Ray displacement on background
            </text>
            <line
              x1={0}
              x2={width}
              y1={height}
              y2={height}
              stroke="currentColor"
              strokeWidth="1"
              markerEnd="url(#axisArrow)"
            />
            <text
              x={width}
              y={height + 12}
              alignmentBaseline="middle"
              textAnchor="end"
              fill="currentColor"
            >
              Distance to border
            </text>
            <motion.line
              style={{ display: showCurrentX }}
              x1={currentXPos}
              y1={height / 2}
              x2={currentXPos}
              y2={y2Motion}
              stroke="red"
              strokeWidth="2"
              strokeDasharray="4"
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
