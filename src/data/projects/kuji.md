---
title: Kuji
github: https://github.com/kube/kuji
npm: https://www.npmjs.com/package/kuji
index: 5
---

**Kuji** was a simple library for NodeJS, simplifying asynchronous tasks.

It was a more generic version of a previous MongoDB-specific library [MongoAsyncMultiRequest](https://github.com/kube/mongoAsyncMultiRequest).

Its goal was to easily create a **control-flow graph** for asynchronous tasks, by providing dependencies between them. This permitted to optimize the execution timeline.

It was abandonned once I realized that the `graph` feature, which was the real added-value, was already included in **Async** as [`auto`](https://caolan.github.io/async/docs.html#auto).
