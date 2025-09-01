import { Fragment, useMemo } from "react";
import {
  CONCAVE,
  CONVEX,
  LIP,
  type SurfaceFnDef,
  fns,
} from "../lib/surfaceEquations";

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
    d += `${i === 0 ? "M" : " L"} ${px} ${py}`;
  }
  return d;
}

// Export ready-to-use path data for button icons (24px)
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
  label: string;
}> = ({ fn, label }) => {
  const size = 128;
  const pad = 8;
  const w = size;
  const h = size;
  const samples = 96;

  const path = useMemo(
    () => generateFunctionPath(fn, { size, pad, samples }),
    [fn, size, pad, samples]
  );

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-28 h-28 sm:w-32 sm:h-32">
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
      <text
        x={pad}
        y={h - 4}
        className="fill-slate-600 dark:fill-slate-300 text-[10px]"
      >
        {label}
      </text>
    </svg>
  );
};

function FunctionDetails({
  title,
  desc,
  equation,
}: Pick<SurfaceFnDef, "title" | "desc" | "equation">) {
  return (
    <div className="min-w-0 h-full flex flex-col justify-center">
      <div className="font-semibold text-base">{title}</div>
      <div className="text-xs sm:text-sm opacity-80 mt-1">{desc}</div>
      <div className="mt-2 text-xs sm:text-sm">
        <span className="opacity-70 mr-2">Equation:</span>
        <code className="px-1 py-0.5 rounded bg-slate-500/10 dark:bg-slate-300/10">
          {equation}
        </code>
      </div>
    </div>
  );
}

export const Functions: React.FC = () => {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-8 items-start w-full">
      {fns.map((d) => (
        <Fragment key={d.key}>
          <FunctionPlot fn={d.fn} label={d.title} />
          <FunctionDetails
            title={d.title}
            desc={d.desc}
            equation={d.equation}
          />
        </Fragment>
      ))}
    </div>
  );
};
