import { animate } from "motion";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { ReplayButton } from "../components/Buttons";
import {
  SurfaceEquationSelector,
  SurfaceType,
} from "../components/SurfaceEquationSelector";
import { getRayColor } from "../lib/rayColor";
import { CONCAVE, CONVEX, CONVEX_CIRCLE, LIP } from "../lib/surfaceEquations";

/**
 * Ray segments used to render the incident and refracted rays.
 * originX is the x position at the top of the viewport for the incident ray.
 * hitPoint is the intersection with the glass surface.
 * refracted is null if no refraction occurs (no hit or total internal reflection).
 */
type Ray = {
  originX: number;
  hitPoint: [number, number];
  refracted: { x1: number; y1: number; x2: number; y2: number } | null;
};

const GLASS_REFRACTIVE_INDEX = 1.5;
const NUMBER_OF_SAMPLES = 64;

/** Maps normalized bezel x in [0..1] to a normalized height in [0..1]. */
type BezelFn = (x: number) => number;

// Simplified refraction, which only handles a fully vertical incident ray [0, 1]
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

/**
 * Compute intersection point and surface normal for a vertical ray at x.
 * Returns null if the ray is outside the glass bounds.
 */
function getHitAndNormal(
  rayX: number,
  glassX: number,
  glassWidth: number,
  glassY: number,
  bezelWidth: number,
  bezelHeightFn: BezelFn
): { point: [number, number]; normal: [number, number] } | null {
  if (rayX < glassX || rayX >= glassX + glassWidth) return null;

  const isLeftSide = rayX < glassX + bezelWidth;
  const isRightSide = rayX > glassX + glassWidth - bezelWidth;

  const x = isLeftSide
    ? (rayX - glassX) / bezelWidth
    : isRightSide
    ? (glassX + glassWidth - rayX) / bezelWidth
    : 1;

  const y = bezelHeightFn(x);
  const point: [number, number] = [rayX, glassY + (1 - y) * bezelWidth];
  if (x === 1) return { point, normal: [0, -1] };

  const dx = 0.0001;
  const y2 = bezelHeightFn(x + dx);
  const derivative = (y2 - y) / dx;
  const magnitude = Math.sqrt(derivative * derivative + 1);
  const normal: [number, number] = isRightSide
    ? [derivative / magnitude, -1 / magnitude]
    : [-derivative / magnitude, -1 / magnitude];
  return { point, normal };
}

/**
 * Build a Ray from x, computing refraction if applicable using Snell’s law.
 */
function computeRefractionAtX(
  rayX: number,
  refractionIndex: number,
  viewHeight: number,
  backgroundHeight: number,
  glassX: number,
  glassWidth: number,
  glassY: number,
  bezelWidth: number,
  bezelHeightFn: BezelFn
): Ray {
  const hit = getHitAndNormal(
    rayX,
    glassX,
    glassWidth,
    glassY,
    bezelWidth,
    bezelHeightFn
  );
  if (!hit) {
    return {
      originX: rayX,
      hitPoint: [rayX, viewHeight - backgroundHeight],
      refracted: null,
    };
  }
  const v = refract(hit.normal[0], hit.normal[1], refractionIndex);
  return {
    originX: rayX,
    hitPoint: hit.point,
    refracted: v && {
      x1: hit.point[0],
      y1: hit.point[1],
      x2:
        hit.point[0] +
        (v[0] * (viewHeight - backgroundHeight - hit.point[1])) / v[1],
      y2: viewHeight - backgroundHeight,
    },
  };
}

/**
 * Build the SVG path describing the glass outline with bezels on both sides.
 */
function buildGlassOutlinePath(
  glassX: number,
  glassY: number,
  glassWidth: number,
  glassHeight: number,
  bezelWidth: number,
  bezelHeightFn: BezelFn,
  samples: number
): string {
  const head = `M ${glassX} ${glassY + glassHeight}`;
  const leftBezel = Array.from({ length: samples }, (_, i) => {
    const x = i / (samples - 1);
    const y = bezelHeightFn(x);
    return `L ${glassX + x * bezelWidth} ${glassY + (1 - y) * bezelWidth}`;
  }).join(" ");
  const bottomJoin = `L ${glassX + glassWidth - bezelWidth} ${
    glassY + (1 - bezelHeightFn(1)) * bezelWidth
  }`;
  const rightBezel = Array.from({ length: samples }, (_, i) => {
    const x = 1 - i / (samples - 1);
    const y = bezelHeightFn(x);
    return `L ${glassX + glassWidth - x * bezelWidth} ${
      glassY + (1 - y) * bezelWidth
    }`;
  }).join(" ");
  const tail = `L ${glassX + glassWidth} ${glassY + glassHeight}`;
  return [head, leftBezel, bottomJoin, rightBezel, tail].join("\n\n");
}

