---
id: 'python-interop'
category: 'FOUNDATION'
title: '08. Python Interop'
subtitle: 'Seamless Access'
manual_link: 'https://docs.modular.com/mojo/manual/python'
---

Mojo provides 100% compatibility with the Python ecosystem. You can import any library and use it as if it were native Mojo code.

This allows you to keep high-level logic in Python-style while writing performance-critical kernels in low-level Mojo.

```mojo
from std.python import Python

def main() raises:
    var sys = Python.import_module("sys")
    print("Python version:", sys.version)
```
