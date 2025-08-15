import { BoxIcon, CogIcon, RotateCcwIcon } from "lucide-react";
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
    const circle = Math.sqrt(1 - (1 - x * 2) ** 2);
    const sin = Math.cos((x + 0.5) * 2 * Math.PI) / 40 + 0.5;
    const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    const ratioCircle = 1 - smootherstep;
    return circle * ratioCircle + sin * (1 - ratioCircle);
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
  const NUMBER_OF_VECTORS_PER_RADIUS = 12;

  const canvasWidth = 400;
  const canvasHeight = 300;

  const centerX = 200;
  const centerY = 150;

  const radius = 130;

  const revolutionProgress = useMotionValue(1);

  async function startAnimation() {
    revolutionProgress.set(0);

    bezelHeightFn.set((x: number) => {
      return Math.sqrt(1 - (1 - x) ** 2);
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    await animate([
      [
        revolutionProgress,
        1 - 1 / NUMBER_OF_RADIUSES,
        { duration: 2, ease: "easeInOut" },
      ],
    ]);

    bezelHeightFn.set((x: number) => {
      const circle = Math.sqrt(1 - (1 - x * 2) ** 2);
      const sin = Math.cos((x + 0.5) * 2 * Math.PI) / 40 + 0.5;
      const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
      const ratioCircle = 1 - smootherstep;
      return circle * ratioCircle + sin * (1 - ratioCircle);
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    bezelHeightFn.set((x: number) => {
      return 1 - Math.sqrt(1 - (1 - x) ** 2);
    });
  }

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
          <marker
            id="dot"
            markerWidth="2"
            markerHeight="2"
            refX="1"
            refY="1"
            orient="auto"
          >
            <circle cx="1" cy="1" r="1" fill="context-stroke" />
          </marker>
        </defs>

        <motion.g transform={`translate(70, 0)`}>
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

            const borderX = centerX - radius;
            const borderY = centerY;

            const plot =
              ((centerX - borderX) * (bezelWidth / radius)) /
              NUMBER_OF_VECTORS_PER_RADIUS;

            return (
              <motion.g
                key={j}
                style={{
                  rotate: transformValue(() => `${angle.get()}rad`),
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transformBox: "view-box",
                }}
              >
                {Array.from(
                  { length: NUMBER_OF_VECTORS_PER_RADIUS },
                  (_, i) => {
                    const index =
                      ((displacementMap.get().length * i) /
                        NUMBER_OF_VECTORS_PER_RADIUS) |
                      0;

                    const magnitude = springValue(
                      transformValue(() => displacementMap.get()[index]),
                      {
                        stiffness: 100,
                        damping: 30,
                        mass: 1,
                      }
                    );
                    const magnitudeScaled = transformValue(
                      () =>
                        ((magnitude.get() / maximumDisplacement.get()) * plot) /
                        2
                    );
                    const color = transformValue(
                      () =>
                        `hsl(${
                          180 +
                          Math.abs(
                            magnitude.get() / maximumDisplacement.get()
                          ) *
                            90
                        },95%,45%)`
                    );
                    const strokeWidth = transformValue(
                      () =>
                        0.3 +
                        Math.abs(magnitude.get() / maximumDisplacement.get()) *
                          1.3
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
                        markerEnd="url(#arrow)"
                        markerStart="url(#dot)"
                      />
                    );
                  }
                )}
              </motion.g>
            );
          })}
        </motion.g>
      </svg>

      <button
        className="group absolute bottom-4 right-46 bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
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
        className="group absolute bottom-4 right-32 bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
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
        className="group absolute bottom-4 right-18 bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
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
        className="group absolute bottom-4 right-4 bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors"
        onClick={startAnimation}
      >
        <RotateCcwIcon
          size={20}
          className="group-hover:scale-110 group-active:scale-90 transition-transform"
        />
      </button>
    </div>
  );
};
