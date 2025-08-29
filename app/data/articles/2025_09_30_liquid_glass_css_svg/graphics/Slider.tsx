import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useRef } from "react";
import { Filter } from "../components/Filter";

export const Slider: React.FC = () => {
  const min = 0;
  const max = 100;
  const value = useMotionValue(10);

  const sliderHeight = 28;
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

  return (
    <div className="h-96 flex justify-center items-center bg-slate-100 dark:bg-[#232328] rounded-xl -ml-[15px] w-[calc(100%+30px)] select-none">
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
            backgroundColor: "#ccc",
            transition: "background-color 0.3s ease-in-out",
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
                backgroundColor: true ? "#0377F7" : "#ccc",
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
    </div>
  );
};
