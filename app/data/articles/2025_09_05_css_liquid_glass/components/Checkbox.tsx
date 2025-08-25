import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useState } from "react";
import { Filter } from "./Filter";

export const Checkbox: React.FC = () => {
  const [checked, setChecked] = useState(true);
  const motionChecked = useMotionValue(checked ? 1 : 0);

  useEffect(() => {
    motionChecked.set(checked ? 1 : 0);
  }, [checked]);

  const toggleChecked = () => {
    setChecked(!checked);
  };

  const sliderHeight = 166;
  const sliderWidth = 418;

  const isMouseDown = useMotionValue(true);

  const width = 390;
  const height = 230;
  const radius = 115;
  const bezelWidth = 50;
  const glassThickness = 130;
  const refractiveIndex = 1.9;
  const blur = 0;
  const scaleRatio = useSpring(isMouseDown.get() ? 0.9 : 0.4);
  const specularOpacity = 0.9;

  const scale = useTransform(() => (isMouseDown.get() ? 1 : 0.6));
  const scaleSpring = useSpring(scale, {
    damping: 80,
    stiffness: 2000,
  });

  const buttonX = useSpring(
    useTransform(() => (motionChecked.get() ? "-31%" : "-69%")),
    {
      damping: 60,
      stiffness: 800,
    }
  );
  const backgroundOpacity = useSpring(
    useTransform(() => (isMouseDown.get() ? 0.1 : 1)),
    {
      damping: 80,
      stiffness: 2000,
    }
  );

  return (
    <div className="p-40 bg-slate-100 dark:bg-[#232328] rounded-xl">
      <motion.div
        style={{
          display: "inline-block",
          width: sliderWidth,
          height: sliderHeight,
          backgroundColor: checked ? "#5BBF5E" : "#ccc",
          transition: "background-color 0.3s ease-in-out",
          borderRadius: sliderHeight / 2,
          position: "relative",
          cursor: "pointer",
        }}
        onClick={toggleChecked}
        onMouseDown={() => {
          isMouseDown.set(true);
          scaleRatio.set(0.9);
        }}
        onMouseUp={() => {
          isMouseDown.set(false);
          scaleRatio.set(0.4);
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={toggleChecked}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />
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
            x: buttonX,
            y: "-50%",
            borderRadius: radius,
            top: sliderHeight / 2,
            left: sliderWidth / 2,
            backdropFilter: `url(#thumb-filter)`,
            scale: scaleSpring,

            backgroundColor: useTransform(
              () => `rgba(255, 255, 255, ${backgroundOpacity.get()})`
            ),
          }}
        />
      </motion.div>
    </div>
  );
};
