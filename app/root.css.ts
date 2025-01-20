import { style } from "@vanilla-extract/css";

import { createBackground } from "./components/Logo/createBackground";

// VanillaExtract is used here to compute the kube background pattern at build time.

const background = createBackground(110, 6, 0.1, 0.7);

function generateBackgroundURI(fill: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg'
    width='${background.width}'
    height='${background.height}'
    viewBox='${background.viewBox}'>
    <path fill="${fill}" d="${background.pathD}"/>
  </svg>`)}")`;
}

export const root = style({
  vars: {
    "--kube-background-light": generateBackgroundURI("#FFFFFF40"),
    "--kube-background-dark": generateBackgroundURI("#00000036"),
  },
});
