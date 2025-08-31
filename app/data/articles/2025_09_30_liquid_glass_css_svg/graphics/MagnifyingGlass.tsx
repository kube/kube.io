import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useRef } from "react";
import { Filter } from "../components/Filter";

// A simple draggable circular glass lens over background text.
// Uses the same SVG filter pipeline as other demos.
export const MagnifyingGlass: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useMotionValue(false);
  const velocityX = useMotionValue(0);

  // Lens geometry
  const width = 200;
  const height = 130;
  const radius = height / 2;

  // Optical parameters (kept simple; no live controls here)
  const bezelWidth = 16;
  const glassThickness = 160;
  const refractiveIndex = 1.5;
  const specularOpacity = 0.75;
  const specularSaturation = 9;
  const refractionLevel = useSpring(
    useTransform(isDragging, (d): number => (d ? 1 : 0.8)),
    {
      stiffness: 250,
      damping: 14,
    }
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
    <div
      ref={containerRef}
      className="relative h-[420px] rounded-xl -ml-[15px] w-[calc(100%+30px)] border border-black/10 dark:border-white/10 overflow-hidden select-none bg-white dark:bg-black"
    >
      {/* Background content: left text, right image */}
      <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-[1fr_42%] gap-4 p-6 sm:p-8">
        <div className="text-black/80 dark:text-white/80 leading-relaxed">
          <h3 className="text-2xl font-semibold mb-3">Liquid Glass Lens</h3>
          <p>
            Drag the circular glass to explore how the text refracts beneath it.
            This is a minimal proof-of-concept lens, using the same displacement
            filter used by the other components in this article.
          </p>
          <p className="mt-3">
            Refraction bends light as it passes between media with different
            indices. Our lens approximates this by displacing pixels based on a
            vector field derived from a rounded bezel profile, and it adds a
            subtle specular highlight for depth.
          </p>
          <p className="mt-3">
            Try moving the lens across different lines—changes in contrast and
            angle make the distortion more apparent.
          </p>
        </div>
        <div className="relative hidden sm:block rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
            alt="Unsplash illustrative photograph"
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
          width={width}
          height={height}
          radius={radius}
          bezelWidth={bezelWidth}
          glassThickness={glassThickness}
          refractiveIndex={refractiveIndex}
          blur={0}
          scaleRatio={refractionLevel}
          specularOpacity={specularOpacity}
          specularSaturation={specularSaturation}
          magnifyingScale={magnifyingScale}
          bezelHeightFn={(x) => Math.sqrt(1 - (1 - x) ** 2)}
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
  );
};
