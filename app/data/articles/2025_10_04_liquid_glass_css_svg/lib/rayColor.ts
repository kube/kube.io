export function getRayColor(intensity: number) {
  const hue = 180 + Math.abs(intensity) * 85;
  return `hsl(${hue},88%,54%)`;
}

export function getRayColorDimmed(intensity: number) {
  const hue = 180 + Math.abs(intensity) * 85;
  return `hsl(${hue},76%,45%)`;
}
