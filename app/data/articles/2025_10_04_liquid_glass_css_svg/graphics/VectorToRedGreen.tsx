import { AnimationSequence } from "motion";
import {
  animate,
  AnimationPlaybackControlsWithThen,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import * as React from "react";
import { ReplayButton } from "../components/Buttons";

export const VectorToRedGreen: React.FC = () => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapperRef, { once: true, amount: 1 });
  React.useEffect(() => {
    if (isInView) startAnimation();
  }, [isInView]);

  const width = 300;
  const height = 300;

  const centerX = width / 2;
  const centerY = height / 2;

  const vectorCenterX = centerX;
  const vectorCenterY = centerY;
  const radius = 130;
  // Motion values for interactive angle & magnitude
  const magnitude = useMotionValue(radius);
  const angle = useMotionValue(Math.PI / 4);
  const [dragging, setDragging] = React.useState(false);

  const updateFromPointer = React.useCallback(
    (clientX: number, clientY: number, target: SVGSVGElement) => {
      const rect = target.getBoundingClientRect();
      const svgX = ((clientX - rect.left) / rect.width) * width;
      const svgY = ((clientY - rect.top) / rect.height) * height;
      const dx = svgX - vectorCenterX;
      const dy = svgY - vectorCenterY;
      const newAngle = Math.atan2(dy, dx);
      const newMag = Math.min(radius, Math.sqrt(dx * dx + dy * dy));
      angle.set(newAngle);
      magnitude.set(newMag);
    },
    [angle, magnitude, vectorCenterX, vectorCenterY, width, height]
  );

  const onPointerDown: React.PointerEventHandler<SVGSVGElement> = (e) => {
    (e.target as SVGSVGElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    animation.get()?.complete();
    updateFromPointer(e.clientX, e.clientY, e.currentTarget);
  };
  const onPointerMove: React.PointerEventHandler<SVGSVGElement> = (e) => {
    if (!dragging) return;
    updateFromPointer(e.clientX, e.clientY, e.currentTarget);
  };
  const endDrag: React.PointerEventHandler<SVGSVGElement> = (e) => {
    try {
      (e.target as SVGSVGElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(false);
  };

  // Compute color components from current vector
  // Normalized components derived from motion values
  const nx = useTransform(
    [magnitude, angle],
    ([m, a]: number[]) => (m * Math.cos(a)) / radius
  );
  const ny = useTransform(
    [magnitude, angle],
    ([m, a]: number[]) => (m * Math.sin(a)) / radius
  );
  // Text-friendly, rounded to two decimals
  const nxText = useTransform(nx, (v: number) => v.toFixed(2));
  const nyText = useTransform(ny, (v: number) => v.toFixed(2));
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const redIntensity = useTransform(nx, (v: number) => clamp01((v + 1) / 2));
  const greenIntensity = useTransform(ny, (v: number) => clamp01((v + 1) / 2));
  const r = useTransform(redIntensity, (v) => Math.round(v * 255));
  const g = useTransform(greenIntensity, (v) => Math.round(v * 255));
  const redColor = useTransform(() => `rgb(${r.get()},0,0)`);
  const greenColor = useTransform(() => `rgb(0,${g.get()},0)`);
  const blendedColor = useTransform(
    [redIntensity, greenIntensity],
    ([ri, gi]: number[]) => {
      const r = Math.round(ri * 255);
      const g = Math.round(gi * 255);
      return `rgb(${r},${g},0)`;
    }
  );

  // Endpoint of vector line
  const endX = useTransform(
    [magnitude, angle],
    ([m, a]: number[]) => vectorCenterX + m * Math.cos(a)
  );
  const endY = useTransform(
    [magnitude, angle],
    ([m, a]: number[]) => vectorCenterY + m * Math.sin(a)
  );

  // Vector properties
  const vectorColor = useTransform(
    () => `hsl(${180 + (magnitude.get() / radius) * 100},95%,45%)`
  );
  const vectorStrokeWidth = useTransform(
    () => 1.5 + (magnitude.get() / radius) * 4
  );

  // Animation

  const animation = useMotionValue<AnimationPlaybackControlsWithThen | null>(
    null
  );

  function startAnimation() {
    animation.get()?.stop();
    animation.set(animate(animationSequence));
  }

  const animationSequence: AnimationSequence = [
    "Rotate around",
    [magnitude, radius, { duration: 0.3, ease: "easeInOut" }],
    [angle, Math.PI / 2, { duration: 1, ease: "easeInOut" }],
    "Animate Y axis",
    [magnitude, 0, { duration: 0.3, ease: "easeIn" }],
    [angle, Math.PI * 1.5, { duration: 0.01 }],
    [magnitude, radius, { duration: 0.3, ease: "easeOut" }],
    [magnitude, 0, { duration: 0.3, ease: "easeIn" }],
    [angle, Math.PI * 2.5, { duration: 0.01 }],
    [magnitude, radius, { duration: 0.3, ease: "easeOut" }],
    "Animate X axis",
    [angle, Math.PI * 2, { duration: 0.4, ease: "easeInOut" }],
    [magnitude, radius, { duration: 0.3, ease: "easeInOut" }],
    [magnitude, 0, { duration: 0.3, ease: "easeIn" }],
    [angle, Math.PI * 1, { duration: 0.01 }],
    [magnitude, radius, { duration: 0.3, ease: "easeOut" }],
    [magnitude, 0, { duration: 0.3, ease: "easeIn" }],
    [angle, Math.PI * 2, { duration: 0.01 }],
    [magnitude, radius, { duration: 0.3, ease: "easeOut" }],
  ];

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative h-full grid grid-cols-2 select-none -ml-[15px] w-[calc(100%+30px)]"
      >
        <motion.svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full touch-none select-none cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <defs>
            <marker
              id="arrow-vrg"
              markerWidth="4"
              markerHeight="4"
              refX="0"
              refY="2"
              orient="auto"
            >
              <motion.polygon points="0 0, 4 2, 0 4" fill={vectorColor} />
            </marker>
            <marker
              id="dot-vrg"
              markerWidth="2"
              markerHeight="2"
              refX="1"
              refY="1"
              orient="auto"
            >
              <motion.circle cx="1" cy="1" r="1" fill={vectorColor} />
            </marker>
          </defs>

          {/* Vector in circle */}
          <g>
            <circle
              cx={vectorCenterX}
              cy={vectorCenterY}
              r={radius}
              fill="none"
              strokeWidth={1}
              className="stroke-slate-400/30 dark:stroke-slate-500/30 fill-slate-500/10 dark:fill-slate-500/10"
            />
            <motion.line
              x1={vectorCenterX}
              y1={vectorCenterY}
              x2={endX}
              y2={endY}
              strokeWidth={vectorStrokeWidth}
              markerStart="url(#dot-vrg)"
              markerEnd="url(#arrow-vrg)"
              stroke={vectorColor}
            />
          </g>
        </motion.svg>

        <div className="flex items-center justify-center relative">
          <div className="grid grid-cols-[auto_1fr] gap-4 w-full items-start px-4 py-8">
            <div className="flex items-center justify-center">
              <motion.div
                className="w-8 h-8 rounded"
                style={{ backgroundColor: redColor }}
              />
            </div>
            <div className="flex flex-col">
              <div className="font-medium">
                Red: <motion.span>{r}</motion.span>
              </div>
              <div className="font-medium text-sm">
                X axis: <motion.span>{nxText}</motion.span>
              </div>
              <div className="relative h-3 rounded bg-white/70 dark:bg-white/10 w-full max-w-full mt-2">
                <motion.div
                  className="absolute inset-0 rounded"
                  style={{
                    backgroundColor: redColor,
                    width: useTransform(() => `${redIntensity.get() * 100}%`),
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <motion.div
                className="w-8 h-8 rounded"
                style={{ backgroundColor: greenColor }}
              />
            </div>
            <div className="flex flex-col">
              <div className="font-medium">
                Green: <motion.span>{g}</motion.span>
              </div>
              <div className="font-medium text-sm">
                Y axis: <motion.span>{nyText}</motion.span>
              </div>
              <div className="relative h-3 rounded bg-white/70 dark:bg-white/10 w-full max-w-full mt-2">
                <motion.div
                  className="absolute inset-0 rounded"
                  style={{
                    backgroundColor: greenColor,
                    width: useTransform(() => `${greenIntensity.get() * 100}%`),
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <motion.div
                className="w-8 h-8 rounded"
                style={{
                  backgroundColor: blendedColor,
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="font-medium mb-2">
                Result
                <span className="text-sm opacity-60"> (Blended)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <ReplayButton animation={animation} sequence={animationSequence} />
      </div>
    </>
  );
};
