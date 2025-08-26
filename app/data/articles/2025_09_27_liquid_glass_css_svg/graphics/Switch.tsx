import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "motion/react";
import React, { useEffect, useState } from "react";
import { Filter } from "../components/Filter";

export const Switch: React.FC = () => {
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

  const scale = useMotionValue(1);
  useMotionValueEvent(isMouseDown, "change", (down) =>
    scale.set(down ? 1 : 0.6)
  );
  const scaleSpring = useSpring(scale.get(), {
    damping: 80,
    stiffness: 2000,
  });
  useMotionValueEvent(scale, "change", (v) => scaleSpring.set(v));

  const buttonXMV = useMotionValue(motionChecked.get() ? -31 : -69);
  useMotionValueEvent(motionChecked, "change", (c) =>
    buttonXMV.set(c ? -31 : -69)
  );
  const buttonX = useSpring(buttonXMV.get(), { damping: 60, stiffness: 800 });
  useMotionValueEvent(buttonXMV, "change", (v) => buttonX.set(v));
  const backgroundOpacityMV = useMotionValue(1);
  useMotionValueEvent(isMouseDown, "change", (down) =>
    backgroundOpacityMV.set(down ? 0.1 : 1)
  );
  const backgroundOpacity = useSpring(backgroundOpacityMV.get(), {
    damping: 80,
    stiffness: 2000,
  });
  useMotionValueEvent(backgroundOpacityMV, "change", (v) =>
    backgroundOpacity.set(v)
  );

  return (
    <div className="p-40 bg-slate-100 dark:bg-[#232328] rounded-xl -ml-[15px] w-[calc(100%+30px)]">
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
            x: useTransform(buttonX, (v) => `${v}%`),
            y: "-50%",
            borderRadius: radius,
            top: sliderHeight / 2,
            left: sliderWidth / 2,
            backdropFilter: `url(#thumb-filter)`,
            scale: scaleSpring,

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
