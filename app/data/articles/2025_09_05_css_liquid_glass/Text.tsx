import { useEffect, useRef } from "react";

export const Text: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 180;

    // Add some text
    ctx.fillStyle = "black";
    ctx.font = "600 232px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("13:37", canvas.width / 2, canvas.height / 2 + 15);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // First pass for distances to left and top

    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const index = (y * canvas.width + x) * 4;
        const prevXIndex = (y * canvas.width + (x - 1)) * 4;
        const prevYIndex = ((y - 1) * canvas.width + x) * 4;

        const pixelAlpha = data[index + 3];

        const prevXDistance = data[prevXIndex]; // Red channel
        const prevYDistance = data[prevYIndex + 1]; // Green channel

        if (pixelAlpha > 0) {
          const distanceX = Math.max(0, prevXDistance - 1);
          const distanceY = Math.max(0, prevYDistance - 1);
          data[index] = distanceX; // Red channel
          data[index + 1] = distanceY; // Green channel
        } else {
          data[index] = 128; // Red channel
          data[index + 1] = 128; // Green channel
        }
      }
    }

    // Second pass for distances to right and bottom

    for (let x = canvas.width - 1; x >= 0; x--) {
      for (let y = canvas.height; y >= 0; y--) {
        const index = (y * canvas.width + x) * 4;
        const prevXIndex = (y * canvas.width + (x + 1)) * 4;
        const prevYIndex = ((y + 1) * canvas.width + x) * 4;

        const pixelAlpha = data[index + 3];

        const prevXAlpha = data[prevXIndex + 3];
        const prevYAlpha = data[prevYIndex + 3];
        const prevXDistance = data[prevXIndex]; // Red channel
        const prevYDistance = data[prevYIndex + 1]; // Green channel

        if (pixelAlpha > 0) {
          const distanceX = prevXAlpha === 0 ? 128 : prevXDistance + 1;
          const distanceY = prevYAlpha === 0 ? 128 : prevYDistance + 1;

          if (data[index] - 128 < 128 - distanceX) {
            data[index] = distanceX; // Red channel
          }
          if (data[index + 1] - 128 < 128 - distanceY) {
            data[index + 1] = distanceY; // Green channel
          }
        }
      }
    }

    // Apply refraction map
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const index = (y * canvas.width + x) * 4;

        const pixelAlpha = data[index + 3];

        if (pixelAlpha > 0) {
          const distanceX = data[index] - 128; // Red channel
          const distanceY = data[index + 1] - 128; // Green channel
          const distance = Math.sqrt(
            distanceX * distanceX + distanceY * distanceY
          );

          data[index] = 128 + distance; // Red channel
          data[index + 1] = 0; // Green channel
          data[index + 2] = 0; // Blue channel
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  });

  return (
    <div>
      Text
      <canvas ref={canvasRef} width={400} height={300} />
    </div>
  );
};
