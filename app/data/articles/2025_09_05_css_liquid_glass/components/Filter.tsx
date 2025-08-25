import { createCanvas, type ImageData } from "canvas";
import { motion, MotionValue, useTransform } from "motion/react";
import React from "react";
import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
} from "../lib/displacementMap";
import { calculateRefractionSpecular } from "../lib/specular";
import { getValueOrMotion } from "../lib/useValueOrMotion";

function imageDataToUrl(imageData: ImageData): string {
  const canvas = createCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

type FilterProps = {
  id: string;
  withSvgWrapper?: boolean;
  scaleRatio?: MotionValue<number>;
  canvasWidth?: number;
  canvasHeight?: number;
  blur: number | MotionValue<number>;
  width: number | MotionValue<number>;
  height: number | MotionValue<number>;
  radius: number | MotionValue<number>;
  glassThickness: number | MotionValue<number>;
  bezelWidth: number | MotionValue<number>;
  refractiveIndex: number | MotionValue<number>;
  specularOpacity: number | MotionValue<number>;
  bezelHeightFn?: (x: number) => number;
};

export const Filter: React.FC<FilterProps> = ({
  id,
  withSvgWrapper = true,
  canvasWidth,
  canvasHeight,
  width,
  height,
  radius,
  blur,
  glassThickness,
  bezelWidth,
  refractiveIndex,
  scaleRatio,
  specularOpacity,
  bezelHeightFn = (x) => Math.sqrt(1 - (1 - x) ** 2), // Quarter circle
}) => {
  const map = useTransform(() =>
    calculateDisplacementMap(
      getValueOrMotion(glassThickness),
      getValueOrMotion(bezelWidth),
      bezelHeightFn,
      getValueOrMotion(refractiveIndex)
    )
  );

  const maximumDisplacement = useTransform(() =>
    Math.max(...map.get().map((v) => Math.abs(v)))
  );

  const displacementMap = useTransform(() =>
    calculateDisplacementMap2(
      getValueOrMotion(canvasWidth ?? width),
      getValueOrMotion(canvasHeight ?? height),
      getValueOrMotion(width),
      getValueOrMotion(height),
      getValueOrMotion(radius),
      getValueOrMotion(bezelWidth),
      getValueOrMotion(maximumDisplacement),
      getValueOrMotion(map)
    )
  );

  const specularLayer = useTransform(() =>
    calculateRefractionSpecular(
      getValueOrMotion(width),
      getValueOrMotion(height),
      getValueOrMotion(radius),
      50,
      Math.PI / 4,
      0.5
    )
  );

  const displacementMapDataUrl = useTransform(() =>
    imageDataToUrl(displacementMap.get())
  );
  const specularLayerDataUrl = useTransform(() =>
    imageDataToUrl(specularLayer.get())
  );
  const scale = useTransform(
    () => maximumDisplacement.get() * (scaleRatio?.get() ?? 1)
  );

  const content = (
    <filter id={id} filterRes="128">
      <motion.feGaussianBlur
        in="SourceGraphic"
        stdDeviation={blur}
        result="blurred_source"
      />

      <motion.feImage
        href={displacementMapDataUrl}
        x={0}
        y={0}
        width={canvasWidth ?? width}
        height={canvasHeight ?? height}
        result="displacement_map"
      />

      <motion.feDisplacementMap
        in="blurred_source"
        in2="displacement_map"
        scale={scale}
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />

      <motion.feImage
        href={specularLayerDataUrl}
        x={0}
        y={0}
        width={canvasWidth ?? width}
        height={canvasHeight ?? height}
        result="light"
      />

      <feComponentTransfer in="light" result="fadedLight">
        <motion.feFuncA type="linear" slope={specularOpacity} />
      </feComponentTransfer>

      <motion.feBlend in="fadedLight" in2="displaced" mode="overlay" />
    </filter>
  );

  return withSvgWrapper ? (
    <svg color-interpolation-filters="sRGB" style={{ display: "none" }}>
      <defs>{content}</defs>
    </svg>
  ) : (
    content
  );
};
