import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import React, { useEffect, useRef } from "react";
import { calculateRefractionSpecular } from "../lib/specular";

export const SpecularPreview: React.FC = () => {
  // Fixed parameters
  const objectWidth = 400;
  const objectHeight = 250;
  const radius = 120;
  const bezelWidth = 25;

  // Refs and in-view detection
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.8 });

  // Controllable parameter
  const specularAngle = useMotionValue(Math.PI / 3); // 60 degrees default

  // Start animation when in view
  useEffect(() => {
    if (isInView) {
      animate(specularAngle, [-Math.PI / 3, Math.PI / 3], {
        duration: 2,
        ease: "easeInOut",
      });
    }
  }, [isInView, specularAngle]);

  // Use useTransform for reactive specular image data
  const specularImage = useTransform(specularAngle, (angle) => {
    if (!isInView) return null;
    return calculateRefractionSpecular(
      objectWidth,
      objectHeight,
      radius,
      bezelWidth,
      angle,
      1 // device pixel ratio
    );
  });

  // Update canvas when image data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const unsubscribe = specularImage.on("change", (canvasImageData) => {
      if (!canvasImageData) return;
      // Convert canvas ImageData to browser ImageData
      const browserImageData = new ImageData(
        new Uint8ClampedArray(canvasImageData.data),
        canvasImageData.width,
        canvasImageData.height
      );
      ctx.putImageData(browserImageData, 0, 0);
    });

    // Initialize with current value
    const initialCanvasImageData = specularImage.get();
    if (!initialCanvasImageData) return;
    const initialBrowserImageData = new ImageData(
      new Uint8ClampedArray(initialCanvasImageData.data),
      initialCanvasImageData.width,
      initialCanvasImageData.height
    );
    ctx.putImageData(initialBrowserImageData, 0, 0);

    return () => unsubscribe();
  }, [isInView, specularImage]);

  // Use useTransform for reactive angle display
  const angleDegrees = useTransform(specularAngle, (angle) =>
    Math.round((angle * 180) / Math.PI)
  );

  return (
    <div
      ref={containerRef}
      className="text-neutral-900 dark:text-neutral-100 select-none -ml-[15px] w-[calc(100%+30px)]"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Specular preview */}
        <div className="w-full bg-black rounded-xl px-8 py-16 flex items-center justify-center border border-neutral-200/50 dark:border-neutral-700/60">
          <canvas
            ref={canvasRef}
            width={objectWidth}
            height={objectHeight}
            className="rounded-lg"
          />
        </div>

        {/* Slider control */}
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-medium">
            Specular Angle: <motion.span>{angleDegrees.get()}</motion.span>°
          </label>
          <input
            type="range"
            min="0"
            max={Math.PI}
            step={Math.PI / 180} // 1 degree steps
            defaultValue={specularAngle.get()}
            onChange={(e) => specularAngle.set(parseFloat(e.target.value))}
            className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 
                     [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 
                     [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md
                     [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full 
                     [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer 
                     [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
          />
          <div className="flex justify-between w-64 text-xs text-gray-500 dark:text-gray-400">
            <span>0°</span>
            <span>90°</span>
            <span>180°</span>
          </div>
        </div>
      </div>
    </div>
  );
};
