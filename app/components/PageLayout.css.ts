import { style } from "@vanilla-extract/css";

function map(
  [o1, o2]: [number, number], // origin
  [d1, d2]: [number, number], // destination
  unit = ""
) {
  const s = (d2 - d1) / (o2 - o1); // scale
  const expr = `calc(((var(--scroll-progress) - ${o1}) * ${s} + ${d1}) * 1${unit})`; // transform expression
  const dMin = Math.min(d1, d2);
  const dMax = Math.max(d1, d2);
  return `clamp(${dMin}${unit}, ${expr}, ${dMax}${unit})`; // Return clamped value
}

function threshold(threshold: number, [v1, v2]: [number, number], unit = "") {
  const trigger = `(clamp(0, (var(--scroll-progress) - ${threshold}) * 999, 1)`;
  return `calc(${trigger} * (${v2} - ${v1}) + ${v1}) * 1${unit})`;
}

export const scrollDerivedVariables = style({
  vars: {
    "--bg-opacity": map([130, 180], [0, 40], "%"),
    "--border-opacity": map([160, 220], [0, 90], "%"),
    "--header-pattern-opacity": map([0, 160], [0, 40], "%"),
    "--navbar-opacity": threshold(200, [100, 0], "%"),
    "--navbar-translate-x": threshold(200, [0, -13], "px"),
    "--navbar-z-index": threshold(200, [0, -10]),
    "--logo-width": map([70, 160], [54, 38], "px"),
    "--header-blur": map([150, 220], [0, 9], "px"),
    "--margin-top": map([0, 160], [70, 0], "px"),
    "--font-size": map([0, 160], [1.3, 1], "rem"),
  },
});
