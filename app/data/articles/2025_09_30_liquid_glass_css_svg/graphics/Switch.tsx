import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useState } from "react";
import { Filter } from "../components/Filter";

export const Switch: React.FC = () => {
  // —————————————————————————————————————————————
  // CONSTANTS (layout + optics)
  const sliderHeight = 166;
  const sliderWidth = 418;
  const width = 390;
  const height = 230;
  const radius = 115;
  const bezelWidth = 50;
  const glassThickness = 130;
  const refractiveIndex = 1.9;
  const blur = 0;
  const specularOpacity = 0.9;

  // —————————————————————————————————————————————
  // SOURCES OF TRUTH (Motion)
  const checkedMV = useMotionValue<number>(1); // 0->off, 1->on
  const pointerDownMV = useMotionValue<number>(0); // 0->idle, 1->pressed

  const toggleChecked = () => {
    checkedMV.set(checkedMV.get() ? 0 : 1);
  };

  // End press when releasing outside the element
  useEffect(() => {
    const onPointerUp = () => pointerDownMV.set(0);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [pointerDownMV]);

  // —————————————————————————————————————————————
  // DERIVED TRANSFORMS (pure)
  const trackBg = useTransform(checkedMV, [0, 1], ["#77777799", "#5BBF5EDD"]);
  const buttonXTarget = useTransform(checkedMV, [0, 1], [-69, -31]); // in %
  const backgroundOpacityTarget = useTransform(pointerDownMV, [0, 1], [1, 0.1]);
  const thumbScaleTarget = useTransform(pointerDownMV, [0, 1], [0.6, 1]);
  const scaleRatioTarget = useTransform(pointerDownMV, [0, 1], [0.4, 0.9]);

  // —————————————————————————————————————————————
  // SPRINGS (animated derivatives)
  const buttonX = useSpring(buttonXTarget, { damping: 60, stiffness: 800 });
  const backgroundOpacity = useSpring(backgroundOpacityTarget, {
    damping: 80,
    stiffness: 2000,
  });
  const thumbScale = useSpring(thumbScaleTarget, {
    damping: 80,
    stiffness: 2000,
  });
  const scaleRatio = useSpring(scaleRatioTarget, {
    damping: 80,
    stiffness: 2000,
  });

  // —————————————————————————————————————————————
  // STYLE TRANSFORMS (stringified values for JSX styles)
  const thumbXPercent = useTransform(buttonX, (v) => `${v}%`);
  const thumbBgColor = useTransform(
    backgroundOpacity,
    (op) => `rgba(255, 255, 255, ${op})`
  );

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
          display: "inline-block",
          width: sliderWidth,
          height: sliderHeight,
          backgroundColor: trackBg,
          borderRadius: sliderHeight / 2,
          position: "relative",
          cursor: "pointer",
        }}
        onClick={toggleChecked}
        onMouseDown={() => pointerDownMV.set(1)}
        onMouseUp={() => pointerDownMV.set(0)}
      >
        <Filter
          id="thumb-filter"
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
          className="absolute"
          style={{
            height,
            width,
            x: thumbXPercent,
            y: "-50%",
            borderRadius: radius,
            top: sliderHeight / 2,
            left: sliderWidth / 2,
            backdropFilter: `url(#thumb-filter)`,
            scale: thumbScale,
            backgroundColor: thumbBgColor,
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
