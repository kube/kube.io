import { animate } from "motion";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import {
  ConcaveButton,
  ConvexButton,
  LipButton,
  ReplayButton,
} from "./Buttons";
import { getRayColor } from "./rayColor";

const CONCAVE_BEZEL_FN = (x: number) => 1 - Math.sqrt(1 - (1 - x) ** 2);
const CONVEX_BEZEL_FN = (x: number) => Math.sqrt(1 - (1 - x) ** 2);
const LIP_BEZEL_FN = (x: number) => {
  const circle = Math.sqrt(1 - (1 - x * 2) ** 2);
  const sin = Math.cos((x + 0.5) * 2 * Math.PI) / 40 + 0.5;
  const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  const ratioCircle = 1 - smootherstep;
  return circle * ratioCircle + sin * (1 - ratioCircle);
};

type Ray = {
  originX: number;
  hitPoint: [number, number];
  refracted: { x1: number; y1: number; x2: number; y2: number } | null;
};

const GLASS_REFRACTIVE_INDEX = 1.5;

// Simplified refraction, which only handles fully vertical incident ray [0, 1]
function refract(
  normalX: number,
  normalY: number,
  refractiveIndex: number
): [number, number] | null {
  const dot = normalY * normalY; // Normal vector squared
  const eta = 1 / refractiveIndex;
  const k = 1 - eta * eta * (1 - dot);
  if (k < 0) {
    // Total internal reflection
    return null;
  }
  const kSqrt = Math.sqrt(k);
  return [-(eta * dot + kSqrt) * normalX, eta - (eta * dot + kSqrt) * normalY];
}

