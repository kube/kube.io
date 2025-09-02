import { animate } from "motion";
import {
  AnimationPlaybackControlsWithThen,
  clamp,
  motion,
  transformValue,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { ReplayButton } from "../components/Buttons";
import { SurfaceEquationSelector } from "../components/SurfaceEquationSelector";
import { calculateDisplacementMap } from "../lib/displacementMap";
import { getRayColor } from "../lib/rayColor";
import { CONCAVE, CONVEX, CONVEX_CIRCLE, LIP } from "../lib/surfaceEquations";

export const DisplacementVectorField: React.FC = () => {
  const glassThickness = 20;
  const refractiveIndex = 1.5;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(wrapperRef, { once: true, amount: 1 });
  useEffect(() => {
    if (isInView) startAnimation();
  }, [isInView]);

  const bezelWidth = 130;

  // Bezel Height Function (interpolated with animation on change)
  const bezelHeightFn_target = useMotionValue(CONVEX.fn);
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

  const NUMBER_OF_RADIUSES = 44;
  const NUMBER_OF_VECTORS_PER_RADIUS = 12;

  const canvasWidth = 300;
  const canvasHeight = 300;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const radius = 135;

  const xAxisRotation = useMotionValue(0);
  const radiusProgress = useMotionValue(1);
  const projectRayOnSurfaceProgress = useMotionValue(1);
  const normalisationProgress = useMotionValue(1);
  const revolutionProgress = useMotionValue(1);
  const surface = useMotionValue<
    "convex_circle" | "convex_squircle" | "concave" | "lip"
  >("convex_circle");

  const NUMBER_OF_SAMPLES = 64;

  const surfacePath = useTransform(() => {
    const fn = bezelHeightFn.get();
    return `
      M ${centerX - radius} ${centerY}

      ${Array.from({ length: NUMBER_OF_SAMPLES }, (_, i) => {
        const x = i / NUMBER_OF_SAMPLES;
        const y = fn(x);
        return `L ${centerX - radius + x * bezelWidth} ${
          centerY - y * bezelWidth
        }`;
      }).join(" ")}

      L ${centerX} ${centerY - fn(1) * bezelWidth}
      L ${centerX} ${centerY}
      Z`;
  });

  const currentAnimation = useRef<AnimationPlaybackControlsWithThen>(null);

  function startAnimation() {
    currentAnimation.current?.stop();

    revolutionProgress.set(0);
    radiusProgress.set(0);
    projectRayOnSurfaceProgress.set(0);
    normalisationProgress.set(0);

    currentAnimation.current = animate([
      [xAxisRotation, 90, { type: "spring", duration: 1, bounce: 0.13 }],
      [radiusProgress, 1, { duration: 2, ease: "linear", at: "-0.6" }],
      [projectRayOnSurfaceProgress, 1, { duration: 0.6, ease: "easeInOut" }],
      [normalisationProgress, 1, { duration: 0.8, ease: "easeInOut" }],
      [xAxisRotation, 65, { type: "spring", duration: 1, bounce: 0.13 }],
      [revolutionProgress, 1, { duration: 2, ease: "easeInOut", at: "-0.6" }],
      [
        xAxisRotation,
        0,
        { type: "spring", duration: 2, bounce: 0.13, at: "-0.8" },
      ],
    ]);
  }

  const borderX = centerX - radius;
  const borderY = centerY;

  const plot =
    ((centerX - borderX) * (bezelWidth / radius)) /
    NUMBER_OF_VECTORS_PER_RADIUS;

  const vectorsInRadius = Array.from(
    { length: NUMBER_OF_VECTORS_PER_RADIUS },
    (_, i) => {
      const currentVectorProgress = transformValue(() =>
        Math.max(
          0,
          Math.min(
            1,
            (radiusProgress.get() - i / NUMBER_OF_VECTORS_PER_RADIUS) /
              (1 - i / NUMBER_OF_VECTORS_PER_RADIUS)
          )
        )
      );
      const refractedRayProgress = transformValue(() =>
        Math.max(0, Math.min(1, currentVectorProgress.get() * 2 - 0.5))
      );
      const index =
        ((displacementMap.get().length * i) / NUMBER_OF_VECTORS_PER_RADIUS) | 0;
      const magnitude = transformValue(
        () => refractedRayProgress.get() * displacementMap.get()[index]
      );
      const magnitudeScaled = transformValue(() => {
        const scale =
          1 /
          (1 +
            (maximumDisplacement.get() - 1) * normalisationProgress.get() ** 2);
        return (magnitude.get() * scale * plot) / 2;
      });
      const display = transformValue(() =>
        refractedRayProgress.get() > 0 ? "block" : "none"
      );
      const color = transformValue(() =>
        getRayColor(magnitude.get() / maximumDisplacement.get())
      );
      const strokeWidth = transformValue(
        () => 0.8 + Math.abs(magnitude.get() / maximumDisplacement.get()) * 1.3
      );
      const x1 = borderX + plot * i;
      const y1 = transformValue(
        () =>
          centerY -
          bezelWidth *
            bezelHeightFn.get()(i / NUMBER_OF_VECTORS_PER_RADIUS) *
            (1 - projectRayOnSurfaceProgress.get())
      );
      const x2 = transformValue(() => x1 + magnitudeScaled.get());
      const y2 = transformValue(
        () => y1.get() + (borderY - y1.get()) * refractedRayProgress.get()
      );
      return {
        color,
        x1,
        x2,
        y1,
        y2,
        currentVectorProgress,
        strokeWidth,
        display,
      };
    }
  );

  return (
    <div
      ref={wrapperRef}
      className="relative -ml-[15px] w-[calc(100%+30px)] my-10"
    >
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full max-h-[500px]"
        transform="translate(0, 0)"
      >
        <defs>
          {
            // Safari compatibility: Create markers for each vector in the radius.
            // markerEnd does not inherit stroke color in Safari.
            vectorsInRadius.map((_, i) => (
              <marker
                key={i}
                id={`arrow-displacement-vector-field-${i}`}
                viewBox="0 0 4 4"
                markerWidth="4"
                markerHeight="4"
                refX="0"
                refY="2"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <motion.path d="M0,0 L4,2 L0,4 Z" fill={_.color} />
              </marker>
            ))
          }

          <motion.g id="radiusOfVectors">
            {vectorsInRadius.map((_, i) => (
              <motion.line
                key={i}
                x1={_.x1}
                y1={_.y1}
                x2={_.x2}
                y2={_.y2}
                stroke={_.color}
                strokeWidth={_.strokeWidth}
                display={_.display}
                strokeLinecap={"round"}
                markerEnd={`url(#arrow-displacement-vector-field-${i})`}
              />
            ))}
          </motion.g>
        </defs>

        <motion.g
          className="[transform-style:preserve-3d]"
          style={{
            transformOrigin: "50% 50%",
            transformBox: "view-box",
            rotateX: xAxisRotation,
            translateY: 0,
            translateZ: 0,
            scale: 1,
          }}
        >
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
              const rotation = clamp(
                0,
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
                  display: transformValue(() =>
                    radiusProgress.get() === 1 ? "block" : "none"
                  ),
                  rotate: transformValue(() => `${angle.get()}rad`),
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transformBox: "view-box",
                }}
              />
            );
          })}
        </motion.g>

        <motion.g
          className="[transform-style:preserve-3d]"
          style={{
            transformOrigin: "bottom center",
            transformBox: "view-box",
            rotateX: useTransform(() => xAxisRotation.get() - 90),
            rotateY: useTransform(() => revolutionProgress.get() * -360),
            translateY: 0,
            translateZ: 0,
            scale: 1,
          }}
        >
          <motion.path
            d={surfacePath}
            className="stroke-slate-400/40 dark:stroke-slate-400/50 fill-slate-200/80 dark:fill-slate-600/80"
            strokeWidth={1}
          />

          {
            // Render the incident rays for each vector in the radius.
            Array.from({ length: NUMBER_OF_VECTORS_PER_RADIUS }, (_, i) => {
              const currentVectorProgress = transformValue(() =>
                Math.max(
                  0,
                  Math.min(
                    1,
                    (radiusProgress.get() - i / NUMBER_OF_VECTORS_PER_RADIUS) /
                      (1 - i / NUMBER_OF_VECTORS_PER_RADIUS)
                  )
                )
              );
              const incidentRayProgress = transformValue(() =>
                Math.min(1, currentVectorProgress.get() * 2)
              );

              const x1 = borderX + plot * i;
              const y1 = 0;
              const x2 = x1;
              const y2 = transformValue(
                () =>
                  centerY -
                  bezelWidth *
                    bezelHeightFn.get()(i / NUMBER_OF_VECTORS_PER_RADIUS)
              );
              const incidentRayLength = transformValue(() =>
                Math.sqrt((x2 - x1) ** 2 + (y2.get() - y1) ** 2)
              );

              return (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={getRayColor(0)}
                  display={transformValue(() =>
                    currentVectorProgress.get() > 0 ? "block" : "none"
                  )}
                  strokeWidth={1}
                  strokeDasharray={incidentRayLength}
                  strokeDashoffset={transformValue(
                    () =>
                      incidentRayLength.get() *
                      (1 - incidentRayProgress.get() * 2)
                  )}
                  opacity={currentVectorProgress}
                />
              );
            })
          }
        </motion.g>

        <motion.g
          className="[transform-style:preserve-3d]"
          style={{
            transformOrigin: "bottom center",
            transformBox: "view-box",
            rotateX: useTransform(() => xAxisRotation.get() - 90),
            rotateY: useTransform(() => revolutionProgress.get() * -360),
            translateY: 0,
            translateZ: 0,
            scale: 1,
          }}
        >
          <motion.use
            href="#radiusOfVectors"
            style={{
              transformOrigin: `${centerX}px ${centerY}px`,
              transformBox: "view-box",
            }}
          />
        </motion.g>
      </svg>

      <div className="mt-4 px-4 flex items-center">
        <div className="flex-1" />
        <SurfaceEquationSelector
          surface={surface}
          onSurfaceChange={async (newSurface) => {
            await animate(xAxisRotation, 65, {
              duration: 0.6,
              ease: "easeInOut",
            });

            switch (newSurface) {
              case "convex_circle":
                bezelHeightFn_target.set(CONVEX_CIRCLE.fn);
                break;
              case "convex_squircle":
                bezelHeightFn_target.set(CONVEX.fn);
                break;
              case "concave":
                bezelHeightFn_target.set(CONCAVE.fn);
                break;
              case "lip":
                bezelHeightFn_target.set(LIP.fn);
                break;
            }

            animate(xAxisRotation, 0, {
              duration: 0.6,
              ease: "easeInOut",
              delay: 1,
            });
          }}
        />
        <div className="flex-1 flex justify-end">
          <ReplayButton onClick={startAnimation} />
        </div>
      </div>
    </div>
  );
};
