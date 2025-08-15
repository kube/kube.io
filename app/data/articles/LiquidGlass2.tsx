import { motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LiquidGlassProps = React.PropsWithChildren<{
  children?: React.ReactNode;
  borderRadius?: number;
  glassWidth?: number;
  glassHeight?: number;
}>;

const MARGIN = 40;

function calculateDisplacementMap(width: number, height: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = width + MARGIN;
  canvas.height = height + MARGIN;

  const ctx = canvas.getContext("2d")!;

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  for (let y = MARGIN; y < canvas.height; y++) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    for (let x = MARGIN; x < canvas.width; x++) {
      const idx = (y * (width + MARGIN) + x + MARGIN) * 4;

      const distanceXToCenter = x - halfWidth - MARGIN;
      const distanceYToCenter = y - halfHeight - MARGIN;

      const red = 128 + (distanceYToCenter / halfWidth) * 127; // X displacement
      const green = 128 + (distanceXToCenter / halfHeight) * 127; //

      imageData.data[idx] = green; // R for X displacement
      imageData.data[idx + 1] = red; // G for Y displacement
      imageData.data[idx + 2] = 255; // B unused
      imageData.data[idx + 3] = 255; // A
    }
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL();
}
export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  borderRadius = 65,
  glassWidth = 250,
  glassHeight = 130,
}) => {
  const gradientAngle = useMotionValue(Math.PI / 2);

  const isDragging = useMotionValue(false);

  return (
    <>
      <svg id="svgNoise">
        <defs>
          <filter id="noiseEffect2" filterUnits="userSpaceOnUse">
            <feImage
              href={calculateDisplacementMap(glassWidth, glassHeight)}
              id="displacementMap"
              result="particle"
              width={glassWidth}
              height={glassHeight}
              x={0}
              y={0}
            />
            <feDisplacementMap
              scale={MARGIN}
              in="SourceGraphic"
              in2="particle"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <motion.div
        className="fixed z-40 flex items-center justify-center overflow-hidden select-none"
        drag
        dragMomentum={false}
        onMouseDown={() => {
          isDragging.set(true);
        }}
        onTouchStart={() => {
          isDragging.set(true);
        }}
        onDragStart={() => {
          isDragging.set(true);
        }}
        onDragEnd={() => {
          isDragging.set(false);
        }}
        onMouseUp={() => {
          isDragging.set(false);
        }}
        onTouchEnd={() => {
          isDragging.set(false);
        }}
        onDrag={(_e, info) => {
          const pageWidth = window.innerWidth;
          const pageHeight = window.innerHeight;
          const distanceXToCenter = info.point.x - pageWidth / 2;
          const distanceYToCenter = info.point.y - pageHeight / 2;
          const angle = Math.atan2(distanceYToCenter, distanceXToCenter);
          gradientAngle.set(angle);
        }}
        style={{
          cursor: "grab",
          width: glassWidth,
          height: glassHeight,
          borderRadius: `${borderRadius}px`,
          transitionProperty: "box-shadow, margin-top",
          transitionDuration: "0.3s",
          marginTop: useTransform(isDragging, (dragging) =>
            dragging ? -2 : 0
          ),
          boxShadow: useTransform(isDragging, (dragging) =>
            dragging
              ? `1px 11px 13px rgba(0, 0, 0, 0.05)`
              : `0px 2px 9px rgba(0, 0, 0, 0.03)`
          ),
        }}
        whileDrag={{ cursor: "grabbing" }}
      >
        <div className="z-40">{children}</div>
        <motion.div
          className="absolute"
          style={{
            top: -MARGIN,
            left: -MARGIN,
            width: glassWidth + MARGIN,
            height: glassHeight + MARGIN,
            backdropFilter: `url(#noiseEffect2)`,
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
