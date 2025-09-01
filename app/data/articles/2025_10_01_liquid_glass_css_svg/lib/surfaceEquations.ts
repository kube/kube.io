export type SurfaceFnDef = {
  key: string;
  title: string;
  desc: string;
  equation: string;
  fn: (x: number) => number;
};

export const CONVEX: SurfaceFnDef = {
  key: "convex",
  title: "Convex",
  desc: "Dome-like bezel profile. Produces inward refraction near edges.",
  equation: "y = \\sqrt{1 - (1 - x)^2}",
  fn: (x) => Math.pow(1 - Math.pow(1 - x, 4), 1 / 4),
};

export const CONCAVE: SurfaceFnDef = {
  key: "concave",
  title: "Concave",
  desc: "Cave-like profile. Can push rays outward; heavier visual distortion.",
  equation: "y = 1 - \\sqrt{1 - (1 - x)^2}",
  fn: (x) => 1 - CONVEX.fn(x + 0.01),
};

export const LIP: SurfaceFnDef = {
  key: "lip",
  title: "Lip",
  desc: "Lipped bezel mixing a circular edge with a subtle sinusoidal lip.",
  equation:
    "y = mix(circle(2x), 0.5 + 0.025,cos(2\\pi(x+0.5)), 1 - smootherstep(x))",
  fn: (x) => {
    const circle = CONVEX.fn(x);
    const sin = CONCAVE.fn(x) + 0.5;
    const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    const ratioCircle = 1 - smootherstep;
    return circle * ratioCircle + sin * (1 - ratioCircle);
  },
};

export const fns: SurfaceFnDef[] = [CONVEX, CONCAVE, LIP];
