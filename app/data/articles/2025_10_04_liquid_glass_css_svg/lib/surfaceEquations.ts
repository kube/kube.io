export type SurfaceFnDef = {
  title: string;
  fn: (x: number) => number;
};

export const CONVEX_CIRCLE: SurfaceFnDef = {
  title: "Convex Circle",
  fn: (x) => Math.sqrt(1 - (1 - x) ** 2),
};

export const CONVEX: SurfaceFnDef = {
  title: "Convex Squircle",
  fn: (x) => Math.pow(1 - Math.pow(1 - x, 4), 1 / 4),
};

export const CONCAVE: SurfaceFnDef = {
  title: "Concave",
  fn: (x) => 1 - CONVEX_CIRCLE.fn(x),
};

export const LIP: SurfaceFnDef = {
  title: "Lip",
  fn: (x) => {
    const convex = CONVEX.fn(x * 2);
    const concave = CONCAVE.fn(x) + 0.1;
    const smootherstep = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
    return convex * (1 - smootherstep) + concave * smootherstep;
  },
};

export const fns: SurfaceFnDef[] = [CONVEX, CONCAVE, LIP];
