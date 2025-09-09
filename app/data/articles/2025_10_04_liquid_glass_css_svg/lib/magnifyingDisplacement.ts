import { createImageData } from "canvas";

export function calculateMagnifyingDisplacementMap(
  canvasWidth: number,
  canvasHeight: number
) {
  const devicePixelRatio =
    typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1;
  const bufferWidth = canvasWidth * devicePixelRatio;
  const bufferHeight = canvasHeight * devicePixelRatio;
  const imageData = createImageData(bufferWidth, bufferHeight);

  const ratio = Math.max(bufferWidth / 2, bufferHeight / 2);

  for (let y1 = 0; y1 < bufferHeight; y1++) {
    for (let x1 = 0; x1 < bufferWidth; x1++) {
      const idx = (y1 * bufferWidth + x1) * 4;

      const x = x1 - bufferWidth / 2;
      const y = y1 - bufferHeight / 2;

      const rX = x / ratio;
      const rY = y / ratio;

      imageData.data[idx] = 128 - rX * 127; // R
      imageData.data[idx + 1] = 128 - rY * 127; // G
      imageData.data[idx + 2] = 0; // B
      imageData.data[idx + 3] = 255; // A
    }
  }
  return imageData;
}
