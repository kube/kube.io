import { motion, type MotionValue, useTransform } from "motion/react";
import { getRayColorDimmed } from "../lib/rayColor";
import { CONCAVE, CONVEX, CONVEX_CIRCLE, LIP } from "../lib/surfaceEquations";

const AIR_REFRACTIVE_INDEX = 1;
const GLASS_REFRACTIVE_INDEX = 1.5;

function refract(
  incident: [number, number],
  normal: [number, number],
  n1: number,
  n2: number
): [number, number] | null {
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
  const tail = `L ${glassX + glassWidth} ${glassY + glassHeight}`;
  return [head, leftBezel, bottomJoin, rightBezel, tail].join("\n");
}

type RayRefractionSimulationMiniProps = {
  surface?: MotionValue<
    "convex_circle" | "convex_squircle" | "concave" | "lip"
  >;
  bezelWidth: MotionValue<number>;
  glassThickness: MotionValue<number>;
  refractionIndex?: number;
  // Interaction via MotionValue: normalized [0..1] within bezel width; null = no ray
  currentX: MotionValue<number | null>;
};

export const RayRefractionSimulationMini: React.FC<
  RayRefractionSimulationMiniProps
> = ({
  surface,
  bezelWidth,
  glassThickness,
  refractionIndex = GLASS_REFRACTIVE_INDEX,
  currentX,
}) => {
  const viewWidth = 400;
  const viewHeight = 300;

  const backgroundWidth = viewWidth;
  const backgroundHeight = 10;
  const glassWidth = 500;

  const glassX = 50;
  const glassY = useTransform(
    () =>
      viewHeight - backgroundHeight - glassThickness.get() - bezelWidth.get()
  );
  const glassHeight = useTransform(
    () => glassThickness.get() + bezelWidth.get()
  );

  const bezelFn = (x: number) => {
    const s = surface?.get() ?? "convex_circle";
    return s === "convex_circle"
      ? CONVEX_CIRCLE.fn(x)
      : s === "convex_squircle"
      ? CONVEX.fn(x)
      : s === "concave"
      ? CONCAVE.fn(x)
      : LIP.fn(x);
  };

  const incidentX = useTransform(
    () => glassX + (currentX.get() ?? 0) * bezelWidth.get()
  );

  // Build ray and refraction like the main simulation, driven by Motion
  const ray = useTransform(() => {
    const ox = incidentX.get();
    const bw = bezelWidth.get();
    const gy = glassY.get();
    // Outside glass horizontally
    if (ox < glassX || ox >= glassX + glassWidth) {
      return {
        originX: ox,
        hitPoint: [ox, viewHeight - backgroundHeight] as [number, number],
        refracted: null,
      };
    }
    const isLeftSide = ox < glassX + bw;
    const isRightSide = ox > glassX + glassWidth - bw;
    const t = isLeftSide
      ? (ox - glassX) / bw
      : isRightSide
      ? (glassX + glassWidth - ox) / bw
      : 1;
    const y = bezelFn(t);
    const point: [number, number] = [ox, gy + (1 - y) * bw];
    let normal: [number, number];
    if (t === 1) normal = [0, -1];
    else {
      const dx = 0.0001;
      const y2 = bezelFn(t + dx);
      const derivative = (y2 - y) / dx;
      const magnitude = Math.sqrt(derivative * derivative + 1);
      normal = isRightSide
        ? ([derivative / magnitude, -1 / magnitude] as [number, number])
        : ([-derivative / magnitude, -1 / magnitude] as [number, number]);
    }
    const v = refract([0, 1], normal, AIR_REFRACTIVE_INDEX, refractionIndex);
    if (!v) {
      return { originX: ox, hitPoint: point, refracted: null };
    }
    const remainingHeight = viewHeight - backgroundHeight - point[1];
    const x2 = point[0] + (v[0] / v[1]) * remainingHeight;
    return {
      originX: ox,
      hitPoint: point,
      refracted: {
        x1: point[0],
        y1: point[1],
        x2,
        y2: viewHeight - backgroundHeight,
      },
    };
  });

  // Compute maximum displacement across the viewport to normalize intensity
  const maximumDisplacement = useTransform(() => {
    const samples = 256;
    let max = 0;
    for (let i = 0; i < samples; i++) {
      const sampleX = (i / (samples - 1)) * viewWidth;
      const ox = sampleX;
      const bw = bezelWidth.get();
      const gy = glassY.get();
      if (ox < glassX || ox >= glassX + glassWidth) continue;
      const isLeftSide = ox < glassX + bw;
      const isRightSide = ox > glassX + glassWidth - bw;
      const t = isLeftSide
        ? (ox - glassX) / bw
        : isRightSide
        ? (glassX + glassWidth - ox) / bw
        : 1;
      const y = bezelFn(t);
      const py = gy + (1 - y) * bw;
      let normal: [number, number];
      if (t === 1) normal = [0, -1];
      else {
        const dx = 0.0001;
        const y2 = bezelFn(t + dx);
        const derivative = (y2 - y) / dx;
        const magnitude = Math.sqrt(derivative * derivative + 1);
        normal = isRightSide
          ? ([derivative / magnitude, -1 / magnitude] as [number, number])
          : ([-derivative / magnitude, -1 / magnitude] as [number, number]);
      }
      const v = refract([0, 1], normal, AIR_REFRACTIVE_INDEX, refractionIndex);
      if (!v) continue;
      const remainingHeight = viewHeight - backgroundHeight - py;
      const x2 = ox + (v[0] / v[1]) * remainingHeight;
      const disp = Math.abs(x2 - ox);
      if (disp > max) max = disp;
    }
    return max;
  });

  const displacementIntensity = useTransform(() => {
    const r = ray.get() as any;
    if (!r || !r.refracted) return 0;
    const disp = Math.abs((r.refracted.x2 as number) - (r.originX as number));
    const max = (maximumDisplacement.get() as number) || 1;
    return disp / max;
  });

  const displacementColor = useTransform(
    displacementIntensity,
    getRayColorDimmed
  );
  const displacementThickness = useTransform(
    displacementIntensity,
    (intensity) => 0.3 + intensity * 4
  );

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
          const normalized = (pointerX - glassX) / bezelWidth.get();
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
          const normalized = (pointerX - glassX) / bezelWidth.get();
          currentX.set(normalized);
        }}
      >
        <motion.path
          d={
            useTransform(() =>
              buildGlassOutlinePath(
                glassX,
                glassY.get(),
                glassWidth,
                glassHeight.get(),
                bezelWidth.get(),
                bezelFn,
                128
              )
            ) as unknown as string
          }
          className="select-none fill-slate-400/30 dark:fill-slate-400/20 stroke-slate-600/20 dark:stroke-slate-400/20"
          strokeWidth="1.5"
        />
        <rect
          width={backgroundWidth}
          height={backgroundHeight}
          x={0}
          y={viewHeight - backgroundHeight}
          rx={2}
          fill="rgba(100, 100, 110, 0.03)"
        />
        <line
          x1={0}
          y1={viewHeight - backgroundHeight}
          x2={viewWidth}
          y2={viewHeight - backgroundHeight}
          className="stroke-gray-400/30 dark:stroke-gray-500/30"
          strokeWidth="1"
        />
        {/* Incident Ray */}
        <motion.line
          x1={incidentX}
          y1={25}
          x2={incidentX}
          y2={useTransform(ray, (r: any) => (r ? r.hitPoint[1] : 0))}
          stroke={getRayColorDimmed(0)}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Refracted Ray */}
        <motion.line
          style={{
            display: useTransform(ray, (r: any) =>
              r?.refracted ? "block" : "none"
            ) as unknown as string,
          }}
          x1={useTransform(ray, (r: any) => r?.refracted?.x1 ?? 0)}
          y1={useTransform(ray, (r: any) => r?.refracted?.y1 ?? 0)}
          x2={useTransform(ray, (r: any) => r?.refracted?.x2 ?? 0)}
          y2={useTransform(ray, (r: any) => r?.refracted?.y2 ?? 0)}
          stroke={getRayColorDimmed(0.3)}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Incident Ray Projection */}
        <motion.line
          x1={incidentX}
          y1={useTransform(ray, (r: any) => (r ? r.hitPoint[1] : 0))}
          x2={incidentX}
          y2={viewHeight - backgroundHeight}
          stroke={getRayColorDimmed(0)}
          strokeWidth="1"
          strokeDasharray="3"
          strokeOpacity="0.5"
        />

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
        <motion.line
          style={{
            display: useTransform(ray, (r: any) =>
              r?.refracted ? "block" : "none"
            ),
          }}
          x1={incidentX}
          y1={viewHeight - backgroundHeight}
          x2={useTransform(ray, (r: any) => r?.refracted?.x2 ?? 0)}
          y2={viewHeight - backgroundHeight}
          stroke={displacementColor as unknown as string}
          strokeWidth={displacementThickness as unknown as number}
          strokeLinecap="round"
          markerEnd="url(#arrow-displacement-vector-mini)"
        />
      </motion.svg>
    </>
  );
};
