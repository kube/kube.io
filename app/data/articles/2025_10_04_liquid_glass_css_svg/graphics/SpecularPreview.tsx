import { AnimationSequence } from "motion";
import {
  animate,
  AnimationPlaybackControlsWithThen,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ReplayButton } from "../components/Buttons";
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
  const isCloseToView = useInView(containerRef, {
    once: true,
    margin: "200px",
  });
  const isInView = useInView(containerRef, { once: true, amount: 0.9 });

  // Controllable parameter
  const specularAngle = useMotionValue(-Math.PI / 3); // 60 degrees default

  // Use useTransform for reactive specular image data
  const specularImage = useTransform(specularAngle, (angle) => {
    if (!isCloseToView) return null;
    return calculateRefractionSpecular(
      objectWidth,
      objectHeight,
      radius,
      bezelWidth,
      angle,
      2 // device pixel ratio
    );
  });

  // Update canvas when image data changes
  useEffect(() => {
    if (!isCloseToView) return;

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
    canvas.width = initialCanvasImageData.width;
    canvas.height = initialCanvasImageData.height;
    const initialBrowserImageData = new ImageData(
      new Uint8ClampedArray(initialCanvasImageData.data),
      initialCanvasImageData.width,
      initialCanvasImageData.height
    );
    ctx.putImageData(initialBrowserImageData, 0, 0);

    return () => unsubscribe();
  }, [isCloseToView, specularImage]);

  // Use useTransform for reactive angle display
  const angleDegrees = useTransform(specularAngle, (angle) =>
    Math.round((angle * 180) / Math.PI)
  );

  // Reactive line end based on specular angle (centered in SVG viewBox)
  const centerX = 125; // half of 250 viewBox width
  const centerY = 125; // half of 250 viewBox height
  const lineLength = 110; // length of the indicator line

  // Drag handling to set angle by pointer relative to center
  const svgRef = useRef<SVGSVGElement>(null);

  const isDragging = useMotionValue(0);
  const vectorVisibility = useSpring(isDragging, {
    stiffness: 300,
    damping: 30,
  });

  const updateAngleFromPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const viewX = (localX / rect.width) * 250; // scale to viewBox
    const viewY = (localY / rect.height) * 250;
    const dx = viewX - centerX;
    const dy = centerY - viewY; // invert Y to keep mathematical orientation
    const angle = Math.atan2(dy, dx);
    // Clamp to [-PI, PI] implicitly by atan2; update motion value
    specularAngle.set(angle);
  };

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!isDragging.get()) return;
      updateAngleFromPointer(e.clientX, e.clientY);
    };
    const handleUp = () => {
      isDragging.set(0);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    isDragging.set(1);
    updateAngleFromPointer(e.clientX, e.clientY);
  };

  // Mirror motion value into state for slider controlled value
  const [angleSnapshot, setAngleSnapshot] = useState(specularAngle.get());
  useEffect(() => {
    const unsub = specularAngle.on("change", (v) => setAngleSnapshot(v));
    return () => unsub();
  }, [specularAngle]);

  // Animation

  const animation = useMotionValue<AnimationPlaybackControlsWithThen | null>(
    null
  );
  const sequence: AnimationSequence = [
    [isDragging, 1, { duration: 0.01 }],
    [
      specularAngle,
      -Math.PI / 3,
      {
        duration: 0.4,
        ease: "easeInOut",
      },
    ],
    [
      specularAngle,
      Math.PI / 3,
      {
        duration: 2,
        ease: "easeInOut",
      },
    ],
    [isDragging, 0, { duration: 0.01 }],
  ];

  // Start animation when in view
  useEffect(() => {
    if (isInView) animate(sequence);
  }, [isInView, specularAngle]);

  return (
    <div
      ref={containerRef}
      className="text-neutral-900 dark:text-neutral-100 select-none -ml-[15px] w-[calc(100%+30px)] flex flex-col items-center gap-6 touch-pan-y"
    >
      {/* Specular preview */}
      <div className="relative w-full bg-black h-105 overflow-hidden rounded-xl px-8 py-16 flex items-center justify-center border border-neutral-200/50 dark:border-neutral-700/60">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={twMerge(
              "rounded-lg h-60 sm:h-80 transition-opacity duration-500",
              isCloseToView ? "opacity-100" : "opacity-0"
            )}
          />
          <svg
            ref={svgRef}
            className="absolute top-0 left-0 w-full h-full touch-none cursor-grab active:cursor-grabbing"
            viewBox="0 0 250 250"
            onPointerDown={onPointerDown}
            onPointerUp={() => {
              isDragging.set(0);
            }}
          >
            <defs>
              <marker
                id="specular-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0 0 L8 4 L0 8 z" fill="#334455" />
              </marker>
            </defs>
            <motion.line
              x1={centerX}
              y1={centerY}
              x2={useTransform(
                () =>
                  centerX +
                  lineLength *
                    Math.cos(specularAngle.get()) *
                    vectorVisibility.get()
              )}
              y2={useTransform(
                () =>
                  centerY -
                  lineLength *
                    Math.sin(specularAngle.get()) *
                    vectorVisibility.get()
              )}
              stroke="#334455"
              opacity={vectorVisibility}
              strokeWidth={useTransform(() => 2 * vectorVisibility.get())}
              strokeLinecap="round"
              markerEnd="url(#specular-arrow)"
            />
          </svg>
        </div>

        <div className="absolute right-3 bottom-3 opacity-80">
          <ReplayButton animation={animation} sequence={sequence} />
        </div>
      </div>

      {/* Slider control */}
      <div className="flex flex-col items-center gap-3">
        <label className="text-sm font-medium">
          Specular Angle:{" "}
          <motion.span className="tabular-nums">{angleDegrees}</motion.span>°
        </label>
        <input
          type="range"
          min={-Math.PI}
          max={Math.PI}
          step={Math.PI / 180} // 1 degree steps
          value={angleSnapshot}
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
          <span>-180°</span>
          <span>0°</span>
          <span>180°</span>
        </div>
      </div>
    </div>
  );
};
