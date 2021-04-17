<script lang="ts">
	import { Matrix } from '@kube/math';
	import { spring } from 'svelte/motion';
	import { facePath, isFaceFacingCamera } from './Face';
	import { STRIPES } from './STRIPES';

	const CAMERA_WIDTH = 81;
	const CAMERA_HEIGHT = 81;
	const VIEWBOX = [-CAMERA_WIDTH / 2, -CAMERA_HEIGHT / 2, CAMERA_WIDTH, CAMERA_HEIGHT].toString();

	const INITIAL_ROTATION_X = Math.PI / 4;
	const INITIAL_ROTATION_Y = Math.PI / 5;

	const rotation = spring(
		{ x: INITIAL_ROTATION_X, y: INITIAL_ROTATION_Y },
		{ stiffness: 0.0061, damping: 0.094 }
	);

	let revolutions = 0;

	let previousClientX = 0;
	let previousClientY = 0;

	function revolution() {
		rotation.set({ x: INITIAL_ROTATION_X, y: INITIAL_ROTATION_Y + Math.PI * 2 * revolutions });
	}

	const handleMouseDown: svelte.JSX.MouseEventHandler<SVGSVGElement> = e => {
		revolutions = revolutions === 1 ? 0 : 1;

		// rotation.set({ x: INITIAL_ROTATION_X, y: INITIAL_ROTATION_Y + Math.PI * 2 * revolutions });

		previousClientX = e.clientX;
		previousClientY = e.clientY;

		function mouseMoveListener(e: MouseEvent) {
			const delta = { x: e.clientX - previousClientX, y: e.clientY - previousClientY };

			previousClientX = e.clientX;
			previousClientY = e.clientY;

			rotation.set({ x: $rotation.x - delta.y / 10, y: $rotation.y + delta.x / 10 });
		}

		document.addEventListener('mousemove', mouseMoveListener);

		document.addEventListener('mouseup', () => {
			document.removeEventListener('mousemove', mouseMoveListener);
			rotation.set({ x: INITIAL_ROTATION_X, y: INITIAL_ROTATION_Y });
		});

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
