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
  const pointerDown = useMotionValue(0);

  const width = 160;
  const height = 100;
  const radius = 50;
  const bezelWidth = 40;
  const glassThickness = 90;
  const refractiveIndex = 1.9;
  const blur = 0;
  const scaleRatioTarget = useTransform(pointerDown, [0, 1], [0.4, 0.9]);
  const scaleRatio = useSpring(scaleRatioTarget);
  const specularOpacity = 0.9;

  const constraintsRef = useRef<HTMLDivElement>(null);
  const scaleSpring = useSpring(useTransform(pointerDown, [0, 1], [0.6, 1]), {
    damping: 80,
    stiffness: 2000,
  });

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
      className="relative h-96 flex justify-center items-center rounded-xl -ml-[15px] w-[calc(100%+30px)] select-none text-black/5 dark:text-white/5 [--bg1:#f8fafc] [--bg2:#e7eef8] dark:[--bg1:#1b1b22] dark:[--bg2:#0f0f14] border border-black/10 dark:border-white/10"
      style={containerStyle}
    >
      <motion.div
        style={{
          position: "relative",
          width: sliderWidth,
          height: height,
        }}
      >
        <motion.div
          ref={constraintsRef}
          style={{
            display: "inline-block",
            width: sliderWidth,
            height: sliderHeight,
            left: 0,
            top: (height - sliderHeight) / 2,
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
          width={width}
          height={height}
          radius={radius}
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
          drag="x"
          dragConstraints={{ left: -40, right: sliderWidth - width + 40 }}
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
          onDrag={(_, info) => {
            const { x, width } =
              constraintsRef.current!.getBoundingClientRect();
            const ratio = (info.point.x - x) / width;
            value.set(Math.max(min, Math.min(max, ratio * (max - min) + min)));
          }}
          onDragEnd={() => {
            pointerDown.set(0);
          }}
          dragMomentum={false}
          className="absolute"
          // initial={{ x: `calc(${value.get()}% - ${width / 2}px)`, y: 0 }}
          style={{
            height,
            width,
            top: 0,
            borderRadius: radius,
            backdropFilter: `url(#thumb-filter-slider)`,
            scale: scaleSpring,
            cursor: "pointer",

            backgroundColor: useTransform(
              backgroundOpacity,
              (op) => `rgba(255, 255, 255, ${op})`
            ),
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
