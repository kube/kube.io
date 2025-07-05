import { Matrix } from "@kube/math";

import { createCubeStripes } from "./createStripes";
import { isFaceFacingCamera } from "./Face";

const STRIPES = createCubeStripes();

export function createCube(transform: Matrix<4, 4>) {
  return STRIPES.map(
    (stripe) => stripe.map((vector) => vector.multiplyByMatrix(transform))
    // @ts-expect-error
  ).filter(isFaceFacingCamera);
}
