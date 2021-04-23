
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

import * as monolite from './projects/monolite.md';
import * as returnof from './projects/returnof.md';
import * as whenswitch from './projects/whenswitch.md';
import * as kaytheme from './projects/kaytheme.md';
import * as reduxelectronglobaldispatch from './projects/reduxelectronglobaldispatch.md';
import * as reactelectron from './projects/reactelectron.md';
import * as _42graphql from './projects/42graphql.md';
import * as _42scalizer from './projects/42scalizer.md';
import * as vscodeclangcomplete from './projects/vscodeclangcomplete.md';
import * as vscode42header from './projects/vscode42header.md';
import * as cut from './projects/cut.md';
import * as kuji from './projects/kuji.md';
import * as zappy from './projects/zappy.md';
import * as raytracer from './projects/raytracer.md';
import * as fdf from './projects/fdf.md';
import * as libft from './projects/libft.md';
import * as sudoku from './projects/sudoku.md';

export type Project = {
	default: any;
	metadata: {
		title: string;
		subtitle?: string;
		text?: string;
		picture?: string;
		youtube?: string;
		github?: string;
		npm?: string;
	};
};

export const PROJECTS: Project[] = [
	monolite,
	returnof,
	whenswitch,
	kaytheme,
	reduxelectronglobaldispatch,
	reactelectron,
	_42graphql,
	_42scalizer,
	vscodeclangcomplete,
	vscode42header,
	cut,
	kuji,
	zappy,
	raytracer,
	fdf,
	libft,
	sudoku
];
