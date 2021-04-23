---
title: RayTracer
youtube: https://www.youtube.com/embed/1JoTZg4Ulo0
github: https://github.com/kubekhrm/RT
---

**RayTracer** was 42 first-semester Graphics final group project.

The imperative was to create a basic [raytracer](<https://en.wikipedia.org/wiki/Ray_tracing_(graphics)>) with some simple geometric shapes.

We decided to differentiate from other projects on the UX, by adding an embedded editor usable with mouse/keyboard, a post-render adjustable diaphragm, and some other commands.

This implied performance optimization, so we decided to make the renderer asynchronous from the scene-edition events, and to use multithreading for faster computation.

All this project was written in pure C, upon our LibFt and a subset of LibX called [MiniLibX](https://github.com/abouvier/minilibx).
