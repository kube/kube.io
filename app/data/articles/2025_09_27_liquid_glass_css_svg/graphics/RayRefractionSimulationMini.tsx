import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { useState } from "react";
import { getRayColor } from "../lib/rayColor";

type Ray = {
  originX: number;
  vector: [number, number];
};

type RayWithRefraction = Ray & {
  segments: { x1: number; y1: number; x2: number; y2: number }[];
};

const AIR_REFRACTIVE_INDEX = 1;
const GLASS_REFRACTIVE_INDEX = 1.5;

function refract(
  incident: [number, number],
  normal: [number, number],
  n1: number,
  n2: number
): [number, number] | null {
  console.log("Refracting", incident, normal, n1, n2);

  const dot = incident[0] * normal[0] + incident[1] * normal[1];
  const eta = n1 / n2;
  const k = 1 - eta * eta * (1 - dot * dot);

  if (k < 0) {
    // Total internal reflection
    return null;
  }

  const refracted: [number, number] = [
    eta * incident[0] - (eta * dot + Math.sqrt(k)) * normal[0],
    eta * incident[1] - (eta * dot + Math.sqrt(k)) * normal[1],
  ];

  return refracted;
}

/** Build the glass outline with symmetric bezels (similar to the full simulation). */
function buildGlassOutlinePath(
  glassX: number,
  glassY: number,
  glassWidth: number,
  glassHeight: number,
  bezelWidth: number,
  bezelHeightFn: (x: number) => number,
  samples: number
): string {
  const head = `M ${glassX} ${glassY + glassHeight}`;
  const leftBezel = Array.from({ length: samples }, (_, i) => {
    const x = i / samples;
    const y = bezelHeightFn(x);
    return `L ${glassX + x * bezelWidth} ${glassY + (1 - y) * bezelWidth}`;
  }).join(" ");
  const bottomJoin = `L ${glassX + glassWidth - bezelWidth} ${
    glassY + (1 - bezelHeightFn(1)) * bezelWidth
  }`;
  const rightBezel = Array.from({ length: samples }, (_, i) => {
    const x = 1 - i / samples;
    const y = bezelHeightFn(x);
    return `L ${glassX + glassWidth - x * bezelWidth} ${
      glassY + (1 - y) * bezelWidth
    }`;
  }).join(" ");
  const tail = `L ${glassX + glassWidth} ${glassY + glassHeight} Z`;
  return [head, leftBezel, bottomJoin, rightBezel, tail].join("\n");
}

type RayRefractionSimulationMiniProps = {
  bezelHeightFn?: (x: number) => number;
  bezelWidth?: number;
  glassThickness?: number;
  refractionIndex?: number;
  // Interaction via MotionValue: normalized [0..1] within bezel width; null = no ray
  currentX: MotionValue<number | null>;
};

export const RayRefractionSimulationMini: React.FC<
  RayRefractionSimulationMiniProps
