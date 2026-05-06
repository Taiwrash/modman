---
id: 'decorators'
category: 'FOUNDATION'
title: '06. Param Decorators'
subtitle: 'Explicit Memory'
manual_link: 'https://docs.modular.com/mojo/manual/values/ownership/#argument-conventions'
---

Mojo provides fine-grained control over how arguments are passed to functions via decorators:

*   **`read`**: The default for typed functions. Passes an immutable reference. No copy is made, and the caller retains ownership.
*   **`mut`**: Passes a mutable reference. Changes made inside the function affect the original variable.
*   **`var`**: The function takes full ownership of the value. The caller must either provide a copy or use `^` to move it.

```mojo
def update(mut x: Int):
    x += 10

def read_val(read x: Int):
    print("Value is:", x)

def main():
    var a = 5
    update(a)
    read_val(a)
```
