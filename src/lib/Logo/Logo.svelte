<script lang="ts">
  import { Matrix } from '@kube/math';
  import { onMount, onDestroy } from 'svelte';
  import { spring } from 'svelte/motion';
  import { facePath, isFaceFacingCamera } from './Face';
  import { STRIPES } from './STRIPES';

  const CAMERA_WIDTH = 81;
  const CAMERA_HEIGHT = 81;
  const VIEWBOX = [
    -CAMERA_WIDTH / 2,
    -CAMERA_HEIGHT / 2,
    CAMERA_WIDTH,
    CAMERA_HEIGHT
  ].toString();

  const INITIAL_ROTATION_X = Math.PI / 4;
  const INITIAL_ROTATION_Y = Math.PI / 5;

  function handleScrollBounce() {
    console.log('Touch Move!');
  }

  let mounted = false;

  // TODO: Bounce Effect on Safari (and try Chrome and Edge too)
  onMount(() => {
    mounted = true;
    document.addEventListener('scroll', handleScrollBounce);
  });

  onDestroy(() => {
    if (mounted) document.removeEventListener('scroll', handleScrollBounce);
  });

  const rotation = spring(
    { x: INITIAL_ROTATION_X, y: INITIAL_ROTATION_Y },
    { stiffness: 0.0061, damping: 0.094 }
  );

  let revolutions = 0;

  let originClientX = 0;
  let originClientY = 0;

  function revolution() {
    revolutions = revolutions === 1 ? 0 : 1;
    rotation.set({
      x: INITIAL_ROTATION_X,
      y: INITIAL_ROTATION_Y + Math.PI * 2 * revolutions
    });
  }

  const handleMouseDown: svelte.JSX.MouseEventHandler<SVGSVGElement> = e => {
    originClientX = e.clientX;
    originClientY = e.clientY;

    function mouseMoveListener(e: MouseEvent) {
      // TODO: Should be correctly calculated using angle and magnitude
      const delta = {
        x: (e.clientX - originClientX) / 100,
        y: (e.clientY - originClientY) / 100
      };

      console.log(delta.x);
      console.log(delta.y);

      rotation.set({
        x: INITIAL_ROTATION_X - delta.y,
        y: INITIAL_ROTATION_Y + Math.PI * 2 * revolutions + delta.x
      });
    }

    function mouseUpListener() {
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);
      rotation.set({
        x: INITIAL_ROTATION_X,
        y: INITIAL_ROTATION_Y + Math.PI * 2 * revolutions
      });
    }

    document.addEventListener('mousemove', mouseMoveListener);
    document.addEventListener('mouseup', mouseUpListener);

    e.preventDefault();
  };

  $: cubeTransformations = Matrix.scale(CAMERA_WIDTH * 0.6)
    .dot(Matrix.rotationX($rotation.x))
    .dot(Matrix.rotationY($rotation.y));

  $: projectedCubeStripes = STRIPES.map(face =>
    face.map(vector => vector.multiplyByMatrix(cubeTransformations))
  ).filter(isFaceFacingCamera);

  $: d = projectedCubeStripes.map(facePath).join(' ');
</script>

<svg
  on:click={revolution}
  on:mousedown={handleMouseDown}
  width={CAMERA_WIDTH}
  height={CAMERA_HEIGHT}
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
