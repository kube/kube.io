import { Matrix, Vector } from "@kube/math";

import { createCubeStripes } from "./createStripes";
import { facePath, isFaceFacingCamera } from "./Face";

// Translations in space to get a cube surrounded by 6 cubes
// This defines the pattern
const TRANSLATIONS = [
  Matrix.translation(0, 0, 0),
  Matrix.translation(0, 1, 1),
  Matrix.translation(0, -1, -1),
  Matrix.translation(1, 1, 0),
  Matrix.translation(-1, -1, 0),
  Matrix.translation(-1, 0, 1),
  Matrix.translation(1, 0, -1),
];

export function createBackground(
  width = 48,
  stripes = 3,
  marginRatio = 0.11,
  innerMarginRatio = 0.27,
  rotationX = Math.PI / 4,
  rotationY = Math.PI / 5
) {
  const STRIPES = createCubeStripes(stripes, marginRatio, innerMarginRatio);

  const transformations = Matrix.scale(width)
    .dot(Matrix.rotationX(rotationX))
    .dot(Matrix.rotationY(rotationY));

  // We could maybe only take vectors that do a diagonal in both axis
  const allVectorsToEdges = [
    new Vector([-1, -1, -1, 1]),
    new Vector([-1, -1, 1, 1]),
    new Vector([-1, 1, -1, 1]),
    new Vector([-1, 1, 1, 1]),
    new Vector([1, -1, -1, 1]),
    new Vector([1, -1, 1, 1]),
    new Vector([1, 1, -1, 1]),
    new Vector([1, 1, 1, 1]),
  ].map((vector) => vector.multiplyByMatrix(transformations));

  const PATTERN_WIDTH =
    Math.max(...allVectorsToEdges.map((_) => Math.abs(_[0]))) * 1.5;

  const PATTERN_HEIGHT = Math.max(
    ...allVectorsToEdges.map((_) => Math.abs(_[1]))
  );

  const VIEWBOX = [
    -PATTERN_WIDTH / 2,
    -PATTERN_HEIGHT / 2,
    PATTERN_WIDTH,
    PATTERN_HEIGHT,
  ].join(" ");

  const CUBES_STRIPES_SET = TRANSLATIONS.map((matrix) =>
    STRIPES.map((face) => face.map((point) => point.multiplyByMatrix(matrix)))
  ).flat(1);

  const PATH_D = CUBES_STRIPES_SET.map((stripe) =>
    stripe.map((vector) => vector.multiplyByMatrix(transformations))
  )
    // @ts-expect-error
    .filter(isFaceFacingCamera)
    // @ts-expect-error
    .map(facePath)
    .join(" ");

  return {
    width: PATTERN_WIDTH,
    height: PATTERN_HEIGHT,
    viewBox: VIEWBOX,
    pathD: PATH_D,
  };
}
