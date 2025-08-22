import { RotateCcwIcon } from "lucide-react";
import * as React from "react";
import { ConcavePath24, ConvexPath24, LipPath24 } from "./Functions";

type ButtonProps = {
  onClick?: () => void;
  title?: string;
  active?: boolean;
  className?: string;
};

const baseBtn =
  "group inline-flex items-center justify-center bg-slate-500/70 text-white/80 p-3 rounded-full hover:bg-slate-600/80 active:bg-slate-700/90 transition-colors";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const ReplayButton: React.FC<ButtonProps> = ({
  onClick,
  title = "Replay",
  active,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      title={title}
      className={cx(baseBtn, active && "ring-2 ring-blue-400/70", className)}
    >
      <RotateCcwIcon
        size={20}
        className="group-hover:scale-110 group-active:scale-90 transition-transform"
      />
    </button>
  );
};

function SurfaceIcon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform group-hover:scale-110 group-active:scale-90"
    >
      <path d={d} />
    </svg>
  );
}

function SurfaceButtonBase({
  onClick,
  title,
  active,
  className,
  d,
}: ButtonProps & { d: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      title={title}
      className={cx(baseBtn, active && "ring-2 ring-blue-400/70", className)}
    >
      <SurfaceIcon d={d} />
    </button>
  );
}

export const ConvexButton: React.FC<ButtonProps> = (props) => (
  <SurfaceButtonBase
    {...props}
    title={props.title ?? "Convex"}
    d={ConvexPath24}
  />
);

export const ConcaveButton: React.FC<ButtonProps> = (props) => (
  <SurfaceButtonBase
    {...props}
    title={props.title ?? "Concave"}
    d={ConcavePath24}
  />
);

export const LipButton: React.FC<ButtonProps> = (props) => (
  <SurfaceButtonBase {...props} title={props.title ?? "Lip"} d={LipPath24} />
);
