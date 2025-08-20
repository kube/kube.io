import { RotateCcwIcon } from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import * as React from "react";

export const VectorToRedGreen: React.FC = () => {
  const width = 400;
  const height = 300;

  const centerX = width / 2;
  const centerY = height / 2;

  const vectorCenterX = centerX / 2;
  const vectorCenterY = centerY;
  const radius = 90;
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
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const redIntensity = useTransform(nx, (v: number) => clamp01((v + 1) / 2));
  const greenIntensity = useTransform(ny, (v: number) => clamp01((v + 1) / 2));
  const redColor = useTransform(redIntensity, (ri: number) => {
    const r = Math.round(ri * 256);
    return `rgb(${r},0,0)`;
  });
  const greenColor = useTransform(greenIntensity, (gi: number) => {
    const g = Math.round(gi * 256);
    return `rgb(0,${g},0)`;
  });
  const blendedColor = useTransform(
    [redIntensity, greenIntensity],
    ([ri, gi]: number[]) => {
      const r = Math.round(ri * 256);
      const g = Math.round(gi * 256);
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
    () => 1 + (magnitude.get() / radius) * 3
  );

  // Layout for color squares on right half
  const squareSize = 30;
  const squaresStartX = centerX + 50; // ensure on right half
  const squaresStartY = 60;

  function startAnimation() {
    // Smoothly animate back
    animate([
      [magnitude, radius, { duration: 0.4, ease: "easeOut" }],
      [angle, Math.PI / 4, { duration: 0.4, ease: "easeOut" }],
      [angle, Math.PI, { duration: 0.4, ease: "easeOut" }],
    ]);
  }

  return (
    <div className="relative w-full h-full">
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
            <polygon points="0 0, 4 2, 0 4" fill="context-stroke" />
          </marker>
          <marker
            id="dot-vrg"
            markerWidth="2"
            markerHeight="2"
            refX="1"
            refY="1"
            orient="auto"
          >
            <circle cx="1" cy="1" r="1" fill="context-stroke" />
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

        {/* Color squares representing channel intensities */}
        <g fontFamily="system-ui, sans-serif" fontSize={12}>
          {/* Red */}
          <motion.rect
            x={squaresStartX}
            y={squaresStartY}
            width={squareSize}
            height={squareSize}
            rx={4}
            fill={redColor}
            stroke="currentColor"
            className="stroke-slate-900/40 dark:stroke-slate-300/40"
            style={{ fill: redColor as unknown as string }}
          />
          <motion.text
            x={squaresStartX + squareSize + 11}
            y={squaresStartY + 10}
            textAnchor="left"
            className="fill-slate-800 dark:fill-slate-200"
          >
            Red (X-axis)
          </motion.text>
          <rect
            x={squaresStartX + squareSize * 1.5 - 3}
            y={squaresStartY + 15}
            width={squareSize * 3}
            height={squareSize / 3}
            rx={5}
            fill="none"
            stroke="currentColor"
            className="stroke-slate-900/40 dark:stroke-slate-300/40"
          />
          <motion.circle
            cx={useTransform(
              () =>
                squaresStartX +
                squareSize * 1.5 +
                squareSize * 2.75 * redIntensity.get()
            )}
            cy={squaresStartY + 20}
            r={squareSize / 6}
            fill={redColor}
            stroke="currentColor"
            className="stroke-slate-900/40 dark:stroke-slate-300/40"
          />

          {/* Green */}
          <motion.rect
            x={squaresStartX}
            y={squaresStartY + squareSize + 40}
            width={squareSize}
            height={squareSize}
            rx={4}
            fill={greenColor}
            stroke="currentColor"
            className="stroke-slate-900/40 dark:stroke-slate-300/40"
            style={{ fill: greenColor as unknown as string }}
          />
          <motion.text
            x={squaresStartX + squareSize + 11}
            y={squaresStartY + squareSize + 40 + 10}
            textAnchor="left"
            className="fill-slate-800 dark:fill-slate-200"
          >
            Green (Y-axis)
          </motion.text>
          <rect
            x={squaresStartX + squareSize * 1.5 - 3}
            y={squaresStartY + squareSize + 40 + 15}
            width={squareSize * 3}
            height={squareSize / 3}
            rx={5}
            fill="none"
            stroke="currentColor"
            className="stroke-slate-900/40 dark:stroke-slate-300/40"
          />
          <motion.circle
            cx={useTransform(
              () =>
                squaresStartX +
                squareSize * 1.5 +
                squareSize * 2.75 * greenIntensity.get()
            )}
            cy={squaresStartY + squareSize + 40 + 20}
            r={squareSize / 6}
            fill={greenColor}
            stroke="currentColor"
            className="stroke-slate-900/40 dark:stroke-slate-300/40"
          />

          {/* Blended */}
          <motion.rect
            x={squaresStartX}
            y={squaresStartY + (squareSize + 40) * 2}
            width={squareSize}
            height={squareSize}
            rx={4}
            fill={blendedColor as unknown as string}
            stroke="currentColor"
            className="stroke-slate-900/40 dark:stroke-slate-300/40"
            style={{ fill: blendedColor as unknown as string }}
          />
          <motion.text
            x={squaresStartX + squareSize + 11}
            y={squaresStartY + (squareSize + 40) * 2 + 19}
            textAnchor="left"
            className="fill-slate-800 dark:fill-slate-200"
          >
            Result
          </motion.text>
        </g>
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
