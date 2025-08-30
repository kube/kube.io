import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { Filter } from "../components/Filter";

export const Slider: React.FC = () => {
  const min = 0;
  const max = 100;
  const value = useMotionValue(10);

  const sliderHeight = 22;
  const sliderWidth = 450;

  // Use numeric MotionValue (0/1) instead of boolean for compatibility with transforms
  const pointerDown = useMotionValue(1);

  const thumbWidth = 160;
  const thumbHeight = 94;
  const thumbRadius = 47;
  const bezelWidth = 40;
  const glassThickness = 90;
  const refractiveIndex = 1.45;
  const blur = 0;
  const scaleRatio = useSpring(useTransform(pointerDown, [0, 1], [0.4, 0.9]));
  const specularOpacity = 0.9;

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const SCALE_REST = 0.6;
  const SCALE_DRAG = 1;
  const thumbWidthRest = thumbWidth * SCALE_REST;

  const scaleSpring = useSpring(
    useTransform(pointerDown, [0, 1], [SCALE_REST, SCALE_DRAG]),
    {
      damping: 80,
      stiffness: 2000,
    }
  );

  const backgroundOpacity = useSpring(
    useTransform(pointerDown, [0, 1], [1, 0.1]),
    {
      damping: 80,
      stiffness: 2000,
    }
  );

  // End drag when releasing outside the element
  useEffect(() => {
    function onPointerUp() {
      pointerDown.set(0);
    }
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, []);

  // —————————————————————————————————————————————
  // Background toggle (grid pattern vs. Unsplash image)
  const [useImageBg, setUseImageBg] = useState(false);
  const containerStyle: React.CSSProperties = useImageBg
    ? {
        backgroundImage:
          'url("https://images.unsplash.com/photo-1532210317995-cc56d90177d9?q=80&w=1600&auto=format&fit=crop")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundImage:
          "linear-gradient(to right, currentColor 1px, transparent 1px)," +
          "linear-gradient(to bottom, currentColor 1px, transparent 1px)," +
          "radial-gradient(120% 100% at 10% 0%, var(--bg1), var(--bg2))",
        backgroundSize: "24px 24px, 24px 24px, 100% 100%",
        // Offset the grid so it doesn't align with the top/left border
        backgroundPosition: "12px 12px, 12px 12px, 0 0",
      };

  return (
    <div
      className="relative h-96 flex justify-center items-center rounded-xl -ml-[15px] w-[calc(100%+30px)] select-none text-black/5 dark:text-white/5 [--bg1:#f8fafc] [--bg2:#e7eeef] dark:[--bg1:#1b1b22] dark:[--bg2:#0f0f14] border border-black/10 dark:border-white/10"
      style={containerStyle}
    >
      <motion.div
        style={{
          position: "relative",
          width: sliderWidth,
          height: thumbHeight,
        }}
      >
        <motion.div
          ref={trackRef}
          style={{
            display: "inline-block",
            width: sliderWidth,
            height: sliderHeight,
            left: 0,
            top: (thumbHeight - sliderHeight) / 2,
            backgroundColor: "#77777799",
            borderRadius: sliderHeight / 2,
            position: "absolute",
            cursor: "pointer",
          }}
          onMouseDown={() => {
            pointerDown.set(1);
          }}
          onMouseUp={() => {
            pointerDown.set(0);
          }}
        >
          <div className="w-full h-full overflow-hidden rounded-full">
            <motion.div
              style={{
                top: 0,
                left: 0,
                height: sliderHeight,
                width: useTransform(value, (v) => `${v}%`),
                borderRadius: `${sliderHeight / 2}px 2px 2px ${
                  sliderHeight / 2
                }px`,
                backgroundColor: "#0377F7",
              }}
            />
          </div>
        </motion.div>

        <Filter
          id="thumb-filter-slider"
          width={thumbWidth}
          height={thumbHeight}
          radius={thumbRadius}
          bezelWidth={bezelWidth}
          glassThickness={glassThickness}
          refractiveIndex={refractiveIndex}
          blur={blur}
          scaleRatio={scaleRatio}
          specularOpacity={specularOpacity}
          bezelHeightFn={(x) => {
            const circle = Math.sqrt(1 - (1 - x * 2) ** 2);
            const sin = Math.cos((x + 0.5) * 2 * Math.PI) / 40 + 0.5;
            const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
            const ratioCircle = 1 - smootherstep;
            return circle * ratioCircle + sin * (1 - ratioCircle);
          }}
        />

        <motion.div
          ref={thumbRef}
          drag="x"
          dragConstraints={{
            left: -thumbWidthRest / 3,
            right: sliderWidth - thumbWidth + thumbWidthRest / 3,
          }}
          dragElastic={0.02}
          onMouseDown={() => {
            pointerDown.set(1);
          }}
          onMouseUp={() => {
            pointerDown.set(0);
          }}
          onDragStart={() => {
            pointerDown.set(1);
          }}
          onDrag={(_) => {
            const track = trackRef.current!.getBoundingClientRect();
            const thumb = thumbRef.current!.getBoundingClientRect();

            const x0 = track.left + thumbWidthRest / 2;
            const x100 = track.right - thumbWidthRest / 2;

            const trackInsideWidth = x100 - x0;

            const thumbCenterX = thumb.left + thumb.width / 2;

            const x = Math.max(x0, Math.min(x100, thumbCenterX));
            const ratio = (x - x0) / trackInsideWidth;

            value.set(Math.max(min, Math.min(max, ratio * (max - min) + min)));
          }}
          onDragEnd={() => {
            pointerDown.set(0);
          }}
          dragMomentum={false}
          className="absolute"
          style={{
            height: thumbHeight,
            width: thumbWidth,
            top: 0,
            borderRadius: thumbRadius,
            backdropFilter: `url(#thumb-filter-slider)`,
            scale: scaleSpring,
            cursor: "pointer",

            backgroundColor: useTransform(
              backgroundOpacity,
              (op) => `rgba(255, 255, 255, ${op})`
            ),
            boxShadow: "0 4px 22px rgba(0,0,0,0.1)",
          }}
        />
      </motion.div>

      {/* Toggle control */}
      <label className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white/10 dark:bg-black/10 backdrop-blur px-2 py-1 rounded-md flex items-center gap-2 text-black/80 dark:text-white/80">
        <input
          type="checkbox"
          checked={useImageBg}
          onChange={(e) => setUseImageBg(e.target.checked)}
          className="accent-blue-600"
        />
        Use image background
      </label>
    </div>
  );
};
