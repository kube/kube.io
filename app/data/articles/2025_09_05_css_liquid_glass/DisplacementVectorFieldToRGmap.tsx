import { RadiusIcon, RotateCcwIcon, SplineIcon } from "lucide-react";
import { animate } from "motion";
import {
  motion,
  transformValue,
  useMotionValue,
  useTransform,
} from "motion/react";
import { calculateDisplacementMap } from "./displacementMap";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

const CONCAVE_BEZEL_FN = (x: number) => 1 - Math.sqrt(1 - (1 - x) ** 2);
const CONVEX_BEZEL_FN = (x: number) => Math.sqrt(1 - (1 - x) ** 2);
const LIP_BEZEL_FN = (x: number) => {
  const circle = Math.sqrt(1 - (1 - x * 2) ** 2);
  const sin = Math.cos((x + 0.5) * 2 * Math.PI) / 40 + 0.5;
  const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  const ratioCircle = 1 - smootherstep;
  return circle * ratioCircle + sin * (1 - ratioCircle);
};

type DisplacementVectorFieldProps = {
  glassThickness?: number;
  bezelHeightFn?: (x: number) => number;
  refractiveIndex?: number;
};

export const DisplacementVectorFieldToRGMap: React.FC<
  DisplacementVectorFieldProps
> = ({ glassThickness = 0, refractiveIndex = 1.5 }) => {
  const bezelWidth = 150;

  // Bezel Height Function (interpolated with animation on change)
  const bezelHeightFn_target = useMotionValue((x: number) => {
    return Math.sqrt(1 - (1 - x) ** 2);
  });
  const bezelHeightFn_previous = useMotionValue(bezelHeightFn_target.get());
  const bezelHeightFn_interpolationProgress = useMotionValue(1);

  bezelHeightFn_target.on("change", async (value) => {
    bezelHeightFn_interpolationProgress.set(0);
    await animate(bezelHeightFn_interpolationProgress, 1, {
      duration: 1,
      ease: "easeInOut",
    });
    bezelHeightFn_previous.set(value);
  });

  const bezelHeightFn = useTransform(() => {
    const progress = bezelHeightFn_interpolationProgress.get();
    if (progress === 1) {
      return bezelHeightFn_target.get();
    }
    return (x: number) =>
      bezelHeightFn_previous.get()(x) * (1 - progress) +
      bezelHeightFn_target.get()(x) * progress;
  });

  const displacementMap = useTransform(() =>
    calculateDisplacementMap(
      glassThickness,
      bezelWidth,
      bezelHeightFn.get(),
      refractiveIndex
    )
  );

  const maximumDisplacement = useTransform(() =>
    Math.max(...displacementMap.get().map(Math.abs))
  );

  const NUMBER_OF_DOTS_X = 24;
  const NUMBER_OF_DOTS_Y = 24;
  const NUMBER_OF_DOTS = NUMBER_OF_DOTS_X * NUMBER_OF_DOTS_Y;

  const canvasWidth = 400;
  const canvasHeight = 300;

  const centerX = 200;
  const centerY = 150;

  const radius = 130;

  // Progress of conversion from vector to RG dot along every vector travelled as a buffer
  const conversionProgress = useMotionValue(0);

  async function startAnimation() {
    // Do something here
  }

  const plot = radius / (NUMBER_OF_DOTS_X / 2);

  return (
    <div className="relative">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        transform="translate(0, 0)"
      >
        <defs>
          <marker
            id="arrow-displacement-vector-field"
            viewBox="0 0 4 4"
            markerWidth="4"
            markerHeight="4"
            refX="0"
            refY="2"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L4,2 L0,4 Z"
              stroke="inherit"
              strokeWidth={5}
              fill="context-stroke"
            />
          </marker>
        </defs>

        <motion.g>
          <circle
            cx={canvasWidth / 2}
            cy={canvasHeight / 2}
            r={radius}
            fill="none"
            className="stroke-slate-400/30 dark:stroke-slate-500/30 fill-slate-500/10 dark:fill-slate-500/10"
            strokeWidth={1}
          />

          {Array.from({ length: NUMBER_OF_DOTS }, (_, i) => {
            const x = 2 * ((i % NUMBER_OF_DOTS_X) / NUMBER_OF_DOTS_X) - 1;
            const y =
              2 * (Math.floor(i / NUMBER_OF_DOTS_X) / NUMBER_OF_DOTS_Y) - 1;

            const isInCircle = x * x + y * y < Math.sqrt(2);

            if (!isInCircle) {
              return null;
            }

            const angle = transformValue(() => {
              const angle = Math.atan2(y, x);
              return angle < 0 ? angle + 2 * Math.PI : angle;
            });

            const currentVectorProgress = transformValue(() => {
              const progress = conversionProgress.get();
              return clamp01(
                (progress - i / NUMBER_OF_DOTS) / (1 - i / NUMBER_OF_DOTS)
              );
            });

            const distanceToSide = 1 - Math.abs(Math.sqrt(x * x + y * y) * 4);
            const index =
              ((displacementMap.get().length * distanceToSide) /
                NUMBER_OF_DOTS_X /
                2) |
              0;

            const magnitude = transformValue(
              () => displacementMap.get()[index]
            );
            const magnitudeScaled = transformValue(() => {
              const scale = 1 / maximumDisplacement.get();
              return (magnitude.get() * scale * plot) / 2;
            });
            const color = transformValue(
              () =>
                `hsl(${
                  180 +
                  Math.abs(magnitude.get() / maximumDisplacement.get()) * 90
                },95%,45%)`
            );
            const strokeWidth = transformValue(
              () =>
                0.8 +
                Math.abs(magnitude.get() / maximumDisplacement.get()) * 1.3
            );
            const nx = useTransform(
              () => (magnitudeScaled.get() * Math.cos(angle.get())) / radius
            );
            const ny = useTransform(
              () => (magnitudeScaled.get() * Math.sin(angle.get())) / radius
            );
            const x1 = centerX + x * radius;
            x;
            const y1 = centerY + y * radius;
            const x2 = transformValue(
              () => x1 + nx.get() * (1 - currentVectorProgress.get())
            );
            const y2 = transformValue(
              () => y1 + ny.get() * (1 - currentVectorProgress.get())
            );

            // Compute color components from current vector
            // Normalized components derived from motion values
            const redIntensity = useTransform(nx, (v: number) =>
              clamp01((v + 1) / 2)
            );
            const greenIntensity = useTransform(ny, (v: number) =>
              clamp01((v + 1) / 2)
            );
            const blendedColor = useTransform(
              [redIntensity, greenIntensity],
              ([ri, gi]: number[]) => {
                const r = Math.round(ri * 256);
                const g = Math.round(gi * 256);
                return `rgb(${r},${g},0)`;
              }
            );
            return (
              <>
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  opacity={transformValue(
                    () => 1 - currentVectorProgress.get()
                  )}
                  strokeWidth={strokeWidth}
                  strokeLinecap={"round"}
                  markerEnd="url(#arrow-displacement-vector-field)"
                />
                <motion.circle
                  cx={x1}
                  cy={y1}
                  r={transformValue(() => currentVectorProgress.get() * 4)}
                  fill={blendedColor}
                  style={{
                    opacity: currentVectorProgress,
                    pointerEvents: "none",
                  }}
                />
              </>
            );
          })}
        </motion.g>
      </svg>

      <div className="absolute bottom-0 right-4 flex items-end justify-center gap-2">
        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={() => {
            const value = conversionProgress.get() === 0 ? 1 : 0;
            animate(conversionProgress, value, {
              duration: 2,
              ease: "easeOut",
            });
          }}
        >
          <RadiusIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform rotate-0"
          />
        </button>

        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={() => bezelHeightFn_target.set(CONVEX_BEZEL_FN)}
        >
          <SplineIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform rotate-0"
          />
        </button>

        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={() => bezelHeightFn_target.set(CONCAVE_BEZEL_FN)}
        >
          <SplineIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform rotate-270"
          />
        </button>

        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={() => bezelHeightFn_target.set(LIP_BEZEL_FN)}
        >
          <SplineIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform rotate-45"
          />
        </button>

        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={startAnimation}
        >
          <RotateCcwIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform"
          />
        </button>
      </div>
    </div>
  );
};
