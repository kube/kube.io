---
title: FdF
youtube: https://youtube.com/embed/X3pcTRCgQF4
---

**FdF** was 42 first Graphics project.

It's a **basic [rasterizer](https://en.wikipedia.org/wiki/Rasterisation)**, which takes a map of altitudes as input, and needs to render a 3D view of it.

No helper library are allowed, so each part (color blend, line-drawing, antialias, camera, projection...) had to be recoded from scratch.

My project added as bonuses:

- Antialiased lines
- Movement blur
- Parallel/One-point perspective switch
- Adjustable perspective point.

All this project was written in pure C, upon our LibFt and a subset of LibX called [MiniLibX](https://github.com/abouvier/minilibx).
