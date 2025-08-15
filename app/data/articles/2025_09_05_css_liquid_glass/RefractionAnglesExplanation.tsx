import { RotateCcwIcon } from "lucide-react";
import { animate } from "motion";
import { motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

function calculateRefractionAngle(
  n1: number,
  n2: number,
  theta1: number
): number {
  return Math.asin((n1 / n2) * Math.sin(theta1));
}

export const RefractionAnglesExplanation: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isInView = useInView(svgRef, { once: true, amount: 0.7 });
  useEffect(startAnimation, [isInView]);

  const FIRST_MEDIUM_REFRACTIVE_INDEX = 1; // Air
  const SECOND_MEDIUM_REFRACTIVE_INDEX = 1.5; // Glass

  const INITIAL_RAY_ANGLE = Math.PI / 8; // 45 degrees
  const TARGET_RAY_ANGLE = (Math.PI * 7) / 8; // 135 degrees

  const width = 400;
  const height = 300;

  const centerX = width / 2;
  const centerY = height / 2;

  const segmentLength = 130;
  const normalLength = 150;
  const angleArcLength = 50;
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
      SECOND_MEDIUM_REFRACTIVE_INDEX,
      incidentToNormalAngle.get()
    )
  );
  const refractedRayAngle = useTransform(
    () => refractedToNormalAngle.get() + Math.PI / 2
  );

  const currentAnimation = useRef<ReturnType<typeof animate> | null>(null);

  function startAnimation() {
    currentAnimation.current?.stop();

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
        { type: "spring", damping: 18, stiffness: 100 },
      ],
      [
        incidentRayAngle,
        INITIAL_RAY_ANGLE,
        { type: "spring", damping: 18, stiffness: 100 },
      ],
    ]);
  }

  return (
    <div className="relative w-full h-full">
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

          if (y < 1 || x * x + y * y < 100) return;

          const angle = Math.atan2(y, x);
          incidentRayAngle.set(angle);
        }}
      >
        <defs>
          <marker
            id="rayArrow"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
          </marker>
        </defs>
        {/* Surface */}
        <line
          x1={20}
          y1={centerY}
          x2={width - 20}
          y2={centerY}
          className="stroke-slate-700 dark:stroke-slate-200"
          strokeWidth="1.5"
        />

        {/* Normal to surface */}
        <line
          x1={centerX}
          y1={centerY - normalLength}
          x2={centerX}
          y2={centerY + normalLength}
          className="stroke-black dark:stroke-white"
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
          className="stroke-slate-400 dark:stroke-slate-500"
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
          fontSize="9"
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
          className="stroke-slate-400 dark:stroke-slate-500"
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
          dominantBaseline="central"
          textAnchor="middle"
          fontSize="9"
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
          className="fill-slate-400 dark:fill-slate-500"
          transform={`rotate(-90 ${centerX} 30)`}
        >
          Normal
        </motion.text>

        <motion.text
          x={20}
          y={centerY - 13}
          textAnchor="left"
          dominantBaseline="central"
          fontSize={8}
          className="fill-slate-400 dark:fill-slate-500"
        >
          First Medium (n1 = {FIRST_MEDIUM_REFRACTIVE_INDEX})
        </motion.text>

        <motion.text
          x={20}
          y={centerY + 13}
          dominantBaseline="central"
          textAnchor="left"
          fontSize="8"
          className="fill-slate-400 dark:fill-slate-500"
        >
          Second Medium (n2 = {SECOND_MEDIUM_REFRACTIVE_INDEX})
        </motion.text>

        {/* Incident Ray */}
        <motion.line
          markerEnd={useTransform(() =>
            incidentRayProgress.get() === 1 ? undefined : "url(#rayArrow)"
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
          className="stroke-cyan-500 dark:stroke-cyan-600"
          strokeWidth={2}
        />

        {/* Refracted Ray */}
        <motion.line
          markerEnd={useTransform(() =>
            refractedRayProgress.get() === 0 ? undefined : "url(#rayArrow)"
          )}
          x1={centerX}
          y1={centerY}
          x2={useTransform(
            () =>
              centerX -
              segmentLength *
                Math.cos(refractedRayAngle.get()) *
                refractedRayProgress.get()
          )}
          y2={useTransform(
            () =>
              centerY +
              segmentLength *
                Math.sin(refractedRayAngle.get()) *
                refractedRayProgress.get()
          )}
          className="stroke-emerald-600 dark:stroke-emerald-600"
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
