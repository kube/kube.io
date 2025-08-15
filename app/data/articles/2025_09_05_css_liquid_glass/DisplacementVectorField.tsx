import { BoxIcon, CogIcon, FanIcon, RotateCcwIcon } from "lucide-react";
import { animate } from "motion";
import {
  motion,
  springValue,
  transformValue,
  useMotionValue,
  useTransform,
} from "motion/react";
import { calculateDisplacementMap } from "./displacementMap";

type DisplacementVectorFieldProps = {
  glassThickness?: number;
  bezelWidth?: number;
  bezelHeightFn?: (x: number) => number;
  refractiveIndex?: number;
};

export const DisplacementVectorField: React.FC<
  DisplacementVectorFieldProps
> = ({ glassThickness = 50, bezelWidth = 120, refractiveIndex = 1.5 }) => {
  const bezelHeightFn = useMotionValue((x: number) => {
    return Math.sqrt(1 - (1 - x) ** 2);
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

  const NUMBER_OF_RADIUSES = 48;
  const NUMBER_OF_VECTORS_PER_RADIUS = 8;

  const canvasWidth = 400;
  const canvasHeight = 300;

  const centerX = 200;
  const centerY = 150;

  const radius = 130;

  const radiusProgress = useMotionValue(1);
  const revolutionProgress = useMotionValue(0);

  async function startAnimation() {
    revolutionProgress.set(0);
    radiusProgress.set(0);

    animate(radiusProgress, 1, {
      duration: 1,
      ease: "linear",
    });

    // bezelHeightFn.set((x: number) => {
    //   return Math.sqrt(1 - (1 - x) ** 2);
    // });

    // await new Promise((resolve) => setTimeout(resolve, 300));

    // await animate([
    //   [
    //     revolutionProgress,
    //     1 - 1 / NUMBER_OF_RADIUSES,
    //     { duration: 2, ease: "easeInOut" },
    //   ],
    // ]);

    // bezelHeightFn.set((x: number) => {
    //   const circle = Math.sqrt(1 - (1 - x * 2) ** 2);
    //   const sin = Math.cos((x + 0.5) * 2 * Math.PI) / 40 + 0.5;
    //   const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    //   const ratioCircle = 1 - smootherstep;
    //   return circle * ratioCircle + sin * (1 - ratioCircle);
    // });
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // bezelHeightFn.set((x: number) => {
    //   return 1 - Math.sqrt(1 - (1 - x) ** 2);
    // });
  }

  const borderX = centerX - radius;
  const borderY = centerY;

  const plot =
    ((centerX - borderX) * (bezelWidth / radius)) /
    NUMBER_OF_VECTORS_PER_RADIUS;

  return (
    <div className="relative">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          <marker
            id="arrow"
            markerWidth="4"
            markerHeight="4"
            refX="0"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 4 2, 0 4" fill="context-stroke" />
          </marker>

          <motion.g id="radiusOfVectors">
            {Array.from({ length: NUMBER_OF_VECTORS_PER_RADIUS }, (_, i) => {
              const currentVectorProgress = transformValue(() =>
                Math.max(
                  0,
                  Math.min(
                    1,
                    (radiusProgress.get() - i / NUMBER_OF_VECTORS_PER_RADIUS) /
                      (i / NUMBER_OF_VECTORS_PER_RADIUS)
                  )
                )
              );

              currentVectorProgress.on("change", (v) => {
                if (i === 0) console.log("Current opacity:", v);
              });

              const index =
                ((displacementMap.get().length * i) /
                  NUMBER_OF_VECTORS_PER_RADIUS) |
                0;

              const magnitude = springValue(
                transformValue(
                  () =>
                    currentVectorProgress.get() * displacementMap.get()[index]
                ),
                {
                  stiffness: 100,
                  damping: 30,
                  mass: 1,
                }
              );
              const magnitudeScaled = transformValue(
                () => ((magnitude.get() / maximumDisplacement.get()) * plot) / 2
              );
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
              const x2 = transformValue(
                () => borderX + plot * i + magnitudeScaled.get()
              );

              return (
                <motion.line
                  key={i}
                  x1={borderX + plot * i}
                  y1={borderY}
                  x2={x2}
                  y2={borderY}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  opacity={currentVectorProgress}
                  markerEnd="url(#arrow)"
                />
              );
            })}
          </motion.g>
        </defs>

        <motion.g transform={`translate(0, 0)`}>
          <circle
            cx={canvasWidth / 2}
            cy={canvasHeight / 2}
            r={radius}
            fill="none"
            className="stroke-slate-400/30 dark:stroke-slate-500/30 fill-slate-500/10 dark:fill-slate-500/10"
            strokeWidth={1}
          />

          {Array.from({ length: NUMBER_OF_RADIUSES }, (_, j) => {
            const angle = transformValue(() => {
              const rotation = Math.min(
                1,
                revolutionProgress.get() / (j / NUMBER_OF_RADIUSES)
              );
              return Math.PI * 2 * (j / NUMBER_OF_RADIUSES) * rotation;
            });

            return (
              <motion.use
                key={j}
                href="#radiusOfVectors"
                style={{
                  opacity: transformValue(() =>
                    j === 0 || radiusProgress.get() === 1 ? 1 : 0
                  ),
                  rotate: transformValue(() => `${angle.get()}rad`),
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transformBox: "view-box",
                }}
              />
            );
          })}
        </motion.g>
      </svg>

      <div className="absolute bottom-4 right-4 flex items-end justify-center gap-2">
        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={() => {
            animate(revolutionProgress, 1, {
              duration: 2,
              ease: "easeInOut",
            });
          }}
        >
          <FanIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform"
          />
        </button>

        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={() => {
            bezelHeightFn.set((x) => {
              return 1 - Math.sqrt(1 - (1 - x) ** 2);
            });
          }}
        >
          <CogIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform"
          />
        </button>

        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={() => {
            bezelHeightFn.set((x) => {
              const circle = Math.sqrt(1 - (1 - x * 2) ** 2);
              const sin = Math.cos((x + 0.5) * 2 * Math.PI) / 40 + 0.5;
              const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
              const ratioCircle = 1 - smootherstep;
              return circle * ratioCircle + sin * (1 - ratioCircle);
            });
          }}
        >
          <CogIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform"
          />
        </button>

        <button
          className="group bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
          onClick={() => {
            bezelHeightFn.set((x) => {
              return Math.sqrt(1 - (1 - x) ** 2);
            });
          }}
        >
          <BoxIcon
            size={20}
            className="group-hover:scale-110 group-active:scale-90 transition-transform"
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
