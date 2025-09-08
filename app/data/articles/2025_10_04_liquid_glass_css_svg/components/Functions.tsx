import { useMemo } from "react";
import { CONCAVE, CONVEX, CONVEX_CIRCLE, LIP } from "../lib/surfaceEquations";

// Reusable path generator for icons or plots
export function generateFunctionPath(
  fn: (x: number) => number,
  options?: { size?: number; pad?: number; samples?: number }
): string {
  const size = options?.size ?? 24;
  const pad = options?.pad ?? Math.max(1, Math.floor(size / 12));
  const samples = options?.samples ?? Math.max(24, Math.floor(size * 2));
  const w = size;
  const h = size;
  let d = "";
  for (let i = 0; i <= samples; i++) {
    const x = i / samples; // [0,1]
    const y = Math.max(0, Math.min(1, fn(x))); // clamp to [0,1]
    const px = pad + x * (w - pad * 2);
    const py = h - (pad + y * (h - pad * 2));
    d += `${i === 0 ? "M" : " L"} ${px.toFixed(2)} ${py.toFixed(2)}`;
  }
  return d;
}

// Export ready-to-use path data for button icons (24px)
export const ConvexCirclePath24 = generateFunctionPath(CONVEX_CIRCLE.fn, {
  size: 24,
  pad: 3,
});
export const ConvexPath24 = generateFunctionPath(CONVEX.fn, {
  size: 24,
  pad: 3,
});
export const ConcavePath24 = generateFunctionPath(CONCAVE.fn, {
  size: 24,
  pad: 3,
});
export const LipPath24 = generateFunctionPath(LIP.fn, {
  size: 24,
  pad: 3,
});

export const FunctionPlot: React.FC<{
  fn: (x: number) => number;
}> = ({ fn }) => {
  const size = 128;
  const pad = 11;
  const w = size;
  const h = size;
  const samples = 96;

  const path = useMemo(
    () => generateFunctionPath(fn, { size, pad, samples }),
    [fn, size, pad, samples]
  );

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-24 h-24 sm:w-32 sm:h-32">
      <rect
        x={0.5}
        y={0.5}
        width={w - 1}
        height={h - 1}
        rx={6}
        className="fill-slate-500/10 dark:fill-slate-500/10 stroke-slate-400/40 dark:stroke-slate-500/40"
      />
      <path
        d={path}
        className="stroke-blue-500 dark:stroke-blue-400"
        strokeWidth={2.5}
        fill="none"
      />
    </svg>
  );
};
