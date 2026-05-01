---
id: 'variables'
category: 'FOUNDATION'
title: '02. Variables'
subtitle: 'Variables'
manual_link: 'https://docs.modular.com/mojo/manual/variables'
---

Mojo provides a way to declare variables using the `var` keyword:

*   **`var`**: Declares a variable. Its value can be updated within its scope.

While Mojo supports type inference, explicit typing (e.g., `: Int`) is recommended for systems-level code to ensure compile-time verification.

```mojo
def main():
    var x: Int = 10
    var y: Int = 20
    y += x
    print("Total:", y)
```