export const RayRefractionSimulation: React.FC = () => {
  // Viewport & geometry (px)
  const glassWidth = 400;
  const glassHeight = 200;
  const viewWidth = 600;
  const viewHeight = 300;

  const bezelWidth = useMotionValue(100);

  // Bezel Height Function (interpolated with animation on change)
  // We morph between functions by animating a progress value and blending
  // between the previous and target functions.
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

  const refractionIndex = useMotionValue(GLASS_REFRACTIVE_INDEX);
  // Incident ray x position, clamped to the viewport width
  const currentX = useMotionValue((glassWidth - viewWidth) / 2);
  const surface = useMotionValue<SurfaceType>("convex_circle");

  const backgroundWidth = viewWidth;
  const backgroundHeight = 40;

  const glassX = 100;
  const glassY = viewHeight - backgroundHeight - glassHeight;

  const calculateRefraction = (rayX: number, n: number) =>
    computeRefractionAtX(
      rayX,
      n,
      viewHeight,
      backgroundHeight,
      glassX,
      glassWidth,
      glassY,
      bezelWidth.get(),
      bezelHeightFn.get()
    );

  // Pointer handling
  const [isPanning, setIsPanning] = useState(false);
  useEffect(() => {
    if (!isPanning) return;
    // Add event listener for mouse up to stop panning
    const handleMouseUp = () => setIsPanning(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isPanning]);

  const ray = useTransform(() =>
    calculateRefraction(currentX.get(), refractionIndex.get())
  );

  // Sample across the viewport to estimate the maximum displacement on the background
  // This scales the displacement thickness/opacity consistently.
  const maximumDisplacement = useTransform(() => {
    let maxDisplacement = 0;
    for (let i = 0; i < NUMBER_OF_SAMPLES; i++) {
      const sampleX = (i / (NUMBER_OF_SAMPLES - 1)) * viewWidth;
      const r = calculateRefraction(sampleX, refractionIndex.get());
      if (!r.refracted) continue;
      const displacement = Math.abs(r.refracted.x2 - r.originX);
      if (displacement > maxDisplacement) maxDisplacement = displacement;
    }
    return maxDisplacement;
  });

  // 0..1 displacement ratio for the current ray, relative to the sampled max
  const displacementIntensity = useTransform(() => {
    const { originX, refracted } = ray.get();
    if (!refracted) return 0;
    const displacement = Math.abs(refracted.x2 - originX);
    const ratio = displacement / maximumDisplacement.get();
    return ratio;
  });

  const displacementColor = useTransform(displacementIntensity, getRayColor);
  const displacementThickness = useTransform(
    displacementIntensity,
    (intensity) => 0.3 + intensity * 4
  );

  const surfacePath = useTransform(() =>
    buildGlassOutlinePath(
      glassX,
      glassY,
      glassWidth,
      glassHeight,
      bezelWidth.get(),
      bezelHeightFn.get(),
      NUMBER_OF_SAMPLES
    )
  );

  // Derived bindings for JSX readability (MotionValues)
  const yGlassLabel = useTransform(
    () =>
      glassY +
      (glassHeight + (1 - bezelHeightFn.get()(1)) * bezelWidth.get()) / 2
  );
  const incidentY2 = useTransform(ray, (r) => r.hitPoint[1]);
  const refractX1 = useTransform(ray, (r) => r.hitPoint[0]);
  const refractY1 = useTransform(ray, (r) => r.hitPoint[1]);
  const refractX2 = useTransform(ray, (r) => r.refracted?.x2 ?? 0);
  const refractY2 = useTransform(ray, (r) => r.refracted?.y2 ?? 0);
  const showRefracted = useTransform(ray, (r) =>
    r.refracted ? "block" : "none"
  );

  // Handlers
  // Clamp helper
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  // Translate pointer x to viewport coordinates and clamp to [0..viewWidth]
  const handlePointer = (clientX: number, bounds: DOMRect) => {
    const xRatio = (clientX - bounds.left) / bounds.width;
    currentX.set(clamp(xRatio * viewWidth, 0, viewWidth));
  };

  return (
    <div className="relative h-full -ml-[15px] w-[calc(100%+30px)]">
      <motion.svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        onClick={(e) =>
          handlePointer(e.clientX, e.currentTarget.getBoundingClientRect())
        }
        onMouseDown={() => setIsPanning(true)}
        onMouseUp={() => setIsPanning(false)}
        onMouseMove={(e) => {
          if (!isPanning) return;
          handlePointer(e.clientX, e.currentTarget.getBoundingClientRect());
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
          className="select-none fill-slate-400/30 dark:fill-slate-400/20 stroke-slate-600/20 dark:stroke-slate-400/30"
          strokeWidth="1.5"
        />

        <motion.text
          className="select-none opacity-50 fill-black dark:fill-white"
          x={glassX + glassWidth / 2}
          y={yGlassLabel}
          fontSize="16"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Glass
        </motion.text>

        <line
          x1="0"
          y1={viewHeight - backgroundHeight}
          x2={viewWidth}
          y2={viewHeight - backgroundHeight}
          className="select-none stroke-slate-400/40 dark:stroke-slate-400/30"
          strokeWidth="1.5"
        />

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
          y2={incidentY2}
          stroke={getRayColor(0)}
          strokeWidth="3"
        />

        {/* Refracted Ray */}
        <motion.line
          style={{ display: showRefracted }}
          x1={refractX1}
          y1={refractY1}
          x2={refractX2}
          y2={refractY2}
          stroke={getRayColor(0.3)}
          strokeWidth="3"
        />

        {/* Incident Ray Projection (to the background) */}
        <motion.line
          x1={currentX}
          y1={incidentY2}
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
          x1={refractX1}
          y1={viewHeight - backgroundHeight}
          x2={refractX2}
          y2={viewHeight - backgroundHeight}
          stroke={displacementColor}
          strokeWidth={displacementThickness}
          className="select-none"
          style={{ display: showRefracted }}
          markerEnd="url(#arrow-displacement-vector)"
        />
      </motion.svg>

      <div className="py-8 flex items-center">
        <div className="flex-1" />
        <SurfaceEquationSelector
          surface={surface}
          onSurfaceChange={(newSurface) => {
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
          }}
        />
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
