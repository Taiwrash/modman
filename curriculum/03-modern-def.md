---
id: 'functions'
category: 'FOUNDATION'
title: '03. Modern def'
subtitle: 'Unified Functions'
manual_link: 'https://docs.modular.com/mojo/manual/functions'
---

Modern Mojo uses a unified `def` keyword. When you provide type annotations, Mojo enforces strict compile-time checks, giving you the performance of C++ with the syntax of Python.

#### Important changes in v26.2:
*   **Non-raising by default**: Unlike older versions, `def` no longer implicitly allows errors. Use the `raises` keyword if your function can fail.
*   **Strict Parameter Passing**: Arguments are passed by immutable reference (`read`) by default in typed functions.

```mojo
def add(a: Int, b: Int) -> Int:
    return a + b

def main():
    var result = add(5, 5)
    print("5 + 5 =", result)
```
