import { motion } from "motion/react";
import { useEffect, useState } from "react";

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

type RayRefractionSimulationMiniProps = {
  bezelHeightFn?: (x: number) => number;
  bezelWidth?: number;
  glassThickness?: number;
  refractionIndex?: number;
  // Optional props for interaction
  currentX?: number;
  onCurrentXChange?: (x: number) => void;
};

export const RayRefractionSimulationMini: React.FC<
  RayRefractionSimulationMiniProps
> = ({
  bezelHeightFn = (x) => x * x,
  bezelWidth = 150,
  glassThickness = 200,
  refractionIndex = GLASS_REFRACTIVE_INDEX,
  currentX,
  onCurrentXChange,
}) => {
  const viewWidth = 320;
  const viewHeight = 240;

  const backgroundWidth = viewWidth;
  const backgroundHeight = 10;
  const glassWidth = 500;

  const glassX = 50;
  const glassY = viewHeight - backgroundHeight - glassThickness - bezelWidth;

  function toRayX(x: number): number {
    return glassX + x * bezelWidth;
  }
  function toCurrentX(x: number): number {
    return (x - glassX) / bezelWidth;
  }

  const ray: Ray | null =
    typeof currentX === "number"
      ? { originX: toRayX(currentX), vector: [0, 1] }
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

  const [isPanning, setIsPanning] = useState(false);
  useEffect(() => {
    if (!isPanning) return;
    // Add event listener for mouse up to stop panning
    const handleMouseUp = () => setIsPanning(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isPanning]);

  const NUMBER_OF_SAMPLES = 1024;

  return (
    <>
      <motion.svg
        className="w-full"
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        onClick={(e) => {
          const { left, width } = e.currentTarget.getBoundingClientRect();
          const xRatio = (e.clientX - left) / width;

          const newRay: Ray = { originX: xRatio * viewWidth, vector: [0, 1] };
          onCurrentXChange?.(toCurrentX(newRay.originX));
        }}
        onMouseDown={() => setIsPanning(true)}
        onMouseUp={() => setIsPanning(false)}
        onMouseMove={(e) => {
          if (!isPanning) return;
          const { left, width } = e.currentTarget!.getBoundingClientRect();
          const xRatio = (e.clientX - left) / width;

          const newRay: Ray = { originX: xRatio * viewWidth, vector: [0, 1] };
          onCurrentXChange?.(toCurrentX(newRay.originX));
        }}
      >
        <path
          d={`
          M ${glassX} ${glassY + glassThickness + bezelWidth}

          ${Array.from({ length: NUMBER_OF_SAMPLES }, (_, i) => {
            const x = i / NUMBER_OF_SAMPLES;
            const y = bezelHeightFn(x);
            return `L ${glassX + x * bezelWidth} ${
              glassY + (1 - y) * bezelWidth
            }`;
          }).join(" ")}
          
          L ${glassX + glassWidth - bezelWidth} ${
            glassY + (1 - bezelHeightFn(1)) * bezelWidth
          }

          L ${glassX + glassWidth - bezelWidth} ${
            glassY + glassThickness + bezelWidth
          }
          Z`}
          fill="rgba(60, 60, 90, 0.1)"
          stroke="rgba(120, 120, 150, 0.4)"
          strokeWidth="2"
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
            stroke={["blue", "green", "red"][index % 3]}
            strokeWidth="3"
          />
        ))}
        {ray && (
          <line
            x1={ray.originX}
            y1={0}
            x2={ray.originX}
            y2={viewHeight - backgroundHeight}
            stroke="black"
            strokeWidth="1"
            strokeDasharray="3"
          />
        )}

        {refractedRay && (
          <line
            x1={refractedRay.originX}
            y1={viewHeight - backgroundHeight}
            x2={refractedRay.segments[refractedRay.segments.length - 1].x2}
            y2={viewHeight - backgroundHeight}
            stroke="red"
            strokeWidth="2"
          />
        )}
      </motion.svg>
    </>
  );
};
