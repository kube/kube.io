export function getRayColor(intensity: number) {
  const hue = 180 + Math.abs(intensity) * 90;
  return `hsl(${hue},95%,45%)`;
}
