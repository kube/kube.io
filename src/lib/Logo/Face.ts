
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import { Vector } from '@kube/math';

export type Face = [Vector<4>, Vector<4>, Vector<4>, Vector<4>];

export function normal([a, b, c, d]: Face) {
	return Vector.cross(Vector.subtract(c, a), Vector.subtract(d, b));
}

const visionVector = new Vector([0, 0, -1, 1]);

export function isFaceFacingCamera(shape: Face) {
	return Vector.dot(normal(shape), visionVector) > 0;
}

function round(x: number) {
	return Math.floor(x * 4) / 4;
}

export function facePath(face: Face) {
	return face
		.map(([_x, _y], i) => {
			const x = round(_x);
			const y = round(_y);
			if (i === 0) {
				return `M${x},${y}`;
			} else if (x === face[i - 1][0]) {
				return `V${y}`;
			} else if (y === face[i - 1][1]) {
				return `H${x}`;
			} else {
				return `L${x},${y}`;
			}
		})
		.concat('Z')
		.join('');
}
