import { MotionValue, useTransform } from "motion/react";
import {
  ConcaveButton,
  ConvexCircleButton,
  ConvexSquircleButton,
  LipButton,
} from "./Buttons";

export type SurfaceType =
  | "convex_circle"
  | "convex_squircle"
  | "concave"
  | "lip";

interface SurfaceEquationSelectorProps {
  surface: MotionValue<SurfaceType>;
  onSurfaceChange?: (surface: SurfaceType) => void | Promise<void>;
}

export const SurfaceEquationSelector: React.FC<
  SurfaceEquationSelectorProps
> = ({ surface, onSurfaceChange }) => {
  const handleSurfaceSelect = async (newSurface: SurfaceType) => {
    surface.set(newSurface);
    if (onSurfaceChange) {
      await onSurfaceChange(newSurface);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <ConvexCircleButton
        active={useTransform(surface, (s) => s === "convex_circle")}
        onClick={() => handleSurfaceSelect("convex_circle")}
      />
      <ConvexSquircleButton
        active={useTransform(surface, (s) => s === "convex_squircle")}
        onClick={() => handleSurfaceSelect("convex_squircle")}
      />
      <ConcaveButton
        active={useTransform(surface, (s) => s === "concave")}
        onClick={() => handleSurfaceSelect("concave")}
      />
      <LipButton
        active={useTransform(surface, (s) => s === "lip")}
        onClick={() => handleSurfaceSelect("lip")}
      />
    </div>
  );
};
