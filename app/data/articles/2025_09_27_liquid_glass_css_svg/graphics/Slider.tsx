import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import React, { useEffect, useState } from "react";
import { Filter } from "../components/Filter";

export const Slider: React.FC = () => {
  const min = 0;
  const max = 100;
  const [value, setValue] = useState(50);
  const motionValue = useMotionValue(value);

  useEffect(() => {
    motionValue.set(value);
  }, [value]);

  const sliderHeight = 30;
  const sliderWidth = 600;

  const isMouseDown = useMotionValue(true);

  const updateValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(min, Math.min(max, Number(e.target.value)));
    setValue(newValue);
  };

  const width = 220;
  const height = 130;
  const radius = 65;
  const bezelWidth = 40;
  const glassThickness = 90;
  const refractiveIndex = 1.9;
  const blur = 0;
  const scaleRatio = useSpring(isMouseDown.get() ? 0.9 : 0.4);
  const specularOpacity = 0.9;

  const constraintsRef = React.useRef<HTMLDivElement>(null);
  const scale = useTransform(() => (isMouseDown.get() ? 1 : 0.6));
  const scaleSpring = useSpring(scale, {
    damping: 80,
    stiffness: 2000,
  });

  const backgroundOpacity = useSpring(
    useTransform(() => (isMouseDown.get() ? 0.1 : 1)),
    {
      damping: 80,
      stiffness: 2000,
    }
  );

  return (
    <div className="py-40 px-5 bg-slate-100 dark:bg-[#232328] rounded-xl -ml-[15px] w-[calc(100%+30px)]">
      <motion.div
        ref={constraintsRef}
        style={{
          display: "inline-block",
          width: sliderWidth,
          height: sliderHeight,
          backgroundColor: "#ccc",
          transition: "background-color 0.3s ease-in-out",
          borderRadius: sliderHeight / 2,
          position: "relative",
          cursor: "pointer",
        }}
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
          type="number"
          value={value}
          onChange={updateValue}
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />

        <div className="w-full h-full overflow-hidden rounded-full">
          <motion.div
            style={{
              top: 0,
              left: 0,
              height: sliderHeight,
              width: useTransform(() => `${motionValue.get()}%`),
              borderRadius: `${sliderHeight / 2}px 2px 2px ${
                sliderHeight / 2
              }px`,
              backgroundColor: true ? "#0377F7" : "#ccc",
            }}
          />
        </div>

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
          dragConstraints={constraintsRef}
          onDrag={(_, info) => {
            const { x, width } =
              constraintsRef.current!.getBoundingClientRect();
            const ratio = (info.point.x - x) / width;
            motionValue.set(
              Math.max(min, Math.min(max, ratio * (max - min) + min))
            );
          }}
          dragMomentum={false}
          className="absolute"
          style={{
            height,
            width,
            y: "-50%",
            borderRadius: radius,
            top: sliderHeight / 2,
            backdropFilter: `url(#thumb-filter-slider)`,
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