export const RayRefractionSimulation: React.FC = () => {
  const glassWidth = 400;
  const glassHeight = 200;

  const viewWidth = 600;
  const viewHeight = 300;

  const bezelWidth = useMotionValue(100);

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

  const refractionIndex = useMotionValue(GLASS_REFRACTIVE_INDEX);
  const currentX = useMotionValue((glassWidth - viewWidth) / 2);
  const [surface, setSurface] = useState<"convex" | "concave" | "lip">(
    "convex"
  );

  const backgroundWidth = viewWidth;
  const backgroundHeight = 40;

  const glassX = 100;
  const glassY = viewHeight - backgroundHeight - glassHeight;

  function getRayHit(
    rayX: number
  ): { point: [number, number]; normal: [number, number] } | null {
    // Ray does not hit glass
    if (rayX < glassX || rayX >= glassX + glassWidth) {
      return null;
    }
    const bezelWidth_ = bezelWidth.get();
    const bezelHeightFn_ = bezelHeightFn.get();

    const isLeftSide = rayX < glassX + bezelWidth_;
    const isRightSide = rayX > glassX + glassWidth - bezelWidth_;

    const x = isLeftSide
      ? (rayX - glassX) / bezelWidth_
      : isRightSide
      ? (glassX + glassWidth - rayX) / bezelWidth_
      : 1; // Middle of the glass

    const y = bezelHeightFn_(x);

    if (x === 1) {
      // Ray hits the bottom of the glass
      return {
        point: [rayX, glassY + (1 - y) * bezelWidth_],
        normal: [0, -1],
      };
    }
    const point: [number, number] = [rayX, glassY + (1 - y) * bezelWidth_];

    // Calculate the normal vector at the hit point
    const dx = 0.0001; // Small delta for derivative calculation
    const y2 = bezelHeightFn_(x + dx);
    const derivative = (y2 - y) / dx;
    const magnitude = Math.sqrt(derivative * derivative + 1);
    const normal: [number, number] = isRightSide
      ? [derivative / magnitude, -1 / magnitude]
      : [-derivative / magnitude, -1 / magnitude];

    return { point, normal };
  }

  function calculateRefraction(rayX: number, refractionIndex: number): Ray {
    const hit = getRayHit(rayX);
    if (!hit) {
      return {
        originX: rayX,
        hitPoint: [rayX, viewHeight - backgroundHeight],
        refracted: null,
      };
    }
    const refractedVector = refract(
      hit.normal[0],
      hit.normal[1],
      refractionIndex
    );

    return {
      originX: rayX,
      hitPoint: hit.point,
      refracted: refractedVector && {
        x1: hit.point[0],
        y1: hit.point[1],
        x2:
          hit.point[0] +
          (refractedVector[0] *
            (viewHeight - backgroundHeight - hit.point[1])) /
            refractedVector[1],
        y2: viewHeight - backgroundHeight,
      },
    };
  }

  const [isPanning, setIsPanning] = useState(false);
  useEffect(() => {
    if (!isPanning) return;
    // Add event listener for mouse up to stop panning
    const handleMouseUp = () => setIsPanning(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isPanning]);

  const NUMBER_OF_SAMPLES = 64;

  const ray = useTransform(() =>
    calculateRefraction(currentX.get(), refractionIndex.get())
  );

  const maximumDisplacement = useTransform(() => {
    let maxDisplacement = 0;
    for (let i = 0; i < NUMBER_OF_SAMPLES; i++) {
      const x = i / NUMBER_OF_SAMPLES;

      const hit = getRayHit(glassX + x);
      if (!hit) continue;
      const refracted = refract(
        hit.normal[0],
        hit.normal[1],
        refractionIndex.get()
      );
      if (!refracted) continue;
      const displacement = Math.abs(hit.point[0] - refracted[0]);
      if (displacement > maxDisplacement) {
        maxDisplacement = displacement;
      }
    }
    return maxDisplacement;
  });

  const displacementIntensity = useTransform(() => {
    const { originX, refracted } = ray.get();
    if (!refracted) return 0;
    const displacement = Math.abs(refracted.x2 - originX);
    const ratio = displacement / maximumDisplacement.get();
    console.log("Displacement Ratio:", ratio);
    return ratio;
  });

  const displacementColor = useTransform(displacementIntensity, getRayColor);
  const displacementThickness = useTransform(
    displacementIntensity,
    (intensity) => 0.3 + intensity * 4
  );

  const surfacePath = useTransform(() => {
    const bezelHeightFn_ = bezelHeightFn.get();
    const bezelWidth_ = bezelWidth.get();

    return `M ${glassX} ${glassY + glassHeight}

    ${Array.from({ length: NUMBER_OF_SAMPLES }, (_, i) => {
      const x = i / NUMBER_OF_SAMPLES;
      const y = bezelHeightFn_(x);
      return `L ${glassX + x * bezelWidth_} ${glassY + (1 - y) * bezelWidth_}`;
    }).join(" ")}
      
      L ${glassX + glassWidth - bezelWidth_} ${
      glassY + (1 - bezelHeightFn_(1)) * bezelWidth_
    }

    ${Array.from({ length: NUMBER_OF_SAMPLES }, (_, i) => {
      const x = 1 - i / NUMBER_OF_SAMPLES;
      const y = bezelHeightFn_(x);
      return `L ${glassX + glassWidth - x * bezelWidth_} ${
        glassY + (1 - y) * bezelWidth_
      }`;
    }).join(" ")}

    L ${glassX + glassWidth} ${glassY + glassHeight}
    Z`;
  });

  return (
    <div className="relative w-full h-full">
      <motion.svg
        className="w-full"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        onClick={(e) => {
          const { left, width } = e.currentTarget.getBoundingClientRect();
          const xRatio = (e.clientX - left) / width;
          currentX.set(xRatio * viewWidth);
        }}
        onMouseDown={() => setIsPanning(true)}
        onMouseUp={() => setIsPanning(false)}
        onMouseMove={(e) => {
          if (!isPanning) return;
          const { left, width } = e.currentTarget!.getBoundingClientRect();
          const xRatio = (e.clientX - left) / width;
          currentX.set(xRatio * viewWidth);
        }}
      >
        <defs>
          <marker
            id="arrow-displacement-vector"
            viewBox="0 0 4 4"
            markerWidth="4"
            markerHeight="4"
            refX="0"
            refY="2"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <motion.path d="M0,0 L4,2 L0,4 Z" fill={displacementColor} />
          </marker>
        </defs>

        <motion.path
          d={surfacePath}
          className="select-none fill-slate-400/30 dark:fill-slate-400/20 stroke-slate-600/20 dark:stroke-slate-400/20"
          strokeWidth="1.5"
        />

        <motion.text
          className="select-none opacity-50 fill-black dark:fill-white"
          x={glassX + glassWidth / 2}
          y={useTransform(
            () =>
              glassY +
              (glassHeight + (1 - bezelHeightFn.get()(1)) * bezelWidth.get()) /
                2
          )}
          fontSize="16"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Glass
        </motion.text>

        <rect
          width={backgroundWidth}
          height={backgroundHeight}
          x={0}
          y={viewHeight - backgroundHeight}
          rx={4}
          className="fill-slate-400/10 dark:fill-slate-700/20"
        />

        <text
          className="select-none opacity-30 fill-black dark:fill-white"
          x={backgroundWidth / 2}
          y={viewHeight - backgroundHeight / 2}
          fontSize="16"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Background
        </text>

        {/* Incident Ray */}
        <motion.line
          x1={currentX}
          y1={0}
          x2={currentX}
          y2={useTransform(() => ray.get().hitPoint[1])}
          stroke={getRayColor(0)}
          strokeWidth="3"
        />

        {/* Refracted Ray */}
        <motion.line
          style={{
            display: useTransform(() =>
              ray.get().refracted ? "block" : "none"
            ),
          }}
          x1={useTransform(ray, (_) => _.hitPoint[0])}
          y1={useTransform(ray, (_) => _.hitPoint[1])}
          x2={useTransform(ray, (_) => _.refracted?.x2 ?? 0)}
          y2={useTransform(ray, (_) => _.refracted?.y2 ?? 0)}
          stroke={getRayColor(0.3)}
          strokeWidth="3"
        />

        {/* Incident Ray Projection */}
        <motion.line
          x1={currentX}
          y1={useTransform(() => ray.get().hitPoint[1])}
          x2={currentX}
          y2={viewHeight - backgroundHeight}
          stroke={getRayColor(0)}
          strokeWidth="1"
          strokeDasharray="3"
          strokeOpacity="0.5"
          className="select-none"
        />

        {/* Displacement on background */}
        <motion.line
          x1={useTransform(ray, (_) => _.hitPoint[0])}
          y1={viewHeight - backgroundHeight}
          x2={useTransform(ray, (_) => _.refracted?.x2 ?? 0)}
          y2={viewHeight - backgroundHeight}
          stroke={displacementColor}
          strokeWidth={displacementThickness}
          className="select-none"
          style={{
            display: useTransform(() =>
              ray.get().refracted ? "block" : "none"
            ),
          }}
          markerEnd="url(#arrow-displacement-vector)"
        />
      </motion.svg>

      <div className="py-8 flex items-center">
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <ConvexButton
            active={surface === "convex"}
            onClick={() => {
              setSurface("convex");
              bezelHeightFn_target.set(CONVEX_BEZEL_FN);
            }}
          />
          <ConcaveButton
            active={surface === "concave"}
            onClick={() => {
              setSurface("concave");
              bezelHeightFn_target.set(CONCAVE_BEZEL_FN);
            }}
          />
          <LipButton
            active={surface === "lip"}
            onClick={() => {
              setSurface("lip");
              bezelHeightFn_target.set(LIP_BEZEL_FN);
            }}
          />
        </div>
        <div className="flex-1 flex justify-end">
          <ReplayButton
            onClick={() => {
              animate([
                [
                  currentX,
                  viewWidth / 2,
                  {
                    duration: 0.5,
                    ease: "easeInOut",
                  },
                ],
                [
                  currentX,
                  (viewWidth - glassWidth) / 2,
                  {
                    duration: 1,
                    ease: "easeInOut",
                  },
                ],
                [
                  currentX,
                  (viewWidth - glassWidth) / 2 + glassWidth,
                  {
                    duration: 2,
                    ease: "easeInOut",
                  },
                ],
                [
                  currentX,
                  viewWidth / 2,
                  {
                    duration: 1,
                    ease: "easeInOut",
                  },
                ],
              ]);
            }}
          />
        </div>
      </div>
    </div>
  );
};
