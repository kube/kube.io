---
title: 42 Scalizer
github: https://github.com/kube/scalizer
index: 9
---

When creating exercises for the **42 JavaScript Piscine** (a 2-week programming bootcamp), I had to create validation scales using a Yaml Schema really difficult to change once written:

- 100 points were dispatched between each exercise manually.
- Each exercise had to be numbered by its index by hand.

If an exercise was modified or added anywhere, this had to be done again for all exercises.

**42 Scalizer** was a simple CLI permitting to automatically harmonize exercise points, and allowing float values.

It also used a much more simple schema, permitted exportation to the legacy format for compatibility, and visualized points progression in a simple chart.
