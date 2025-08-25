import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function calculateDisplacementMap(radius: number, bezel: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = radius * 2;
  canvas.height = radius * 2;
  const radiusSquared = radius ** 2;
  const radiusMinusBezelSquared = (radius - bezel) ** 2;

  const ctx = canvas.getContext("2d")!;

  const imageData = ctx.createImageData(canvas.width, canvas.height);

  for (let y = -radius; y < radius; y++) {
    for (let x = -radius; x < radius; x++) {
      const idx = ((y + radius) * canvas.width + (x + radius)) * 4;

      const distanceToCenterSquared = x ** 2 + y ** 2;

      const isInBezel =
        distanceToCenterSquared < radiusSquared &&
        distanceToCenterSquared > radiusMinusBezelSquared;

      if (!isInBezel) {
        // No displacement outside the bezel
        imageData.data[idx] = 128; // R
        imageData.data[idx + 1] = 128; // G
        imageData.data[idx + 2] = 0; // B
        imageData.data[idx + 3] = 255; // A
      } else {
        const distanceFromSide = radius - Math.sqrt(distanceToCenterSquared);
        const normalizedDistance = 1 - distanceFromSide / bezel;

        const dX = (-x / radius) * normalizedDistance; // X displacement
        const dY = (-y / radius) * normalizedDistance; // Y displacement

        imageData.data[idx] = 128 + dX * 127; // R for X displacement
        imageData.data[idx + 1] = 128 + dY * 127; // G for Y displacement
        imageData.data[idx + 2] = 0; // B unused
        imageData.data[idx + 3] = 255; // A
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  console.log(imageData);
  return canvas.toDataURL();
}

type LiquidGlassProps = {
  children?: React.ReactNode;
  borderRadius?: number;
  glassWidth?: number;
  glassHeight?: number;
};

export const LiquidGlass: React.FC<LiquidGlassProps> = ({ children }) => {
  const scale = useMotionValue(50);
  const radius = useMotionValue(100);
  const bezel = useMotionValue(50);
  const blur = useMotionValue(0);

  const displacementMap = useTransform([radius, bezel], ([r, b]) =>
    calculateDisplacementMap(r as number, b as number)
  );

  const width = useTransform(radius, (r) => r * 2);
  const height = useTransform(radius, (r) => r * 2);

  const scaleRatio = useSpring(0.2, { damping: 10, stiffness: 150 });

  return (
    <>
      <div className="fixed top-10 p-4 rounded left-10 z-50 bg-white/20 backdrop-blur-sm grid grid-cols-2">
        <span>Scale</span>
        <motion.input
          type="range"
          min="0"
          max="400"
          defaultValue={scale.get()}
          onChange={(e) => scale.set(Number(e.currentTarget.value))}
        />

        <span>Radius</span>
        <motion.input
          type="range"
          min="10"
          max="300"
          defaultValue={radius.get()}
          onChange={(e) => radius.set(Number(e.currentTarget.value))}
        />

        <span>Bezel</span>
        <motion.input
          type="range"
          min="0"
          max={radius.get()}
          defaultValue={bezel.get()}
          onChange={(e) => bezel.set(Number(e.currentTarget.value))}
        />

        <span>Blur</span>
        <motion.input
          type="range"
          min="0"
          max={30}
          defaultValue={blur.get()}
          onChange={(e) => blur.set(Number(e.currentTarget.value))}
        />
      </div>

      <svg
        id="svgNoise"
        colorInterpolationFilters="sRGB" // This drove me nuts. Default value is "linearRGB" and does not translate linearly.
      >
        <defs>
          <filter id="noiseEffect">
            <motion.feImage
              href={displacementMap}
              x="0"
              y="0"
              width={width}
              height={height}
              result="noiseEffect"
            />
            <motion.feDisplacementMap
              in="SourceGraphic"
              in2="noiseEffect"
              scale={useTransform(
                [scale, scaleRatio],
                ([s, r]) => (s as number) * (r as number)
              )}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <motion.div
        drag
        dragMomentum={false}
        className="fixed top-[50vh] left-[50vw] flex items-center justify-center select-none z-40 overflow-hidden"
        style={{
          height,
          width,
          translate: "-50% -50%",
        }}
        onMouseDown={() => {
          scaleRatio.set(0.8);
        }}
        onTouchStart={() => {
          scaleRatio.set(0.8);
        }}
        onDragStart={() => {
          scaleRatio.set(0.8);
        }}
        onDragEnd={() => {
          scaleRatio.set(0.2);
        }}
        onMouseUp={() => {
          scaleRatio.set(0.2);
        }}
        onTouchEnd={() => {
          scaleRatio.set(0.2);
        }}
      >
        {children}
        <motion.div
          className="absolute"
          style={{
            height,
            width,
            backdropFilter: "url(#noiseEffect)",
          }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            height,
            width,
            backdropFilter: useTransform(blur, (b) => `blur(${b}px)`),
          }}
        />
      </motion.div>
    </>
  );
};

export const InPortal: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalRoot(document.getElementById("portal-root")), []);
  return portalRoot && createPortal(children, portalRoot);
};
