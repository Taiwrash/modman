---
id: 'parallel-for'
category: 'PROJECT'
title: 'Parallel Processing'
subtitle: 'Multi-core Compute'
---

Mojo makes multi-threading easy. The `parallelize` algorithm distributes work across all available CPU cores automatically, bypassing the Global Interpreter Lock (GIL) found in Python.
```mojo
from std.algorithm import parallelize

def main():
    @parameter
    def worker(i: Int):
        print("Working on task:", i)

    parallelize[worker](10)
```
