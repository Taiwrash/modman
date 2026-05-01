---
id: 'structs'
category: 'FOUNDATION'
title: '04. Structs'
subtitle: 'Static Types'
manual_link: 'https://docs.modular.com/mojo/manual/structs'
---

A `struct` is a static, compile-time data structure. Unlike Python classes, Mojo structs are memory-dense and have no runtime overhead.

*   **Fields**: All fields must be declared with `var`.
*   **Methods**: Defined using `def`. The first argument must be `self`.
*   **Constructor**: Use `def __init__` to initialize fields. Use the `out` decorator on `self` for initialization.

```mojo
struct MyPair:
    var first: Int
    var second: Int

    def __init__(out self, f: Int, s: Int):
        self.first = f
        self.second = s

    def dump(read self):
        print("Pair:", self.first, self.second)

def main():
    var pair = MyPair(1, 2)
    pair.dump()
```
