---
title: Redux Electron Global Dispatch
description: A Redux middleware permitting to dispatch actions globally in an Electron application
github: https://github.com/kube/redux-electron-global-dispatch
index: 12
---

This library provides a simple way to have **Redux actions globally dispatched** through all processes of an Electron application, thanks to a middleware.

It permits to define easily which actions will be dispatched globally, by configuring the middleware:

```js
applyMiddleware(
  createGlobalDispatchMiddleware(
    action => action.type === 'INCREMENT'
  )
);
```

Or if using the default already-specialized middleware, just define actions with a `global` property set to `true`:

```js
const globalIncrement = x => ({
  global: true,
  type: 'INCREMENT',
  payload: x
});
```
