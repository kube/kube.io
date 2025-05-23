import { Matrix } from "@kube/math";

import { createCube } from "./app/components/Logo/createCube";
import { facePath } from "./app/components/Logo/Face";

export function createFavicon() {
  const VIEWBOX = [-50, -50, 100, 100].toString();

  const BASE_ROTATION_X = Math.PI / 4;
  const BASE_ROTATION_Y = Math.PI / 5;

  const BASE_CUBE_TRANSFORMS = Matrix.scale(60)
    .dot(Matrix.rotationX(BASE_ROTATION_X))
    .dot(Matrix.rotationY(BASE_ROTATION_Y));

  const cubeStripes = createCube(BASE_CUBE_TRANSFORMS);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">
  <path fill="#7160b7" d="${
    // @ts-expect-error
    cubeStripes.map(facePath).join(" ")
  }" />
  </svg>`;

  return Buffer.from(svg, "utf-8");
}
