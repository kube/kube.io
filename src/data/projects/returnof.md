---
title: ReturnOf
github: https://github.com/kube/returnof
index: 15
---

**ReturnOf** was a workaround solution permitting type inference on function returns in TypeScript.

Getting the return type of a function is something particularly interesting, in case of Redux Action Creators or React-Redux containers, to prevent code duplication, for example.

I had also opened a proposal on TypeScript [static type inference](https://github.com/Microsoft/TypeScript/issues/14400), enabling a static-only solution for return type inference.

TypeScript 2.8 finally introduced [Conditional Types](https://github.com/Microsoft/TypeScript/pull/21316), and added a new [`ReturnType`](https://github.com/Microsoft/TypeScript/pull/21496) using a new `infer` keyword.
