import clsx from "clsx";
import { motion, useSpring } from "motion/react";
import { useEffect, useId } from "react";
import { Filter } from "./Filter";
import { LiquidGlassProps } from "./LiquidGlass";
import { getValueOrMotion, useValueOrMotion } from "./useValueOrMotion";

type ButtonProps = React.PropsWithChildren<
  LiquidGlassProps & {
    className?: string;
    style?: React.CSSProperties;
  }
>;

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  style,
  ...props
}) => {
  const id = useId();

  const height = useValueOrMotion(props.height);
  const width = useValueOrMotion(props.width);
  const radius = useValueOrMotion(props.radius);
  const glassThickness = useValueOrMotion(props.glassThickness);
  const bezelWidth = useValueOrMotion(props.bezelWidth);
  const refractiveIndex = useValueOrMotion(props.refractiveIndex);
  const blur = useValueOrMotion(props.blur);
  const blurSpring = useSpring(0);
  const scaleRatio = useSpring(0);
  const specularOpacity = useSpring(0);

  useEffect(() => {
    setTimeout(() => {
      scaleRatio.set(0.5);
      specularOpacity.set(0.1);
      blurSpring.set(getValueOrMotion(props.blur));
    }, 1000);
  }, []);

  return (
    <motion.button
      className={clsx(className)}
      style={{
        ...style,
        height,
        width,
        borderRadius: `${radius}px`,
      }}
      onMouseOver={() => {
        scaleRatio.set(1);
        specularOpacity.set(0.8);
      }}
      onMouseOut={() => {
        scaleRatio.set(0.5);
        specularOpacity.set(0.1);
      }}
    >
      <div className="relative h-full w-full flex items-center justify-center">
        <Filter
          id={id}
          width={width}
          height={height}
          radius={radius}
          bezelWidth={bezelWidth}
          glassThickness={glassThickness}
          refractiveIndex={refractiveIndex}
          blur={blur}
          scaleRatio={scaleRatio}
          specularOpacity={specularOpacity}
        />

        {children}

        <div
          className="absolute -z-10 top-0 left-0 h-full w-full"
          style={{ backdropFilter: `url(#${id})`, borderRadius: `${radius}px` }}
        />
      </div>
    </motion.button>
  );
};
