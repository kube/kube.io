import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LiquidGlassProps = React.PropsWithChildren<{
  children?: React.ReactNode;
  borderRadius?: number;
  glassWidth?: number;
  glassHeight?: number;
}>;

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  borderRadius = 100,
  glassWidth = 200,
  glassHeight = 200,
}) => {
  const gradientAngle = useMotionValue(Math.PI / 2);

  const isDragging = useMotionValue(false);
  const blurRatio = useSpring(0.2, { damping: 10, stiffness: 150 });

  function bezelLayer(
    offset: number,
    thickness: number | null,
    blur: number,
    bezelBlur: number,
    highlightOpacity: number,
    saturation: number = 120,
    contrast: number = 110,
    brightness: number = 100,
    opacity: number,
    mixBlendMode: React.CSSProperties["mixBlendMode"] = "normal"
  ) {
    const outerBorderRadius = Math.max(0, borderRadius - offset);
    const offsetIn = offset + (thickness ?? 0);
    const innerBorderRadius = Math.max(0, borderRadius - offsetIn);

    return (
      <div>
        <motion.div
          className="absolute h-full w-full top-0 left-0"
          style={{
            backgroundImage: useTransform(
              gradientAngle,
              (a) =>
                `linear-gradient(${a}rad, rgba(255,255,255,${highlightOpacity}%) 0%, rgba(70,70,70,${
                  highlightOpacity * 0.7
                }%) 30%, rgba(70,70,70,${
                  highlightOpacity * 0.7
                }%) 70%, rgba(255,255,255,${highlightOpacity}%) 100%)`
            ),
            opacity,
            mixBlendMode,
            backdropFilter: useTransform(
              blurRatio,
              (ratio) =>
                `blur(${blur * ratio}px)
                saturate(${saturation}%) contrast(${contrast}%) brightness(${brightness}%)`
            ),
            maskImage: [
              `url("data:image/svg+xml;utf8,`,
              `<svg xmlns='http://www.w3.org/2000/svg' width='${glassWidth}' height='${glassHeight}'>`,
              `<defs><filter id='blur'><feGaussianBlur stdDeviation='${bezelBlur}'/></filter></defs>`,
              `<rect width='${glassWidth - offset * 2}' height='${
                glassHeight - offset * 2
              }' x='${offset}' y='${offset}' rx='${outerBorderRadius}' fill='white' />`,
              ...(thickness !== null
                ? [
                    `<rect width='${glassWidth - offsetIn * 2}'`,
                    `height='${glassHeight - offsetIn * 2}'`,
                    `x='${offsetIn}' y='${offsetIn}' rx='${innerBorderRadius}' fill='black' filter='url(%23blur)'/>`,
                  ]
                : []),
              `</svg>")`,
            ].join(" "),
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskType: "luminance",
            maskMode: "luminance",
            // @ts-expect-error
            "--highlightOpacity": `${highlightOpacity}%`,
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="fixed z-40 top-10 left-10 flex items-center justify-center overflow-hidden select-none"
      drag
      dragMomentum={false}
      onMouseDown={() => {
        isDragging.set(true);
        blurRatio.set(0.7);
      }}
      onTouchStart={() => {
        isDragging.set(true);
        blurRatio.set(0.7);
      }}
      onDragStart={() => {
        isDragging.set(true);
        blurRatio.set(0.7);
      }}
      onDragEnd={() => {
        isDragging.set(false);
        blurRatio.set(0.2);
      }}
      onMouseUp={() => {
        isDragging.set(false);
        blurRatio.set(0.2);
      }}
      onTouchEnd={() => {
        isDragging.set(false);
        blurRatio.set(0.2);
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
        marginTop: useTransform(isDragging, (dragging) => (dragging ? -2 : 0)),
        boxShadow: useTransform(isDragging, (dragging) =>
          dragging
            ? `1px 11px 13px rgba(0, 0, 0, 0.05)`
            : `0px 2px 9px rgba(0, 0, 0, 0.03)`
        ),
      }}
      whileDrag={{ cursor: "grabbing" }}
    >
      <div className="z-40">{children}</div>
      {/* // Full backdrop background */}
      {bezelLayer(0, null, 4, 0, 2, 100, 100, 105, 1)}
      {/* // Progressive bezel steps */}
      {bezelLayer(0, 20, 10, 9, 1, 100, 100, 100, 1)}
      {bezelLayer(0, 16, 20, 6, 3, 100, 100, 100, 1, "normal")}
      {bezelLayer(0, 12, 40, 5, 3, 110, 102, 101, 1, "normal")}
      {bezelLayer(0, 8, 60, 4, 10, 120, 102, 101, 1, "normal")}
      {bezelLayer(0, 2, 180, 10, 40, 170, 110, 90, 1, "normal")}
      {/* // Border */}
      {bezelLayer(0, 1, 150, 0, 70, 180, 120, 100, 1, "normal")}
      <div
        className="absolute top-0 left-0 w-full h-full dark:bg-black/10 bg-slate-400/10"
        style={{
          borderRadius: `${borderRadius}px`,
          // backdropFilter: `blur(${1}px) saturate(100%) contrast(160%) brightness(105%)`,
        }}
      />
    </motion.div>
  );
};

export const InPortal: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalRoot(document.getElementById("portal-root")), []);
  return portalRoot && createPortal(children, portalRoot);
};
