---
id: 'ownership'
category: 'FOUNDATION'
title: '05. Ownership'
subtitle: 'Value Semantics'
manual_link: 'https://docs.modular.com/mojo/manual/lifecycle'
---

Mojo's ownership system ensures memory safety without a garbage collector. By tracking the "owner" of a value, Mojo knows exactly when to free memory.

*   **Value Semantics**: Copying a variable creates a new, independent instance by default.
*   **Transfer Operator (`^`)**: Also known as "move". It moves a value from one variable to another and ends the lifetime of the original variable.
*   **Transferring is efficient**: It avoids deep copies, which is crucial for high-performance systems.

```mojo
def consume(var s: String):
    print("Consumed:", s)

def main():
    var name: String = "Mojo"
    consume(name^)
```
