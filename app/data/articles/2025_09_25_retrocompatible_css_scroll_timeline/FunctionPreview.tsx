import { Matrix, Vector } from "@kube/math";
import { PauseIcon, PlayIcon } from "lucide-react";
import { animate } from "motion";
import {
  motion,
  MotionValue,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LogoStatic } from "../../../components/Logo";
import { cn } from "../../../utils";

type FunctionPreviewProps = {
  affineMap: [[number, number], [number, number]];
  viewport: [[number, number], [number, number]];
};

const WIDTH = 400;
const HEIGHT = 150;

const DocumentPreview: React.FC<{
  currentX: MotionValue;
  currentY: MotionValue;
}> = ({ currentX, currentY }) => {
  return (
    <div className="rounded-xs h-[340px] w-[290px] p-10 border-x border-t overflow-hidden relative bg-(--palette-background-color)/40">
      <motion.div
        style={{ height: useTransform(currentY, (y) => `${y / 2}px`) }}
        className="z-10 px-10 absolute top-0 left-0 w-full flex items-center bg-(--palette-text-color)"
      >
        <LogoStatic className="w-[18px] fill-slate-400/70" />
      </motion.div>

      <motion.div
        style={{
          y: useTransform(currentX, (x) => -x),
        }}
        className="flex gap-2 flex-col opacity-80 mt-10"
      >
        <div className="border-b-6 border-gray-500 mb-3 w-[40%]" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500 w-[30%] mb-3" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500 w-[50%] mb-3" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500 w-[80%] mb-3" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500" />
        <div className="border-b-1 border-gray-500 w-[80%] mb-3" />
      </motion.div>
    </div>
  );
};

