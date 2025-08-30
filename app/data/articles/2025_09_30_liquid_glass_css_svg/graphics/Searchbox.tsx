import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { Filter } from "../components/Filter";

export const Searchbox: React.FC = () => {
  // Dimensions ratio for a search field
  const height = 56;
  const width = 420;
  const radius = height / 2;

  // Optical parameters reused from other components
  const bezelWidth = 25;
  const glassThickness = 100;
  const refractiveIndex = 1.5;
  const blur = 1;
  // Focus state
  const focused = useMotionValue(0);

  // Simple press interaction for a subtle breathing effect
  const pointerDown = useMotionValue(0);
  const backgroundFromPointer = useTransform(pointerDown, [0, 1], [0.05, 0.3]);
  const backgroundFromFocus = useTransform(focused, [0, 1], [0.05, 0.2]);
  const backgroundOpacity = useSpring(
    useTransform([backgroundFromPointer, backgroundFromFocus], (vals) =>
      Math.max(vals[0] as number, vals[1] as number)
    ),
    {
      damping: 80,
      stiffness: 2000,
    }
  );
  const scale = useSpring(
    useTransform(() => {
      const pd = pointerDown.get();
      const f = focused.get();
      return (f ? 1 : 0.8) * (pd ? 0.99 : 1);
    }),
    {
      damping: 40,
      stiffness: 800,
    }
  );
  const scaleRatio = useSpring(
    useTransform(() => {
      const pd = pointerDown.get();
      const f = focused.get();
      return 0.5 + 0.1 * pd + 0.1 * f;
    }),
    {
      damping: 80,
      stiffness: 2000,
    }
  );
  const specularOpacity = useSpring(useTransform(focused, [0, 1], [0.5, 0.7]), {
    damping: 80,
    stiffness: 2000,
  });

  useEffect(() => {
    const onPointerUp = () => pointerDown.set(0);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [pointerDown]);

  // Background toggle (same visual frame as other demos)
  const [useImageBg, setUseImageBg] = useState(false);
  const containerStyle: React.CSSProperties = useImageBg
    ? {
        backgroundImage:
          'url("https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=1600&auto=format&fit=crop")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundImage:
          "linear-gradient(to right, currentColor 1px, transparent 1px)," +
          "linear-gradient(to bottom, currentColor 1px, transparent 1px)," +
          "radial-gradient(120% 100% at 10% 0%, var(--bg1), var(--bg2))",
        backgroundSize: "24px 24px, 24px 24px, 100% 100%",
        backgroundPosition: "12px 12px, 12px 12px, 0 0",
      };

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className="relative h-96 flex justify-center items-center rounded-xl -ml-[15px] w-[calc(100%+30px)] select-none text-black/5 dark:text-white/5 [--bg1:#f8fafc] [--bg2:#e7eef8] dark:[--bg1:#1b1b22] dark:[--bg2:#0f0f14] border border-black/10 dark:border-white/10"
      style={containerStyle}
    >
      {/* Track */}
      <motion.div
        className="relative"
        style={{ width, height, borderRadius: radius, scale }}
        onMouseDown={() => pointerDown.set(1)}
        onMouseUp={() => pointerDown.set(0)}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Filter definition */}
        <Filter
          id="searchbox-filter"
          width={width}
          height={height}
          radius={radius}
          bezelWidth={bezelWidth}
          glassThickness={glassThickness}
          refractiveIndex={refractiveIndex}
          blur={blur}
          scaleRatio={scaleRatio}
          specularOpacity={specularOpacity}
          bezelHeightFn={(x) => Math.sqrt(1 - (1 - x) ** 2)}
        />

        {/* Glass layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            backdropFilter: `url(#searchbox-filter)`,
            backgroundColor: useTransform(
              () => `rgba(255, 255, 255, ${backgroundOpacity.get()})`
            ),
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            transform: "translateZ(0)", // Create a new layer to improve performance
          }}
        />

        {/* Content overlay */}
        <div
          className="absolute inset-0 flex items-center gap-3 px-5"
          style={{ borderRadius: radius, zIndex: 1 }}
        >
          <IoSearch
            className="text-black/70 dark:text-white/70 shrink-0"
            size={20}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="flex-1 min-w-0 bg-transparent outline-none border-0 text-[15px] leading-none text-black/80 dark:text-white/80 placeholder-black/40 dark:placeholder-white/40 selection:bg-blue-500/30 selection:text-inherit select-text"
            style={{ padding: 0 }}
            onFocus={() => focused.set(1)}
            onBlur={() => focused.set(0)}
            onMouseDown={(e) => {
              if (focused.get() === 0) e.preventDefault();
            }}
          />
        </div>
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
