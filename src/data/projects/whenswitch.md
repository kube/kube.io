---
title: WhenSwitch
description: A simple, type-safe, `case/when` statement for JavaScript
github: https://github.com/kube/when-switch
index: 14
---

**WhenSwitch** adds Ruby-like `case/when` statements in JavaScript, through a single `when` function.

Ternary expressions become too much nested when handling too much cases,
and switch statements are [error-prone and block-only](https://medium.com/chrisburgin/rewriting-javascript-replacing-the-switch-statement-cfff707cf045), WhenSwitch enables simple function conditional flows, as expressions:

```js
const getDrinkPrice = drink =>
  when(drink)
    .is('Coke', 1.5)
    .is('Pepsi', 1.8)
    .else(2.0);
```

This is useful for conditional components in React for example:

```jsx
<div>
  {when(props.page)
    .is('Hello', () => <HelloPage />)
    .is('World', () => <WorldPage />)
    .else(() => (
      <Page404 />
    ))}
</div>
```

JavaScript not being lazily evaluated though, it adds some overhead on expressions, needing to wrap them in thunks.

Another issue is with TypeScript: The goal here was to have something completely type-safe, but as it was impossible at the moment to define generic [type guards](https://basarat.gitbooks.io/typescript/docs/types/typeGuard.html),
I left this library as it was, and for now only use it for simple cases.
