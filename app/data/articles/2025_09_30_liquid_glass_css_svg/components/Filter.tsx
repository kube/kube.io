import { createCanvas, type ImageData } from "canvas";
import { motion, MotionValue, useTransform } from "motion/react";
import React from "react";
import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
} from "../lib/displacementMap";
import { calculateMagnifyingDisplacementMap } from "../lib/magnifyingDisplacement";
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
  specularSaturation?: number | MotionValue<number>;
  magnifyingScale?: number | MotionValue<number>;
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
  specularSaturation = 4,
  magnifyingScale,
  bezelHeightFn = (x) => Math.sqrt(1 - (1 - x) ** 2), // Quarter circle
}) => {
  const map = useTransform(() => {
    return calculateDisplacementMap(
      getValueOrMotion(glassThickness),
      getValueOrMotion(bezelWidth),
      bezelHeightFn,
      getValueOrMotion(refractiveIndex)
    );
  });

  const maximumDisplacement = useTransform(() =>
    Math.max(...map.get().map((v) => Math.abs(v)))
  );

  const displacementMap = useTransform(() => {
    return calculateDisplacementMap2(
      getValueOrMotion(canvasWidth ?? width),
      getValueOrMotion(canvasHeight ?? height),
      getValueOrMotion(width),
      getValueOrMotion(height),
      getValueOrMotion(radius),
      getValueOrMotion(bezelWidth),
      getValueOrMotion(maximumDisplacement),
      getValueOrMotion(map)
    );
  });

  const specularLayer = useTransform(() => {
    return calculateRefractionSpecular(
      getValueOrMotion(width),
      getValueOrMotion(height),
      getValueOrMotion(radius),
      50,
      Math.PI / 4,
      0.5
    );
  });

  const magnifyingDisplacementMap = useTransform(() => {
    return magnifyingScale !== undefined
      ? calculateMagnifyingDisplacementMap(
          getValueOrMotion(canvasWidth ?? width),
          getValueOrMotion(canvasHeight ?? height)
        )
      : undefined;
  });

  const magnifyingDisplacementMapDataUrl = useTransform(() => {
    if (magnifyingScale) {
      return imageDataToUrl(magnifyingDisplacementMap.get());
    }
  });
  const displacementMapDataUrl = useTransform(() => {
    return imageDataToUrl(displacementMap.get());
  });
  const specularLayerDataUrl = useTransform(() => {
    return imageDataToUrl(specularLayer.get());
  });
  const scale = useTransform(
    () => maximumDisplacement.get() * (scaleRatio?.get() ?? 1)
  );

  const content = (
    <filter id={id} filterRes="128">
      {magnifyingScale && (
        <>
          <motion.feImage
            href={magnifyingDisplacementMapDataUrl}
            x={0}
            y={0}
            width={canvasWidth ?? width}
            height={canvasHeight ?? height}
            result="magnifying_displacement_map"
          />

          <motion.feDisplacementMap
            in="SourceGraphic"
            in2="magnifying_displacement_map"
            scale={magnifyingScale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="magnified_source"
          />
        </>
      )}

      <motion.feGaussianBlur
        in={
          magnifyingDisplacementMapDataUrl
            ? "magnified_source"
            : "SourceGraphic"
        }
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

      <motion.feColorMatrix
        in="displaced"
        type="saturate"
        values={useTransform(() =>
          getValueOrMotion(specularSaturation).toString()
        )}
        result="displaced_saturated"
      />

      <motion.feImage
        href={specularLayerDataUrl}
        x={0}
        y={0}
        width={canvasWidth ?? width}
        height={canvasHeight ?? height}
        result="specular_layer"
      />

      <feComposite
        in="displaced_saturated"
        in2="specular_layer"
        operator="in"
        result="specular_saturated"
      />

      <feComponentTransfer in="specular_layer" result="fadedLight1">
        <motion.feFuncA type="linear" slope={specularOpacity} />
      </feComponentTransfer>

      <feComponentTransfer in="specular_layer" result="fadedLight2">
        <motion.feFuncA
          type="linear"
          slope={useTransform(() => getValueOrMotion(specularOpacity) / 2)}
        />
      </feComponentTransfer>

      <motion.feBlend
        in="specular_saturated"
        in2="displaced"
        mode="screen"
        result="withSaturation"
      />
      <motion.feBlend
        in="fadedLight1"
        in2="withSaturation"
        mode="overlay"
        result="withOverlay"
      />
      <motion.feBlend
        in="fadedLight2"
        in2="withOverlay"
        mode="screen"
        result="withSpecular"
      />
    </filter>
  );

  return withSvgWrapper ? (
    <svg colorInterpolationFilters="sRGB" style={{ display: "none" }}>
      <defs>{content}</defs>
    </svg>
  ) : (
    content
  );
};
