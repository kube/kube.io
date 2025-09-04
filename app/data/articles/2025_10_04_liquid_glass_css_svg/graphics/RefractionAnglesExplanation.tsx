import { RotateCcwIcon } from "lucide-react";
import { animate } from "motion";
import { motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { getRayColor } from "../lib/rayColor";

function calculateRefractionAngle(
  n1: number,
  n2: number,
  theta1: number
): number | null {
  const ratio = n1 / n2;
  const s = ratio * Math.sin(theta1);
  // If Total Internal Reflection occurs, return null
  if (s > 1 || s < -1) return null;
  const angle = Math.asin(s);
  return angle;
}

export const RefractionAnglesExplanation: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isInView = useInView(svgRef, { once: true, amount: 0.7 });
  useEffect(() => {
    if (isInView) startAnimation();
  }, [isInView]);

  const FIRST_MEDIUM_REFRACTIVE_INDEX = 1; // Air
  // Second medium refractive index as MotionValue
  const n2 = useMotionValue(1.5);
  // Local display state to trigger re-render when MotionValue changes
  const [n2Display, setN2Display] = useState(n2.get());
  useEffect(() => {
    const unsub = n2.on("change", (v) => setN2Display(v));
    return () => unsub();
  }, [n2]);
  // Ref to the range input to update its value without re-render
  const n2SliderRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    return n2.on("change", (v: number) => {
      const el = n2SliderRef.current;
      if (!el) return;
      const newVal = String(v);
      if (el.value !== newVal) {
        el.value = newVal;
      }
    });
  }, [n2]);
  const N2_MIN = 0.01;
  const N2_MAX = 3;

  const INITIAL_RAY_ANGLE = Math.PI / 8; // 45 degrees
  const TARGET_RAY_ANGLE = (Math.PI * 7) / 8; // 135 degrees

  const width = 400;
  const height = 300;

  const centerX = width / 2;
  const centerY = height / 2;

  const segmentLength = 150;
  const normalLength = 150;
  const angleArcLength = 60;
  const angleLableOffset = 15;

  const incidentRayProgress = useMotionValue(0);
  const refractedRayProgress = useMotionValue(0);
  const arcAngleProgress = useMotionValue(0);
  const incidentRayAngle = useMotionValue(INITIAL_RAY_ANGLE);
  const incidentToNormalAngle = useTransform(
    () => incidentRayAngle.get() - Math.PI / 2
  );
  const refractedToNormalAngle = useTransform(() =>
    calculateRefractionAngle(
      FIRST_MEDIUM_REFRACTIVE_INDEX,
      n2.get(),
      incidentToNormalAngle.get()
    )
  );
  const refractedRayAngle = useTransform(() => {
    const angle = refractedToNormalAngle.get();
    return angle !== null ? angle + Math.PI / 2 : null;
  });
  const incidentRayColor = getRayColor(0);
  const refractedRayColor = useTransform(() => {
    const angle = refractedToNormalAngle.get();
    if (angle === null) return incidentRayColor;
    return getRayColor(
      (Math.abs(incidentRayAngle.get() - refractedRayAngle.get()) / Math.PI) * 4
    );
  });

  const currentAnimation = useRef<ReturnType<typeof animate> | null>(null);

  function startAnimation() {
    currentAnimation.current?.stop();

    n2.set(1.5);
    incidentRayProgress.set(0);
    refractedRayProgress.set(0);
    arcAngleProgress.set(0);
    incidentRayAngle.set(INITIAL_RAY_ANGLE);

    currentAnimation.current = animate([
      [incidentRayProgress, 1, { duration: 0.8, type: "tween" }],
      [refractedRayProgress, 1, { duration: 0.9, type: "tween" }],
      [arcAngleProgress, 1, { duration: 0.5, type: "tween" }],
      [
        incidentRayAngle,
        TARGET_RAY_ANGLE,
        { type: "tween", ease: "easeInOut", duration: 1 },
      ],
      [
        incidentRayAngle,
        INITIAL_RAY_ANGLE,
        { type: "tween", ease: "easeInOut", duration: 1 },
      ],
      [n2, 1.0, { type: "tween", ease: "easeInOut", duration: 1 }],
      [n2, 0.7, { type: "tween", ease: "easeInOut", duration: 2, delay: 1 }],
      [
        incidentRayAngle,
        Math.PI / 2,
        { type: "tween", ease: "easeInOut", duration: 2 },
      ],
      [
        incidentRayAngle,
        INITIAL_RAY_ANGLE,
        { type: "tween", ease: "easeInOut", duration: 2 },
      ],
      [n2, 1.5, { type: "tween", ease: "easeInOut", duration: 2 }],
    ]);
  }

  // MotionValue n2MV is the source of truth; no sync needed

  // Slider for n2: vertical at label x, always visible; label remains the control
  const labelTextRef = useRef<SVGTextElement | null>(null);

  const labelY = centerY + 13;

  return (
    <div className="relative h-full -ml-[15px] w-[calc(100%+30px)] select-none mb-20">
      <motion.svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="select-none"
        onPan={(e) => {
          const svg = svgRef.current;
          if (!svg) return;

          // Map viewport coordinates to SVG user space
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const ctm = svg.getScreenCTM();
          if (!ctm) return;
          const local = pt.matrixTransform(ctm.inverse());

          // SVG Y grows downward; flip to math coordinates for angle
          const x = local.x - centerX;
          const y = centerY - local.y;

          // Only adjust incident ray when interacting above the surface (y > 0)
          if (y < 1 || x * x + y * y < 100) return;

          const angle = Math.atan2(y, x);
          incidentRayAngle.set(angle);
        }}
      >
        <defs>
          <marker
            id="ray-arrow-incident"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={getRayColor(0)} />
          </marker>
          <marker
            id="ray-arrow-refracted"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <motion.path d="M 0 0 L 10 5 L 0 10 z" fill={refractedRayColor} />
          </marker>
        </defs>

        {/* Surface */}
        <line
          x1={0}
          y1={centerY}
          x2={width}
          y2={centerY}
          className="stroke-slate-700 dark:stroke-slate-400"
          strokeWidth="1.5"
        />

        {/* Normal to surface */}
        <line
          x1={centerX}
          y1={centerY - normalLength}
          x2={centerX}
          y2={centerY + normalLength}
          className="stroke-slate-700 dark:stroke-slate-400"
          opacity={0.6}
          strokeWidth={1}
          strokeDasharray={2}
        />

        {/* Arc between Normal and Incident Ray */}
        <motion.path
          d={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              (incidentRayAngle.get() - Math.PI / 2) * arcAngleProgress.get();
            const startX = centerX;
            const startY = centerY - angleArcLength;
            const endX = centerX + angleArcLength * Math.cos(currentAngle);
            const endY = centerY - angleArcLength * Math.sin(currentAngle);
            const largeArcFlag = currentAngle > Math.PI / 2 ? 0 : 1;
            return `M ${startX} ${startY} A ${angleArcLength} ${angleArcLength} 0 0 ${largeArcFlag} ${endX} ${endY}`;
          })}
          fill="none"
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth="1"
        />

        {/* Arc between Normal and Reflected Ray */}
        <motion.path
          d={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              (incidentRayAngle.get() - Math.PI / 2) * arcAngleProgress.get();
            const startX = centerX;
            const startY = centerY - angleArcLength;
            const endX = centerX - angleArcLength * Math.cos(currentAngle);
            const endY = centerY - angleArcLength * Math.sin(currentAngle);
            const largeArcFlag = currentAngle > Math.PI / 2 ? 1 : 0;
            return `M ${startX} ${startY} A ${angleArcLength} ${angleArcLength} 0 0 ${largeArcFlag} ${endX} ${endY}`;
          })}
          display={useTransform(() =>
            refractedRayAngle.get() === null ? "block" : "none"
          )}
          fill="none"
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth="1"
        />

        {/* Angle label between normal and Incident Ray */}
        <motion.text
          opacity={arcAngleProgress}
          x={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              ((incidentRayAngle.get() - Math.PI / 2) *
                arcAngleProgress.get()) /
                2;
            const endX =
              centerX +
              (angleArcLength + angleLableOffset) * Math.cos(currentAngle);
            return endX;
          })}
          y={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              ((incidentRayAngle.get() - Math.PI / 2) *
                arcAngleProgress.get()) /
                2;
            const endY =
              centerY -
              (angleArcLength + angleLableOffset) * Math.sin(currentAngle);
            return endY;
          })}
          dominantBaseline="central"
          textAnchor="middle"
          fontSize="10"
          className="fill-slate-500 dark:fill-slate-400"
        >
          θ
          <tspan baselineShift="sub" fontSize="70%">
            1
          </tspan>
        </motion.text>

        {/* Angle label between normal and Reflected Ray */}
        <motion.text
          opacity={arcAngleProgress}
          x={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              ((incidentRayAngle.get() - Math.PI / 2) *
                arcAngleProgress.get()) /
                2;
            const endX =
              centerX -
              (angleArcLength + angleLableOffset) * Math.cos(currentAngle);
            return endX;
          })}
          y={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              ((incidentRayAngle.get() - Math.PI / 2) *
                arcAngleProgress.get()) /
                2;
            const endY =
              centerY -
              (angleArcLength + angleLableOffset) * Math.sin(currentAngle);
            return endY;
          })}
          dominantBaseline="central"
          textAnchor="middle"
          fontSize="10"
          display={useTransform(() =>
            refractedRayAngle.get() === null ? "block" : "none"
          )}
          className="fill-slate-500 dark:fill-slate-400"
        >
          θ
          <tspan baselineShift="sub" fontSize="70%">
            1
          </tspan>
        </motion.text>

        {/* Arc between Normal and Refracted Ray */}
        <motion.path
          d={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              (refractedRayAngle.get() - Math.PI / 2) * arcAngleProgress.get();
            const startX = centerX;
            const startY = centerY + angleArcLength;
            const endX = centerX - angleArcLength * Math.cos(currentAngle);
            const endY = centerY + angleArcLength * Math.sin(currentAngle);
            const largeArcFlag = currentAngle > Math.PI / 2 ? 0 : 1;
            return `M ${startX} ${startY} A ${angleArcLength} ${angleArcLength} 0 0 ${largeArcFlag} ${endX} ${endY}`;
          })}
          fill="none"
          display={useTransform(() =>
            refractedRayAngle.get() === null ? "none" : "block"
          )}
          className="stroke-slate-400 dark:stroke-slate-600"
          strokeWidth="1"
        />

        {/* Angle label between normal and Refracted Ray */}
        <motion.text
          opacity={arcAngleProgress}
          x={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              ((refractedRayAngle.get() - Math.PI / 2) *
                arcAngleProgress.get()) /
                2;
            const endX =
              centerX -
              (angleArcLength + angleLableOffset) * Math.cos(currentAngle);
            return endX;
          })}
          y={useTransform(() => {
            const currentAngle =
              Math.PI / 2 +
              ((refractedRayAngle.get() - Math.PI / 2) *
                arcAngleProgress.get()) /
                2;
            const endY =
              centerY +
              (angleArcLength + angleLableOffset) * Math.sin(currentAngle);
            return endY;
          })}
          display={useTransform(() =>
            refractedRayAngle.get() === null ? "none" : "block"
          )}
          dominantBaseline="central"
          textAnchor="middle"
          fontSize="10"
          className="fill-slate-500 dark:fill-slate-400"
        >
          θ
          <tspan baselineShift="sub" fontSize="70%">
            2
          </tspan>
        </motion.text>

        <motion.text
          x={centerX}
          y={20}
          textAnchor="right"
          dominantBaseline="central"
          fontSize="8"
          className="fill-slate-500 dark:fill-slate-400"
          transform={`rotate(-90 ${centerX} 30)`}
        >
          Normal
        </motion.text>

        <motion.text
          x={0}
          y={centerY - 13}
          textAnchor="left"
          dominantBaseline="central"
          fontSize={8}
          className="fill-slate-500 dark:fill-slate-400"
        >
          First Medium (n
          <tspan baselineShift="sub" fontSize="70%">
            1
          </tspan>{" "}
          = {FIRST_MEDIUM_REFRACTIVE_INDEX})
        </motion.text>

        <motion.text
          ref={labelTextRef}
          x={0}
          y={labelY}
          dominantBaseline="central"
          textAnchor="left"
          fontSize="8"
          className="fill-slate-500 dark:fill-slate-400"
        >
          Second Medium (n
          <tspan baselineShift="sub" fontSize="70%">
            2
          </tspan>{" "}
          = {n2Display.toFixed(2)})
        </motion.text>

        {/* Incident Ray */}
        <motion.line
          opacity={useTransform(() =>
            incidentRayProgress.get() === 0 ? 0 : 1
          )}
          markerEnd={useTransform(() =>
            incidentRayProgress.get() === 1
              ? undefined
              : "url(#ray-arrow-incident)"
          )}
          x1={useTransform(
            () => centerX + segmentLength * Math.cos(incidentRayAngle.get())
          )}
          y1={useTransform(
            () => centerY - segmentLength * Math.sin(incidentRayAngle.get())
          )}
          x2={useTransform(
            () =>
              centerX +
              segmentLength *
                Math.cos(incidentRayAngle.get()) *
                (1 - incidentRayProgress.get())
          )}
          y2={useTransform(
            () =>
              centerY -
              segmentLength *
                Math.sin(incidentRayAngle.get()) *
                (1 - incidentRayProgress.get())
          )}
          stroke={incidentRayColor}
          strokeWidth={2}
        />

        {/* Refracted Ray */}
        <motion.line
          opacity={useTransform(() =>
            refractedRayProgress.get() === 0 ? 0 : 1
          )}
          markerEnd="url(#ray-arrow-refracted)"
          x1={centerX}
          y1={centerY}
          x2={useTransform(() => {
            const refractedAngle = refractedRayAngle.get();

            if (refractedAngle === null) {
              // Total Internal Reflection: extend incident ray instead
              return (
                centerX -
                segmentLength *
                  Math.cos(incidentRayAngle.get()) *
                  refractedRayProgress.get()
              );
            } else {
              return (
                centerX -
                segmentLength *
                  Math.cos(refractedAngle) *
                  refractedRayProgress.get()
              );
            }
          })}
          y2={useTransform(() => {
            const refractedAngle = refractedRayAngle.get();

            if (refractedAngle === null) {
              // Total Internal Reflection: extend incident ray instead
              return (
                centerY -
                segmentLength *
                  Math.sin(incidentRayAngle.get()) *
                  refractedRayProgress.get()
              );
            } else {
              return (
                centerY +
                segmentLength *
                  Math.sin(refractedRayAngle.get()) *
                  refractedRayProgress.get()
              );
            }
          })}
          stroke={refractedRayColor}
          strokeWidth={2}
        />

        {/* Incident Ray projection */}
        <motion.line
          x1={centerX}
          y1={centerY}
          x2={useTransform(
            () =>
              centerX -
              segmentLength *
                Math.cos(incidentRayAngle.get()) *
                refractedRayProgress.get()
          )}
          y2={useTransform(
            () =>
              centerY +
              segmentLength *
                Math.sin(incidentRayAngle.get()) *
                refractedRayProgress.get()
          )}
          className="stroke-cyan-500 dark:stroke-cyan-600 opacity-70"
          strokeWidth={1}
          strokeDasharray={2}
        />
      </motion.svg>

      <div className="mt-4 w-full flex items-center">
        {/* left spacer */}
        <div className="flex-1" />
        {/* Swiss-style slider with bottom label */}
        <div className="flex flex-col items-center">
          {/* Slider */}
          <div className="relative">
            <input
              id="n2-slider"
              type="range"
              min={N2_MIN}
              max={N2_MAX}
              step={0.002}
              ref={n2SliderRef}
              defaultValue={n2.get()}
              onChange={(e) => n2.set(parseFloat(e.target.value))}
              aria-label="Second medium refractive index"
              className="w-96 h-[3px] rounded appearance-none cursor-pointer bg-slate-400/80 dark:bg-slate-600 accent-slate-500 dark:accent-slate-500"
            />

            {/* Range indicators */}
            <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] w-96">
              <span>{N2_MIN}</span>
              <span>{N2_MAX}</span>
            </div>
          </div>

          {/* Bottom: Parameter label and value */}
          <div className="flex items-baseline gap-2">
            <span className="text-[16px] tracking-[0.1em] text-slate-500 dark:text-slate-500">
              n₂
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-mono text-[14px] tabular-nums">
              <motion.span>
                {useTransform(() => n2.get().toFixed(2))}
              </motion.span>
            </span>
          </div>
        </div>
        {/* right-aligned replay button */}
        <div className="flex-1 flex justify-end">
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
    </div>
  );
};
