import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useRef } from "react";
import { Filter } from "virtual:refractionFilter?width=210&height=150&radius=75&bezelWidth=27&glassThickness=130&refractiveIndex=1.5&bezelType=convex_squircle&magnify=true";

// A simple draggable circular glass lens over background text.
// Uses the same SVG filter pipeline as other demos.
export const MagnifyingGlass: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useMotionValue(false);
  const velocityX = useMotionValue(0);

  // Lens geometry
  const width = 210;
  const height = 150;
  const radius = height / 2;

  // Controls (MotionValues) — same pattern as Searchbox/MixedUI
  const specularOpacity = useMotionValue(0.5); // 0..1
  const specularSaturation = useMotionValue(9); // 0..50
  const refractionBase = useMotionValue(1); // 0..1
  // Readouts
  const specularOpacityText = useTransform(specularOpacity, (v) =>
    v.toFixed(2)
  );
  const specularSaturationText = useTransform(specularSaturation, (v) =>
    Math.round(v).toString()
  );
  const refractionLevelText = useTransform(refractionBase, (v) => v.toFixed(2));
  // Animate effective refraction level on drag (snaps stronger while dragging)
  const dragMultiplier = useTransform(isDragging, (d): number => (d ? 1 : 0.8));
  const refractionLevel = useSpring(
    useTransform(() => refractionBase.get() * dragMultiplier.get()),
    { stiffness: 250, damping: 14 }
  );
  const magnifyingScale = useSpring(
    useTransform(isDragging, (d): number => (d ? 48 : 24)),
    {
      stiffness: 250,
      damping: 14,
    }
  );

  const objectScale = useSpring(
    useTransform(isDragging, (d): number => (d ? 1 : 0.8)),
    { stiffness: 340, damping: 20 }
  );
  const objectScaleY = useSpring(
    useTransform(
      (): number =>
        objectScale.get() * Math.max(0.7, 1 - Math.abs(velocityX.get()) / 5000)
    ),
    { stiffness: 340, damping: 30 }
  );
  const objectScaleX = useSpring(
    useTransform((): number => objectScale.get() + (1 - objectScaleY.get())),
    { stiffness: 340, damping: 30 }
  );

  // This could be done with only one spring (derived from ) and multiple transforms
  const shadowSx = useSpring(
    useTransform(isDragging, (d): number => (d ? 4 : 0)),
    { stiffness: 340, damping: 30 }
  );
  const shadowSy = useSpring(
    useTransform(isDragging, (d): number => (d ? 16 : 4)),
    { stiffness: 340, damping: 30 }
  );
  const shadowAlpha = useSpring(
    useTransform(isDragging, (d): number => (d ? 0.22 : 0.16)),
    {
      stiffness: 220,
      damping: 24,
    }
  );
  const insetShadowAlpha = useSpring(
    useTransform(isDragging, (d): number => (d ? 0.27 : 0.2)),
    {
      stiffness: 220,
      damping: 24,
    }
  );
  const shadowBlur = useSpring(
    useTransform(isDragging, (d): number => (d ? 24 : 9)),
    {
      stiffness: 340,
      damping: 30,
    }
  );
  const boxShadow = useTransform(
    () =>
      `${shadowSx.get()}px ${shadowSy.get()}px ${shadowBlur.get()}px rgba(0,0,0,${shadowAlpha.get()}),
      inset ${shadowSx.get() / 2}px ${
        shadowSy.get() / 2
      }px 24px rgba(0,0,0,${insetShadowAlpha.get()}),
      inset ${-shadowSx.get() / 2}px ${
        -shadowSy.get() / 2
      }px 24px rgba(255,255,255,${insetShadowAlpha.get()})`
  );

  // Reset dragging on any global pointer/mouse/touch end
  useEffect(() => {
    const handleUp = () => isDragging.set(false);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative h-[440px] sm:h-[460px] rounded-xl -ml-[15px] w-[calc(100%+30px)] border border-black/10 dark:border-white/10 overflow-hidden select-none bg-white dark:bg-black"
      >
        {/* Background content: left text, right image */}
        <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-[1fr_46%] gap-6 sm:gap-10 p-6 sm:p-10">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
              <span className="h-[2px] w-10 bg-current" />
              <span className="uppercase tracking-[0.25em] text-[11px] font-medium">
                Optics Study
              </span>
            </div>
            <h3 className="mt-4 text-[36px] sm:text-[54px] leading-[0.95] font-extrabold tracking-tight text-black dark:text-white">
              Liquid&nbsp;Glass
              <span className="text-black/40 dark:text-white/40">—</span>
              Precision&nbsp;Lens
            </h3>
            <div className="mt-4 max-w-[60ch] text-[15px] sm:text-[16px] leading-[1.55] text-black/70 dark:text-white/70 space-y-3">
              <p>
                Drag the capsule to bend the page. This lens is a compact SVG
                displacement rig that refracts whatever sits beneath it.
              </p>
              <p>
                The field comes from a rounded bezel profile; pixels are pushed
                along its gradient, then topped with a subtle specular bloom for
                depth.
              </p>
              <p className="text-black/60 dark:text-white/60">
                Sweep across strong edges—high contrast makes the bend snap.
              </p>
            </div>
          </div>
          <div className="relative hidden sm:block rounded-lg overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
            <img
              src="https://images.unsplash.com/photo-1579380656108-f98e4df8ea62?q=80&w=800&auto=format&fit=crop"
              alt="Abstract architectural lines"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* Draggable circular lens */}
        <motion.div
          className="absolute top-6 left-6 z-10 cursor-grab active:cursor-grabbing"
          style={{
            width,
            height,
            borderRadius: radius,
            scaleX: objectScaleX,
            scaleY: objectScaleY,
          }}
          drag
          dragConstraints={containerRef}
          dragElastic={0.13}
          dragMomentum={false}
          onDrag={(_, info) => velocityX.set(info.velocity.x)}
          onDragEnd={() => velocityX.set(0)}
          onMouseDown={() => isDragging.set(true)}
          onTouchStart={() => isDragging.set(true)}
        >
          {/* SVG filter definition for the lens */}
          <Filter
            id="magnifying-glass-filter"
            blur={0}
            scaleRatio={refractionLevel}
            specularOpacity={specularOpacity}
            specularSaturation={specularSaturation}
            magnifyingScale={magnifyingScale}
          />

          {/* The glass layer using the filter as a backdrop */}
          <motion.div
            className="absolute inset-0 ring-1 ring-black/10 dark:ring-white/10"
            style={{
              borderRadius: radius,
              backdropFilter: `url(#magnifying-glass-filter)`,
              boxShadow,
            }}
          />
        </motion.div>
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
      </div>
    </>
  );
};
