---
id: 'traits'
category: 'FOUNDATION'
title: '07. Traits'
subtitle: 'Static Polymorphism'
manual_link: 'https://docs.modular.com/mojo/manual/traits'
---

Traits define a set of required methods that a struct must implement. They are Mojo's tool for polymorphism and generic programming.

*   **Static Dispatch**: Traits are resolved at compile-time, ensuring zero runtime overhead.
*   **Generic Constraints**: You can write functions that work with any type that implements a specific trait using square brackets `[]`.

```mojo
trait Animal:
    def make_sound(self): ...

struct Dog(Animal):
    def __init__(out self):
        pass

    def make_sound(self):
        print("Woof!")

def bark[T: Animal](read a: T):
    a.make_sound()

def main():
    var d = Dog()
    bark(d)
```
