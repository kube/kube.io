import { Matrix, Vector } from "@kube/math";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from "framer-motion";
import { useEffect } from "react";

import { twMerge } from "tailwind-merge";
import { facePath } from "./Face";
import { createCube } from "./createCube";

const VIEWBOX = [-50, -50, 100, 100].toString();

const BASE_ROTATION_X = Math.PI / 4;
const BASE_ROTATION_Y = Math.PI / 5;

const BASE_CUBE_TRANSFORMS = Matrix.scale(60)
  .dot(Matrix.rotationX(BASE_ROTATION_X))
  .dot(Matrix.rotationY(BASE_ROTATION_Y));

const SPRING_PARAMS: SpringOptions = { stiffness: 38, damping: 9 };

type LogoProps = {
  className?: string;
  width?: number;
};

export const Logo: React.FC<LogoProps> = ({ className, ref }) => {
  const revolutions = useMotionValue(0);

  useEffect(() => {
    setTimeout(() => {
      revolutions.set(1);
    }, 400);
  }, []);

  function rotate() {
    revolutions.set(1 - revolutions.get());
  }

  const springRotationY = useSpring(
    useTransform(revolutions, (r) => r * 2 * Math.PI),
    SPRING_PARAMS
  );

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const springDragX = useSpring(dragX, SPRING_PARAMS);
  const springDragY = useSpring(dragY, SPRING_PARAMS);

  const revolutionTransform = useTransform(springRotationY, Matrix.rotationY);

  const dragVector = useTransform(
    [springDragX, springDragY],
    ([x, y]) => new Vector([x as number, y as number, 0, 1])
  );

  const dragTransform = useTransform(dragVector, (dragVector) => {
    const rotationAxis = dragVector.rotateZ(Math.PI / 2).normalize();
    const angle = dragVector.norm() / 100;
    return Matrix.rotation(rotationAxis, angle);
  });

  const projectedCubeStripes = useTransform(
    // @ts-expect-error
    [revolutionTransform, dragTransform],
    // @ts-expect-error
    ([revolutionTransform, dragTransform]) =>
      createCube(
        BASE_CUBE_TRANSFORMS.dot(revolutionTransform).dot(dragTransform)
      )
  );

  return (
    <motion.svg
      ref={ref}
      className={twMerge(
        "hover:scale-105 active:scale-90 transition-transform",
        className
      )}
      viewBox={VIEWBOX}
      onTap={rotate}
      onMouseDown={(event) => event.preventDefault()}
      onPan={(_, { offset }) => {
        dragX.set(offset.x);
        dragY.set(offset.y);
      }}
      onPanEnd={() => {
        dragX.set(0);
        dragY.set(0);
      }}
    >
      <motion.path
        style={{ fill: "var(--palette-purple)" }}
        // @ts-expect-error
        d={useTransform(projectedCubeStripes, (s) => s.map(facePath).join(" "))}
      />
    </motion.svg>
  );
};
