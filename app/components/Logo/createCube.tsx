import { Matrix } from "@kube/math";

import { createCubeStripes } from "./createStripes";
import { isFaceFacingCamera } from "./Face";

export function createCube(transform: Matrix<4, 4>) {
  const STRIPES = createCubeStripes();

  return STRIPES.map(
    (stripe) => stripe.map((vector) => vector.multiplyByMatrix(transform))
    // @ts-expect-error
  ).filter(isFaceFacingCamera);
}
