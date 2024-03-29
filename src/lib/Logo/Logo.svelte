<script lang="ts">
  import { useRegisterCommand } from '$lib/DebugContext/useRegisterCommand';

  import { Matrix, Vector } from '@kube/math';
  import { onMount } from 'svelte';
  import { spring } from 'svelte/motion';
  import { facePath, isFaceFacingCamera } from './Face';
  import { STRIPES } from './STRIPES';

  type Point = [number, number];

  let svgElement: SVGElement;

  export let WIDTH = 48;
  export let HEIGHT = 48;

  const VIEWBOX = [
    -WIDTH / 2 - 4,
    -HEIGHT / 2 - 4,
    WIDTH + 8,
    HEIGHT + 8
  ].toString();

  const BASE_ROTATION_X = Math.PI / 4;
  const BASE_ROTATION_Y = Math.PI / 5;
  const BASE_SCALE = 1;

  let revolutions = 0;
  let originClientX = 0;
  let originClientY = 0;

  const INITIAL_ROTATION_Y_OFFSET = -Math.PI * 2;

  const rotation = spring(
    {
      x: BASE_ROTATION_X,
      y: BASE_ROTATION_Y + INITIAL_ROTATION_Y_OFFSET,
      scale: BASE_SCALE
    },
    { stiffness: 0.0061, damping: 0.094 }
  );

  const dragRotation = spring(
    { x: 0, y: 0 },
    { stiffness: 0.0061, damping: 0.094 }
  );

  onMount(() => {
    rotation.set({ x: BASE_ROTATION_X, y: BASE_ROTATION_Y, scale: BASE_SCALE });
  });

  export function revolution() {
    revolutions = revolutions === 1 ? 0 : 1;
    rotation.set({
      x: BASE_ROTATION_X,
      y: BASE_ROTATION_Y + Math.PI * 2 * revolutions,
      scale: BASE_SCALE
    });
  }
  function verticalRevolution() {
    revolutions = revolutions === 1 ? 0 : 1;
    rotation.set({
      x: BASE_ROTATION_X + Math.PI * 2 * revolutions,
      y: BASE_ROTATION_Y,
      scale: BASE_SCALE
    });
  }

  useRegisterCommand({
    id: 'logo-rotate',
    group: 'Logo',
    label: 'Revolution',
    callback: revolution
  });
  useRegisterCommand({
    id: 'logo-rotate',
    group: 'Logo',
    label: 'Vertical Revolution',
    callback: verticalRevolution
  });

  // Agnostic Drag Handlers

  function handleCubeDragStart([x, y]: Point) {
    originClientX = x;
    originClientY = y;
  }

  function handleCubeDragMove([x, y]: Point) {
    const delta = {
      x: x - originClientX,
      y: y - originClientY
    };
    dragRotation.set({
      x: delta.x,
      y: delta.y
    });
  }

  function handleCubeDragEnd() {
    dragRotation.set({ x: 0, y: 0 });
  }

  // Touch Listeners

  function handleTouchStart(ev: TouchEvent) {
    const { clientX, clientY } = ev.touches[0];
    handleCubeDragStart([clientX, clientY]);
  }

  function handleTouchMove(ev: TouchEvent) {
    const { clientX, clientY } = ev.touches[0];
    handleCubeDragMove([clientX, clientY]);
    ev.preventDefault();
  }

  function handleTouchEnd() {
    handleCubeDragEnd();
  }

  // Mouse Listeners

  function handleMouseMove(ev: MouseEvent) {
    const { clientX, clientY } = ev;
    handleCubeDragMove([clientX, clientY]);
  }

  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    handleCubeDragEnd();
  }

  function handleMouseDown(ev: MouseEvent) {
    const { clientX, clientY } = ev;
    handleCubeDragStart([clientX, clientY]);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    ev.preventDefault();
  }

  // Attach Listeners

  onMount(() => {
    svgElement.addEventListener('mousedown', handleMouseDown);
    svgElement.addEventListener('touchstart', handleTouchStart);
    svgElement.addEventListener('touchmove', handleTouchMove);
    svgElement.addEventListener('touchend', handleTouchEnd);
    return () => {
      svgElement.removeEventListener('mousedown', handleMouseDown);
      svgElement.removeEventListener('touchstart', handleTouchStart);
      svgElement.removeEventListener('touchmove', handleTouchMove);
      svgElement.removeEventListener('touchend', handleTouchEnd);
    };
  });

  // Cube Calculation

  $: dragVector = new Vector([$dragRotation.x, $dragRotation.y, 0, 1]);
  $: rotationAxis = dragVector.rotateZ(Math.PI / 2).normalize();
  $: angle = dragVector.norm() / 100;

  $: cubeTransformations = Matrix.scale(WIDTH * 0.6 * $rotation.scale)
    .dot(Matrix.rotationX($rotation.x))
    .dot(Matrix.rotationY($rotation.y))
    .dot(Matrix.rotation(rotationAxis, angle));

  $: projectedCubeStripes = STRIPES.map(face =>
    face.map(vector => vector.multiplyByMatrix(cubeTransformations))
  ).filter(isFaceFacingCamera);

  $: d = projectedCubeStripes.map(facePath).join(' ');
</script>

<svg
  bind:this={svgElement}
  on:click={revolution}
  width={WIDTH}
  height={HEIGHT}
  viewBox={VIEWBOX}
>
  <path fill="#7160b7" {d} />
</svg>

<style lang="scss">
  svg {
    transition: transform ease-in-out 0.2s;
    &:hover {
      transform: scale(1.06);
    }
    &:active {
      transform: scale(0.9);
    }
  }
  @media print {
    svg {
      display: none;
    }
  }
</style>
