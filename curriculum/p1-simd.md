---
id: 'simd-power'
category: 'PROJECT'
title: 'SIMD Power'
subtitle: 'Vector Compute'
---

SIMD (Single Instruction, Multiple Data) is a hardware feature that allows a CPU to perform the same operation on multiple data points simultaneously.

This project demonstrates how Mojo maps directly to hardware vector registers for massive throughput.

```mojo
def main():
    var v = SIMD[DType.float32, 4](10.0, 20.0, 30.0, 40.0)
    var sum = v.reduce_add()
    print("SIMD Sum:", sum)
```
