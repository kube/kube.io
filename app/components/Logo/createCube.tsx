import { Matrix } from "@kube/math";

import { createCubeStripes } from "./createStripes.ts";
import { isFaceFacingCamera } from "./Face.ts";

const STRIPES = createCubeStripes();

export function createCube(transform: Matrix<4, 4>) {
  return STRIPES.map(
    (stripe) => stripe.map((vector) => vector.multiplyByMatrix(transform)),
    // @ts-expect-error
  ).filter(isFaceFacingCamera);
}
