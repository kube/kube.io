---
title: Monolite
github: https://github.com/kube/monolite
npm: https://npmjs.org/package/monolite
---

**Monolite** is a simple, type-safe, [Structural-Sharing](https://www.youtube.com/watch?v=pLvrZPSzHxo&feature=youtu.be&t=1390) library.

It was originally written for usage in Redux reducers, but can be used anywhere you want to preserve an object immutability.

**ImmutableJS** is [not able to infer type](https://github.com/facebook/immutable-js/issues/1462) on sub-state-trees as it uses strings to define sub-tree to update:

```js
state.set(['some', 'nested', 'property'], 42);
```

Monolite, on its side, uses accessor functions to get the target node of the state tree to update:

```js
set(state, _ => _.some.nested.property, 42);
```

This allows TypeScript to do static analysis and completion on the sub-state type, and type of the updated value.

The library uses ES6 Proxies under-the-hood to analyze the accessor function.
These functions, though, can be statically resolved, using [a Babel Plugin](https://github.com/kube/babel-plugin-monolite), permitting to target older browsers not supporting `Proxy`.