> = ({
  bezelHeightFn = (x) => x * x,
  bezelWidth = 150,
  glassThickness = 200,
  refractionIndex = GLASS_REFRACTIVE_INDEX,
  currentX,
}) => {
  const viewWidth = 320;
  const viewHeight = 240;

  const backgroundWidth = viewWidth;
  const backgroundHeight = 10;
  const glassWidth = 500;

  const glassX = 50;
  const glassY = viewHeight - backgroundHeight - glassThickness - bezelWidth;
  const glassHeight = glassThickness + bezelWidth;

  const ray: Ray | null =
    typeof currentX.get() === "number"
      ? {
          // Map normalized distance [0..1] to left bezel [glassX .. glassX + bezelWidth]
          originX: glassX + (currentX.get() as number) * bezelWidth,
          vector: [0, 1],
        }
      : null;

  function getRayHit(
    ray: Ray
  ): { point: [number, number]; normal: [number, number] } | null {
    if (ray.vector[0] !== 0 || ray.vector[1] !== 1) {
      throw new Error("Only vertical rays are supported for this example.");
    }

    // Ray does not hit glass
    if (ray.originX < glassX || ray.originX >= glassX + glassWidth) {
      return null;
    }

    const isLeftSide = ray.originX < glassX + bezelWidth;
    const isRightSide = ray.originX > glassX + glassWidth - bezelWidth;

    const x = isLeftSide
      ? (ray.originX - glassX) / bezelWidth
      : isRightSide
      ? (glassX + glassWidth - ray.originX) / bezelWidth
      : 1; // Middle of the glass

    const y = bezelHeightFn(x);

    if (x === 1) {
      // Ray hits the flat top surface of the glass interior
      return {
        point: [ray.originX, glassY + (1 - y) * bezelWidth],
        normal: [0, -1],
      };
    }

    const dx = 0.0001; // Small delta for derivative calculation
    const y2 = bezelHeightFn(x + dx);
    const derivative = (y2 - y) / dx;
    const magnitude = Math.sqrt(derivative * derivative + 1);
    const normal: [number, number] = isRightSide
      ? [derivative / magnitude, -1 / magnitude]
      : [-derivative / magnitude, -1 / magnitude];
    const point: [number, number] = [
      ray.originX,
      glassY + (1 - y) * bezelWidth,
    ];
    return { point, normal };
  }

  function calculateRefraction(ray: Ray): RayWithRefraction {
    const hit = getRayHit(ray);
    if (!hit) {
      return {
        ...ray,
        segments: [
          {
            x1: ray.originX,
            x2: ray.originX,
            y1: 0,
            y2: viewHeight - backgroundHeight,
          },
        ],
      };
    }
    const refractedVector = refract(
      ray.vector,
      hit.normal,
      AIR_REFRACTIVE_INDEX,
      refractionIndex
    );

    const firstSegment: {
      x1: number;
      x2: number;
      y1: number;
      y2: number;
    } = { x1: ray.originX, y1: 0, x2: hit.point[0], y2: hit.point[1] };

    const remainingHeight = viewHeight - backgroundHeight - hit.point[1];

    return {
      ...ray,
      segments: refractedVector
        ? [
            firstSegment,
            {
              x1: hit.point[0],
              y1: hit.point[1],
              x2:
                hit.point[0] +
                (refractedVector[0] / refractedVector[1]) * remainingHeight,
              y2: viewHeight - backgroundHeight,
            },
          ]
        : [firstSegment],
    };
  }

  const refractedRay = ray && calculateRefraction(ray);

  // Compute maximum displacement across the viewport to normalize intensity
  const maximumDisplacement = useTransform(() => {
    const samples = 256;
    let max = 0;
    for (let i = 0; i < samples; i++) {
      const sampleX = (i / (samples - 1)) * viewWidth;
      const r = calculateRefraction({ originX: sampleX, vector: [0, 1] });
      const hasRefracted = r.segments.length > 1;
      const bottomX = hasRefracted
        ? r.segments[r.segments.length - 1].x2
        : r.originX;
      const disp = Math.abs(bottomX - r.originX);
      if (disp > max) max = disp;
    }
    return max;
  });

  const displacementIntensity = useTransform(() => {
    if (!refractedRay) return 0;
    const hasRefracted = refractedRay.segments.length > 1;
    const bottomX = hasRefracted
      ? refractedRay.segments[refractedRay.segments.length - 1].x2
      : refractedRay.originX;
    const disp = Math.abs(bottomX - refractedRay.originX);
    const max = maximumDisplacement.get() || 1;
    return disp / max;
  });

  const displacementColor = useTransform(displacementIntensity, getRayColor);
  const displacementThickness = useTransform(
    displacementIntensity,
    (intensity) => 0.3 + intensity * 4
  );

  // Force a lightweight re-render when currentX MotionValue changes so geometry updates.
  const [, forceRender] = useState(0);
  useMotionValueEvent(currentX, "change", () =>
    forceRender((t) => (t + 1) % 1000)
  );

  // samples handled inside buildGlassOutlinePath

  return (
    <>
      <motion.svg
        className="w-full"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        onPointerDown={(e) => {
          const { left, width } = e.currentTarget.getBoundingClientRect();
          const xRatio = (e.clientX - left) / width; // 0..1 across the SVG element width
          const pointerX = xRatio * viewWidth;
          // Normalize to distance from left border within the left bezel
          const normalized = (pointerX - glassX) / bezelWidth;
          currentX.set(normalized);
          try {
            (
              e.currentTarget as Element & { setPointerCapture: any }
            ).setPointerCapture((e as any).pointerId);
          } catch {}
        }}
        onPointerMove={(e) => {
          if (!(e.buttons & 1)) return; // Only when primary button pressed
          const { left, width } = e.currentTarget.getBoundingClientRect();
          const xRatio = (e.clientX - left) / width;
          const pointerX = xRatio * viewWidth;
          const normalized = (pointerX - glassX) / bezelWidth;
          currentX.set(normalized);
        }}
      >
        <path
          d={buildGlassOutlinePath(
            glassX,
            glassY,
            glassWidth,
            glassHeight,
            bezelWidth,
            bezelHeightFn,
            64
          )}
          className="select-none fill-slate-400/30 dark:fill-slate-400/20 stroke-slate-600/20 dark:stroke-slate-400/20"
          strokeWidth="1.5"
        />

        <rect
          width={backgroundWidth}
          height={backgroundHeight}
          x={0}
          y={viewHeight - backgroundHeight}
          rx={2}
          fill="rgba(100, 100, 110, 0.1)"
        />
        {refractedRay?.segments.map((segment, index) => (
          <line
            key={index}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke={index === 0 ? getRayColor(0) : getRayColor(0.3)}
            strokeWidth="3"
          />
        ))}
        {/* Incident Ray Projection (to the background), matching the main sim */}
        {refractedRay && (
          <line
            x1={refractedRay.originX}
            y1={refractedRay.segments[0].y2}
            x2={refractedRay.originX}
            y2={viewHeight - backgroundHeight}
            stroke={getRayColor(0)}
            strokeWidth="1"
            strokeDasharray="3"
            strokeOpacity="0.5"
          />
        )}

        <defs>
          <marker
            id="arrow-displacement-vector-mini"
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

        {refractedRay && (
          <motion.line
            style={{
              display: refractedRay.segments.length > 1 ? "block" : "none",
            }}
            x1={refractedRay.originX}
            y1={viewHeight - backgroundHeight}
            x2={refractedRay.segments[refractedRay.segments.length - 1].x2}
            y2={viewHeight - backgroundHeight}
            stroke={displacementColor as unknown as string}
            strokeWidth={displacementThickness as unknown as number}
            markerEnd="url(#arrow-displacement-vector-mini)"
          />
        )}
      </motion.svg>
    </>
  );
};
