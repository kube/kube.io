---
title: CUT
github: https://github.com/kube/cut
index: 6
---

**CUT** is for C Unit Testing.

It was an attempt to create a simple way to write unit tests for C programs.

It included **CutRun**, a CLI written in Ruby in charge of compiling and running automatically the tests.

This permitted to reduce need of test-specific configuration in the project.
Comment-based directives could be added in top of test files, to provide more compilation flags to CutRun.

The idea was to try to offer a programming experience close from what could be found with **Jest** in the JavaScript world.

The project was abandonned as I was not sure of the architecture and I was not programming anymore with C at the time.
