---
id: 'hello'
category: 'FOUNDATION'
title: '01. Hello Mojo'
subtitle: 'Modern & Fast'
manual_link: 'https://docs.modular.com/mojo/manual/basics'
---

Mojo is a new programming language that bridges the gap between Python and systems programming. Every Mojo program begins execution at the `main()` entry point.

In modern Mojo (v26.2+), the `def` keyword is the **unified standard** for defining functions, replacing the deprecated `fn` syntax.

### Key Concept
Mojo programs can be run as scripts or compiled into high-performance executables. The `print()` function uses Mojo's built-in formatting to output text to the standard output.

```mojo
def main():
    print("Hello Mojo!")
```