export const FunctionPreview: React.FC<FunctionPreviewProps> = ({
  affineMap,
  viewport,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Affine Interval
  const [[x1, x2], [y1, y2]] = affineMap;

  // Viewport Intervals
  const [[vX1, vX2], [vY1, vY2]] = viewport;

  const viewportWidth = Math.abs(vX2 - vX1);
  const viewportHeight = Math.abs(vY2 - vY1);

  const transformMatrixSvg = Matrix.identity(4)
    // Map viewport to SVG space
    .dot(Matrix.translation(-vX1, -vY1, 0))
    .dot(Matrix.scaleX(WIDTH / viewportWidth))
    .dot(Matrix.scaleY(HEIGHT / viewportHeight))
    // Flip origin at bottom
    .dot(Matrix.scaleY(-1))
    .dot(Matrix.translationY(HEIGHT));

  const inverseTransformMatrix = transformMatrixSvg.inverse();

  const transformMatrixDiv = Matrix.identity(4)
    // Map viewport to div space
    .dot(Matrix.translation(-vX1, -vY1, 0))
    .dot(Matrix.scaleX(100 / viewportWidth))
    .dot(Matrix.scaleY(100 / viewportHeight))
    .dot(Matrix.scaleY(-1))
    .dot(Matrix.translationY(100));

  function pSvg(x: number, y: number) {
    const v = new Vector([x, y, 0, 1]);
    const v2 = v.multiplyByMatrix(transformMatrixSvg);
    return [v2[0], v2[1]];
  }

  function pDiv(x: number, y: number) {
    const v = new Vector([x, y, 0, 1]);
    const v2 = v.multiplyByMatrix(transformMatrixDiv);
    return [v2[0], v2[1]];
  }

  // Function to calculate the y-coordinate based on the x-coordinate in absolute space
  function f(x: number) {
    const pente = (y2 - y1) / (x2 - x1);
    const y = y1 + pente * (x - x1);

    const yMax = Math.max(y1, y2);
    const yMin = Math.min(y1, y2);

    return Math.min(yMax, Math.max(yMin, y));
  }

  const currentX = useMotionValue(0);
  const currentY = useTransform(currentX, f);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    currentX.on("animationStart", () => {
      console.log("Animation started");
      setIsAnimating(true);
    });
    currentX.on("animationComplete", () => setIsAnimating(false));
    currentX.on("animationCancel", () => setIsAnimating(false));
  }, []);

  const [isPanning, setIsPanning] = useState(false);
  useEffect(() => {
    if (!isPanning) return;
    // Add event listener for mouse up to stop panning
    const handleMouseUp = () => setIsPanning(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isPanning]);

  return (
    <div className="contain-layout flex flex-col w-full select-none rounded-3xl border border-[var(--palette-text-color)]/5">
      <div className="shrink-0 flex items-center justify-center pt-4 bg-(--palette-text-color)/5 rounded-t-3xl">
        <DocumentPreview currentX={currentX} currentY={currentY} />
      </div>

      <div className="w-full bg-(--palette-background-color)/70 rounded-b-3xl">
        <div className="relative">
          <motion.svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className={cn(
              "w-full select-none touch-pan-y",
              isPanning ? "cursor-grabbing" : "cursor-grab"
            )}
            onPanStart={(e, info) => {
              setIsPanning(true);
              e.preventDefault();
              e.stopPropagation();
              const rect = svgRef.current!.getBoundingClientRect();
              // Get the mouse coordinates relative to the SVG element
              const y = (rect.bottom - info.point.y) * (HEIGHT / rect.height);
              const x = (info.point.x - rect.left) * (WIDTH / rect.width);
              // Transform the mouse coordinates to the affine space
              const v = new Vector([x, y, 0, 1]);
              const transformed = v.multiplyByMatrix(inverseTransformMatrix);
              // Update the currentX motion value with the transformed x-coordinate
              currentX.set(transformed[0]);
            }}
            onPan={(e, info) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = svgRef.current!.getBoundingClientRect();
              // Get the mouse coordinates relative to the SVG element
              const y = (rect.bottom - info.point.y) * (HEIGHT / rect.height);
              const x = (info.point.x - rect.left) * (WIDTH / rect.width);
              // Transform the mouse coordinates to the affine space
              const v = new Vector([x, y, 0, 1]);
              const transformed = v.multiplyByMatrix(inverseTransformMatrix);
              // Update the currentX motion value with the transformed x-coordinate
              currentX.set(transformed[0]);
            }}
            onPanEnd={() => {
              setIsPanning(false);
            }}
          >
            <motion.path
              className="stroke-cyan-500/80 dark:stroke-cyan-600/80"
              strokeLinecap="round"
              fill="none"
              strokeWidth={1}
              d={`M${pSvg(vX1, y1)} L${pSvg(x1, y1)} L${pSvg(x2, y2)} L${pSvg(
                vX2,
                y2
              )}`}
            />

            <motion.line />
          </motion.svg>

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <motion.div
              className={cn(
                "rounded-full absolute left-0 bg-cyan-500 z-20 transition-[width,height] duration-200 ease-in-out",
                isPanning ? "w-6 h-6" : "w-4 h-4"
              )}
              style={{
                left: useTransform(currentX, (x) => `${pDiv(x, f(x))[0]}%`),
                top: useTransform(currentY, (y) => `${pDiv(0, y)[1]}%`),
                y: "-50%",
                x: "-50%",
              }}
            />

            <motion.div
              className={cn(
                "rounded absolute top-0 left-0 bg-slate-500 z-20 px-2 text-sm text-white -m-2 transition-[opacity,transform]",
                isPanning ? "opacity-100" : "opacity-0"
              )}
              style={{
                left: useTransform(currentX, (x) => `${pDiv(x, f(x))[0]}%`),
                // @ts-expect-error
                "--currentXDisplay": useTransform(
                  currentX,
                  (x) => `"${Math.round(x)}"`
                ),
                "--currentYDisplay": useTransform(
                  currentY,
                  (y) => `"${Math.round(y)}"`
                ),
              }}
            >
              <motion.div className="[&::before]:content-['x:'] [&::after]:content-(--currentXDisplay)" />
              <motion.div className="[&::before]:content-['y:'] [&::after]:content-(--currentYDisplay)" />
            </motion.div>

            <motion.div
              className="absolute w-[2px] -ml-[1px] top-0 h-full bg-slate-500/50"
              style={{
                left: useTransform(currentX, (x) => `${pDiv(x, f(x))[0]}%`),
              }}
            />
          </div>
        </div>

        <div className="w-full h-16 flex items-center justify-center">
          <button
            className="rounded-full bg-gray-200 dark:bg-gray-800 p-2 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all hover:cursor-pointer hover:scale-110 active:scale-95"
            onClick={() => {
              if (isAnimating) {
                currentX.stop();
                return;
              } else {
                currentX.set(0);
                animate(currentX, 200, { duration: 2, ease: "linear" });
              }
            }}
          >
            {isAnimating ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};
