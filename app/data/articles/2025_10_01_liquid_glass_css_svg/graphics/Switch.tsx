import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect } from "react";
import { Filter } from "virtual:refractionFilter?width=146&height=92&radius=46&bezelWidth=27&glassThickness=58&bezelType=lip&refractiveIndex=1.5";

export const Switch: React.FC = () => {
  // —————————————————————————————————————————————
  // CONSTANTS (layout + optics)
  const sliderHeight = 67;
  const sliderWidth = 160;
  const thumbWidth = 146;
  const thumbHeight = 92;
  const thumbRadius = thumbHeight / 2;
  const blur = useMotionValue(0.2); // 0..40
  const specularOpacity = useMotionValue(0.5); // 0..1
  const specularSaturation = useMotionValue(6); // 0..50
  const refractionBase = useMotionValue(1); // 0..1

  // —————————————————————————————————————————————
  // SOURCES OF TRUTH (Motion)
  const checkedMV = useMotionValue<number>(1); // 0->off, 1->on
  const pointerDownMV = useMotionValue<number>(0); // 0->idle, 1->pressed
  const forceActive = useMotionValue(false);

  const isUp = useTransform((): number =>
    forceActive.get() || pointerDownMV.get() > 0.5 ? 1 : 0
  );

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
  const trackBg = useTransform(checkedMV, [0, 1], ["#94949F77", "#3BBF4EEE"]);
  // Keep relative positions equivalent after halving sizes
  const buttonXTarget = useTransform(checkedMV, [0, 1], [-69.5, -30.5]); // in % (unchanged)
  const backgroundOpacityTarget = useTransform(isUp, [0, 1], [1, 0.1]);
  const thumbScaleTarget = useTransform(isUp, [0, 1], [0.65, 1]);
  const pressMultiplier = useTransform(isUp, [0, 1], [0.4, 0.9]);
  const scaleRatioTarget = useTransform(
    [pressMultiplier, refractionBase],
    ([m, base]) => (Number(m) || 0) * (Number(base) || 0)
  );

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

  // Readouts for the controls UI
  const specularOpacityText = useTransform(specularOpacity, (v) =>
    v.toFixed(2)
  );
  const specularSaturationText = useTransform(specularSaturation, (v) =>
    Math.round(v).toString()
  );
  const refractionLevelText = useTransform(refractionBase, (v) => v.toFixed(2));
  const blurText = useTransform(blur, (v) => v.toFixed(1));

  return (
    <>
      <div
        className="relative h-96 flex justify-center items-center rounded-xl -ml-[15px] w-[calc(100%+30px)] select-none text-black/5 dark:text-white/5 [--bg1:#f8fafc] [--bg2:#e7eeef] dark:[--bg1:#1b1b22] dark:[--bg2:#0f0f14] border border-black/10 dark:border-white/10"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px)," +
            "linear-gradient(to bottom, currentColor 1px, transparent 1px)," +
            "radial-gradient(120% 100% at 10% 0%, var(--bg1), var(--bg2))",
          backgroundSize: "24px 24px, 24px 24px, 100% 100%",
          // Offset the grid so it doesn't align with the top/left border
          backgroundPosition: "12px 12px, 12px 12px, 0 0",
        }}
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
          {/* Virtual Filter with inlined parameters */}
          <Filter
            id="thumb-filter"
            blur={blur}
            scaleRatio={scaleRatio}
            specularOpacity={specularOpacity}
            specularSaturation={specularSaturation}
          />

          <motion.div
            className="absolute"
            style={{
              height: thumbHeight,
              width: thumbWidth,
              x: thumbXPercent,
              y: "-50%",
              borderRadius: thumbRadius,
              top: sliderHeight / 2,
              left: sliderWidth / 2,
              backdropFilter: `url(#thumb-filter)`,
              scale: thumbScale,
              backgroundColor: thumbBgColor,
              boxShadow: useTransform(() => {
                const isPressed = pointerDownMV.get() > 0.5;
                return (
                  "0 4px 22px rgba(0,0,0,0.1)" +
                  (isPressed
                    ? ", inset 2px 7px 24px rgba(0,0,0,0.09), inset -2px -7px 24px rgba(255,255,255,0.09)"
                    : "")
                );
              }),
            }}
          />
        </motion.div>

        {/* Toggle control */}
        <label className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white/10 dark:bg-black/10 backdrop-blur px-2 py-1 rounded-md flex items-center gap-2 text-black/80 dark:text-white/80">
          <input
            type="checkbox"
            defaultChecked={forceActive.get()}
            onChange={(e) => forceActive.set(e.currentTarget.checked)}
            className="accent-blue-600"
          />
          Force active
        </label>
      </div>

      {/* Parameters controls (MotionValue-driven; no React state) */}
      <div className="mt-8 space-y-3 text-black/80 dark:text-white/80">
        <div className="flex items-center gap-4">
          <div className="uppercase tracking-[0.14em] text-[10px] opacity-70 select-none">
            Parameters
          </div>
          <div className="h-[1px] flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        {/* Specular Opacity */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none">
            Specular Opacity
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {specularOpacityText}
          </motion.span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={specularOpacity.get()}
            onInput={(e) =>
              specularOpacity.set(parseFloat(e.currentTarget.value))
            }
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Specular Opacity"
          />
        </div>

        {/* Specular Saturation */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none">
            Specular Saturation
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {specularSaturationText}
          </motion.span>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            defaultValue={specularSaturation.get()}
            onInput={(e) =>
              specularSaturation.set(parseFloat(e.currentTarget.value))
            }
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Specular Saturation"
          />
        </div>

        {/* Refraction Level */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none">
            Refraction Level
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {refractionLevelText}
          </motion.span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={refractionBase.get()}
            onInput={(e) =>
              refractionBase.set(parseFloat(e.currentTarget.value))
            }
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Refraction Level"
          />
        </div>

        {/* Blur Level */}
        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none">
            Blur Level
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {blurText}
          </motion.span>
          <input
            type="range"
            min={0}
            max={40}
            step={0.1}
            defaultValue={blur.get()}
            onInput={(e) => blur.set(parseFloat(e.currentTarget.value))}
            className="flex-1 appearance-none h-[2px] bg-black/20 dark:bg-white/20 rounded outline-none"
            aria-label="Blur Level"
          />
        </div>
      </div>
    </>
  );
};
