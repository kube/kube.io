import { RotateCcwIcon } from "lucide-react";
import { animate } from "motion";
import { motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getRayColor } from "./rayColor";

function calculateRefractionAngle(
  n1: number,
  n2: number,
  theta1: number
): number {
  const ratio = n1 / n2;
  const s = ratio * Math.sin(theta1);
  // Clamp to avoid NaN when |s| > 1 (e.g., when n2 < n1 and beyond critical angle)
  const clamped = Math.max(-1, Math.min(1, s));
  const angle = Math.asin(clamped);
  return angle;
}

export const RefractionAnglesExplanation: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isInView = useInView(svgRef, { once: true, amount: 0.7 });
  useEffect(() => {
    if (isInView) startAnimation();
  }, [isInView]);

  const FIRST_MEDIUM_REFRACTIVE_INDEX = 1; // Air
  // Second medium refractive index is user-controlled between 1 and 5
  const [n2, setN2] = useState(1.5);
  const n2MV = useMotionValue(n2);
  const N2_MIN = 0.01;
  const N2_MAX = 10;

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
      n2MV.get(),
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

  // Keep motion value in sync with React state
  useEffect(() => {
    n2MV.set(n2);
  }, [n2]);

  // Slider for n2: vertical at label x, always visible; label remains the control
  const labelTextRef = useRef<SVGTextElement | null>(null);
  const [thumbX, setThumbX] = useState(26); // label x + small margin fallback
  const sliderX = thumbX; // align with label right-side
  const sliderTopY = centerY + 25;
  const sliderBottomY = height - 20;
  const labelY = centerY + 13;
  const handleRadius = 7;
  const handleY =
    sliderTopY +
    ((n2 - N2_MIN) / (N2_MAX - N2_MIN)) * (sliderBottomY - sliderTopY);
  const trackHalf = 30; // visible half-length around handle
  const visibleTop = Math.max(
    sliderTopY,
    Math.min(sliderBottomY, handleY - trackHalf)
  );
  const visibleBottom = Math.max(
    sliderTopY,
    Math.min(sliderBottomY, handleY + trackHalf)
  );
  const railTranslateY = labelY - handleY; // move rail so current value aligns with fixed thumb

  // Measure label to place thumb at the right-side of text
  useLayoutEffect(() => {
    const el = labelTextRef.current;
    if (!el) return;
    try {
      const bbox = el.getBBox();
      setThumbX(bbox.x + bbox.width + 6); // 6px gap to the right of label
    } catch {
      // ignore
    }
  }, [n2]);

  const isDraggingN2 = useRef(false);
  const [draggingN2, setDraggingN2] = useState(false);

  function clientToLocalSVGPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }

  function updateN2FromPointer(clientX: number, clientY: number) {
    const local = clientToLocalSVGPoint(clientX, clientY);
    if (!local) return;
    // Map pointer Y to [N2_MIN,N2_MAX] along vertical slider
    const y = Math.min(Math.max(local.y, sliderTopY), sliderBottomY);
    const t = (y - sliderTopY) / (sliderBottomY - sliderTopY);
    const newN2 = N2_MIN + t * (N2_MAX - N2_MIN); // top=min, bottom=max
    setN2(Number(newN2.toFixed(3)));
  }

  return (
    <div className="relative w-full h-full">
      <motion.svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="select-none"
        onPan={(e) => {
          if (isDraggingN2.current) return;
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
          ref={labelTextRef}
          x={20}
          y={labelY}
          dominantBaseline="central"
          textAnchor="left"
          fontSize="8"
          className="fill-slate-400 dark:fill-slate-500"
          style={{ cursor: "ns-resize" }}
          role="slider"
          aria-valuemin={N2_MIN}
          aria-valuemax={N2_MAX}
          aria-valuenow={Number(n2.toFixed(2))}
          aria-label="Second medium refractive index"
          tabIndex={0}
          onPointerDown={(e) => {
            isDraggingN2.current = true;
            setDraggingN2(true);
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
            updateN2FromPointer(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!isDraggingN2.current) return;
            updateN2FromPointer(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            isDraggingN2.current = false;
            setDraggingN2(false);
            (e.currentTarget as Element).releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            isDraggingN2.current = false;
            setDraggingN2(false);
          }}
          onKeyDown={(e) => {
            const step = 0.05;
            if (e.key === "ArrowUp") {
              setN2((v) => Math.max(N2_MIN, +(v - step).toFixed(3)));
              e.preventDefault();
            } else if (e.key === "ArrowDown") {
              setN2((v) => Math.min(N2_MAX, +(v + step).toFixed(3)));
              e.preventDefault();
            }
          }}
        >
          Second Medium (n2 = {n2.toFixed(2)})
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
          stroke={getRayColor(0)}
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
          stroke={useTransform(() =>
            getRayColor(
              (Math.abs(incidentRayAngle.get() - refractedRayAngle.get()) /
                Math.PI) *
                4
            )
          )}
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

        {/* n2 Slider visuals (rail moves, thumb fixed at label's right) */}
        <g
          style={{ pointerEvents: "none", display: draggingN2 ? undefined : "none" }}
          transform={`translate(0 ${railTranslateY})`}
        >
          <line
            x1={sliderX}
            y1={visibleTop}
            x2={sliderX}
            y2={visibleBottom}
            className="stroke-slate-300 dark:stroke-slate-600"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
        <circle
          cx={sliderX}
          cy={labelY}
          r={handleRadius}
          className="fill-cyan-500 dark:fill-cyan-500 stroke-white/70"
          style={{ cursor: "ns-resize", pointerEvents: "none", display: draggingN2 ? undefined : "none" }}
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
