import { RefreshCcw } from "lucide-react";
import { animate } from "motion";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";

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

type RayRefractionSimulationProps = {
  bezelHeightFn?: (x: number) => number;
  bezelWidth?: number;
  glassWidth?: number;
  glassHeight?: number;
  halfWidth?: boolean;
};

export const RayRefractionSimulation: React.FC<
  RayRefractionSimulationProps
> = ({ glassWidth = 400, glassHeight = 200 }) => {
  const viewWidth = 600;
  const viewHeight = 300;

  const bezelWidth = useMotionValue(100);
  const bezelHeightFn = useMotionValue((x: number) => {
    return x * x;
  });

  const refractionIndex = useMotionValue(GLASS_REFRACTIVE_INDEX);
  const currentX = useMotionValue((glassWidth - viewWidth) / 2);

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

  const NUMBER_OF_SAMPLES = 256;

  const ray = useTransform(() =>
    calculateRefraction(currentX.get(), refractionIndex.get())
  );

  const surfacePath = useTransform(() => {
    const bezelHeightFn_ = bezelHeightFn.get();
    const bezelWidth_ = bezelWidth.get();
    return `
      M ${glassX} ${glassY + glassHeight}

      ${Array.from({ length: NUMBER_OF_SAMPLES }, (_, i) => {
        const x = i / NUMBER_OF_SAMPLES;
        const y = bezelHeightFn_(x);
        return `L ${glassX + x * bezelWidth_} ${
          glassY + (1 - y) * bezelWidth_
        }`;
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
          className="fill-slate-900/80 dark:fill-slate-700/70"
        />

        <text
          className="select-none opacity-50"
          x={backgroundWidth / 2}
          y={viewHeight - backgroundHeight / 2}
          fill="white"
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
          stroke="blue"
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
          stroke="green"
          strokeWidth="3"
        />

        {/* Incident Ray Projection */}
        <motion.line
          x1={currentX}
          y1={useTransform(() => ray.get().hitPoint[1])}
          x2={currentX}
          y2={viewHeight - backgroundHeight}
          stroke="blue"
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
          stroke="red"
          strokeWidth="3"
          className="select-none"
          style={{
            display: useTransform(() =>
              ray.get().refracted ? "block" : "none"
            ),
          }}
        />
      </motion.svg>

      <div className="p-4 bg-white dark:bg-slate-800 flex items-center gap-4">
        <div>
          <label className="text-sm">Bezel Width:</label>
          <motion.input
            type="range"
            min="0"
            max="200"
            value={useTransform(() => bezelWidth.get().toString())}
            onChange={(e) => bezelWidth.set(Number(e.target.value))}
            className="w-full"
          />
          <motion.span className="text-sm">{bezelWidth}</motion.span>
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            const newBezelHeightFn = (x: number) => Math.sqrt(1 - (1 - x) ** 2);
            bezelHeightFn.set(newBezelHeightFn);
          }}
        >
          Concave
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            const newBezelHeightFn = (x: number) =>
              1 - Math.sqrt(1 - (1 - x) ** 2);
            bezelHeightFn.set(newBezelHeightFn);
          }}
        >
          Convex
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => {
            currentX.set((viewWidth - glassWidth) / 2);
            animate([
              [
                currentX,
                (viewWidth - glassWidth) / 2 + glassWidth,
                {
                  duration: 3,
                  ease: "easeInOut",
                },
              ],
              [
                currentX,
                viewWidth / 2,
                {
                  duration: 1.5,
                  ease: "easeInOut",
                },
              ],
            ]);
          }}
        >
          <RefreshCcw />
        </button>
      </div>
    </div>
  );
};
