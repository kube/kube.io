import {
  mix,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import React, { useEffect } from "react";
import { Filter } from "virtual:refractionFilter?width=146&height=92&radius=46&bezelWidth=19&glassThickness=47&bezelType=lip&refractiveIndex=1.5";

export const Switch: React.FC = () => {
  //
  // CONSTANTS (layout + optics)
  //
  const sliderHeight = 67;
  const sliderWidth = 160;
  const thumbWidth = 146;
  const thumbHeight = 92;
  const thumbRadius = thumbHeight / 2;
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const blur = useMotionValue(0.2);
  const specularOpacity = useMotionValue(0.5);
  const specularSaturation = useMotionValue(6);
  const refractionBase = useMotionValue(1);
  const xDragRatio = useMotionValue(0);

  const THUMB_REST_SCALE = 0.65;
  const THUMB_ACTIVE_SCALE = 0.9;

  const THUMB_REST_OFFSET = ((1 - THUMB_REST_SCALE) * thumbWidth) / 2;

  const TRAVEL =
    sliderWidth - sliderHeight - (thumbWidth - thumbHeight) * THUMB_REST_SCALE;

  //
  // MOTION SOURCES
  //
  const checked = useMotionValue(1);
  const pointerDown = useMotionValue(0);
  const forceActive = useMotionValue(false);
  const active = useTransform(() =>
    forceActive.get() || pointerDown.get() > 0.5 ? 1 : 0
  );

  //
  // GLOBAL POINTER-UP LISTENER
  //
  useEffect(() => {
    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      pointerDown.set(0);

      const x =
        e instanceof MouseEvent ? e.clientX : e.changedTouches[0].clientX;

      const distance = x - initialPointerX.get();
      if (Math.abs(distance) > 4) {
        const x = xDragRatio.get();
        const shouldBeChecked = x > 0.5;
        checked.set(shouldBeChecked ? 1 : 0);
      }
    };

    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [pointerDown, checked]);

  //
  // SPRINGS
  //
  const xRatio = useSpring(
    useTransform(() => {
      const c = checked.get();
      const dragRatio = xDragRatio.get();

      if (pointerDown.get() > 0.5) {
        return dragRatio;
      } else {
        return c ? 1 : 0;
      }
    }),
    { damping: 80, stiffness: 1000 }
  );
  const backgroundOpacity = useSpring(
    useTransform(active, (v) => 1 - 0.9 * v),
    { damping: 80, stiffness: 2000 }
  );
  const thumbScale = useSpring(
    useTransform(
      active,
      (v) => THUMB_REST_SCALE + (THUMB_ACTIVE_SCALE - THUMB_REST_SCALE) * v
    ),
    { damping: 80, stiffness: 2000 }
  );
  const scaleRatio = useSpring(
    useTransform(() => (0.4 + 0.5 * active.get()) * refractionBase.get())
  );
  const considerChecked = useTransform(() => {
    const x = xDragRatio.get();
    const c = checked.get();
    return pointerDown.get() ? (x > 0.5 ? 1 : 0) : c > 0.5 ? 1 : (0 as number);
  });

  const backgroundColor = useTransform(
    useSpring(considerChecked, { damping: 80, stiffness: 1000 }),
    mix("#94949F77", "#3BBF4EEE")
  );

  const initialPointerX = useMotionValue(0);

  return (
    <>
      <div
        className="relative h-96 flex justify-center items-center rounded-xl -ml-[15px] w-[calc(100%+30px)] select-none text-black/5 dark:text-white/5 [--bg1:#f8fafc] [--bg2:#e7eeef] dark:[--bg1:#1b1b22] dark:[--bg2:#0f0f14] border border-black/10 dark:border-white/10 touch-pan-y touch-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px)," +
            "linear-gradient(to bottom, currentColor 1px, transparent 1px)," +
            "radial-gradient(120% 100% at 10% 0%, var(--bg1), var(--bg2))",
          backgroundSize: "24px 24px, 24px 24px, 100% 100%",
          backgroundPosition: "12px 12px, 12px 12px, 0 0",
        }}
        onMouseMove={(e) => {
          if (!sliderRef.current) return;
          e.stopPropagation();
          const baseRatio = checked.get();
          const clientX = e.clientX;
          const displacementX = clientX - initialPointerX.get();
          const ratio = baseRatio + displacementX / TRAVEL;
          const overflow = ratio < 0 ? -ratio : ratio > 1 ? ratio - 1 : 0;
          const overflowSign = ratio < 0 ? -1 : 1;
          const dampedOverflow = (overflowSign * overflow) / 22;
          xDragRatio.set(Math.min(1, Math.max(0, ratio)) + dampedOverflow);
        }}
        onTouchMove={(e) => {
          if (!sliderRef.current) return;
          e.stopPropagation();
          const baseRatio = checked.get();
          const clientX = e.touches[0].clientX;
          const displacementX = clientX - initialPointerX.get();
          const ratio = baseRatio + displacementX / TRAVEL;
          const overflow = ratio < 0 ? -ratio : ratio > 1 ? ratio - 1 : 0;
          const overflowSign = ratio < 0 ? -1 : 1;
          const dampedOverflow = (overflowSign * overflow) / 22;
          xDragRatio.set(Math.min(1, Math.max(0, ratio)) + dampedOverflow);
        }}
      >
        <motion.div
          ref={sliderRef}
          style={{
            display: "inline-block",
            width: sliderWidth,
            height: sliderHeight,
            backgroundColor: backgroundColor,
            borderRadius: sliderHeight / 2,
            position: "relative",
            cursor: "pointer",
          }}
          onClick={(e) => {
            const x = e.clientX;
            const initialX = initialPointerX.get();
            const distance = x - initialX;
            if (Math.abs(distance) < 4) {
              const shouldBeChecked = checked.get() < 0.5;
              checked.set(shouldBeChecked ? 1 : 0);
            }
          }}
        >
          <Filter
            id="thumb-filter"
            blur={blur}
            scaleRatio={scaleRatio}
            specularOpacity={specularOpacity}
            specularSaturation={specularSaturation}
          />
          <motion.div
            className="absolute"
            onTouchStart={(e) => {
              e.stopPropagation();
              const pointerX = e.touches[0].clientX;
              pointerDown.set(1);
              initialPointerX.set(pointerX);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              pointerDown.set(1);
              initialPointerX.set(e.clientX);
            }}
            style={{
              height: thumbHeight,
              width: thumbWidth,
              marginLeft:
                -THUMB_REST_OFFSET +
                (sliderHeight - thumbHeight * THUMB_REST_SCALE) / 2,
              x: useTransform(() => xRatio.get() * TRAVEL),
              y: "-50%",
              borderRadius: thumbRadius,
              top: sliderHeight / 2,
              backdropFilter: `url(#thumb-filter)`,
              scale: thumbScale,
              backgroundColor: useTransform(
                backgroundOpacity,
                (op) => `rgba(255, 255, 255, ${op})`
              ),
              boxShadow: useTransform(() => {
                const isPressed = pointerDown.get() > 0.5;
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

      <div className="mt-8 space-y-3 text-black/80 dark:text-white/80">
        <div className="flex items-center gap-4">
          <div className="uppercase tracking-[0.14em] text-[10px] opacity-70 select-none">
            Parameters
          </div>
          <div className="h-[1px] flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Specular Opacity
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(specularOpacity, (v) => v.toFixed(2))}
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

        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Specular Saturation
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(specularSaturation, (v) => Math.round(v).toString())}
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

        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Refraction Level
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(refractionBase, (v) => v.toFixed(2))}
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

        <div className="flex items-center gap-4">
          <label className="w-56 uppercase tracking-[0.08em] text-[11px] opacity-80 select-none [line-height:1.2]">
            Blur Level
          </label>
          <motion.span className="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
            {useTransform(blur, (v) => v.toFixed(1))}
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
