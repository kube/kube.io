import { createImageData } from "canvas";

export function calculateRefractionSpecular(
  objectWidth: number,
  objectHeight: number,
  radius: number,
  bezelWidth: number,
  specularAngle = Math.PI / 4,
  specularOpacity = 0.5
) {
  const devicePixelRatio =
    typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1;
  const bufferWidth = objectWidth * devicePixelRatio;
  const bufferHeight = objectHeight * devicePixelRatio;
  const imageData = createImageData(bufferWidth, bufferHeight);

  const radius_ = radius * devicePixelRatio;
  const bezel_ = bezelWidth * devicePixelRatio;

  // Vector along which we should see specular
  const specular_vector = [Math.cos(specularAngle), Math.sin(specularAngle)];

  // Fill neutral color using buffer
  const neutral = 0x00000000;
  new Uint32Array(imageData.data.buffer).fill(neutral);

  const radiusSquared = radius_ ** 2;
  const radiusMinusBezelSquared = (radius_ - bezel_) ** 2;

  const widthBetweenRadiuses = bufferWidth - radius_ * 2;
  const heightBetweenRadiuses = bufferHeight - radius_ * 2;

  for (let y1 = 0; y1 < bufferHeight; y1++) {
    for (let x1 = 0; x1 < bufferWidth; x1++) {
      const idx = (y1 * bufferWidth + x1) * 4;

      const isOnLeftSide = x1 < radius_;
      const isOnRightSide = x1 >= bufferWidth - radius_;
      const isOnTopSide = y1 < radius_;
      const isOnBottomSide = y1 >= bufferHeight - radius_;

      const x = isOnLeftSide
        ? x1 - radius_
        : isOnRightSide
        ? x1 - radius_ - widthBetweenRadiuses
        : 0;

      const y = isOnTopSide
        ? y1 - radius_
        : isOnBottomSide
        ? y1 - radius_ - heightBetweenRadiuses
        : 0;

      const distanceToCenterSquared = x * x + y * y;

      const isInBezel =
        distanceToCenterSquared <= radiusSquared &&
        distanceToCenterSquared >= radiusMinusBezelSquared;

      // Only write non-neutral displacements (when isInBezel)
      if (isInBezel) {
        const distanceFromCenter = Math.sqrt(distanceToCenterSquared);
        const distanceFromSide = radius_ - distanceFromCenter;

        // Viewed from top
        const cos = x / distanceFromCenter;
        const sin = y / distanceFromCenter;

        // Dot product of orientation
        const ratioInBezel = 1 - distanceFromSide / bezelWidth;
        const dotProduct = cos * specular_vector[0] + sin * specular_vector[1];
        const dotProductSquared = dotProduct * dotProduct; // Square the dot to reduce highlight width
        const coefficient =
          (dotProductSquared / (distanceFromSide / (3 * devicePixelRatio))) *
          ratioInBezel;

        const color = 255 * coefficient * specularOpacity;

        imageData.data[idx] = color;
        imageData.data[idx + 1] = color;
        imageData.data[idx + 2] = color;
        imageData.data[idx + 3] = color;
      }
    }
  }
  return imageData;
}
