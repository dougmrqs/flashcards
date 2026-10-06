---
title: Python
description: CPython internals, idioms and the language's sharp edges.
icon: 🐍
order: 2
---

## What is the GIL?
The **Global Interpreter Lock** in CPython lets only one thread execute Python bytecode at a time. Threads still help for I/O-bound work, because the GIL is released while blocking on I/O, but they don't speed up CPU-bound pure-Python code. The usual options for CPU-bound work are `multiprocessing`, C extensions that release the GIL, or the free-threaded build without a GIL (PEP 703). That build was experimental in 3.13 and has been officially supported but optional since 3.14 (`python3.14t`).

## Mutable default arguments
Default values are evaluated **once**, when the `def` statement runs, not on every call. So `def f(items=[])` shares one list across all calls, and appends pile up. The idiom is `def f(items=None): items = [] if items is None else items`. The same applies to dicts, sets and any other mutable object.

## `is` vs `==`
`==` compares **values** via `__eq__`. `is` compares **identity**, meaning the same object in memory. Use `is` only for singletons such as `None`, `True`, `False` and sentinels. Small ints (−5 to 256) and some strings are cached, so `is` may *appear* to work for them, but that's an implementation detail.

## What is the LEGB rule?
The order in which names are resolved: **L**ocal, **E**nclosing (outer functions), **G**lobal (module) and **B**uiltins. Assigning to a name anywhere in a function makes it local for the *entire* function, which is the cause of `UnboundLocalError`. Use `nonlocal` to rebind a variable of the enclosing function and `global` for a module-level one.

## Late-binding closures
Closures look up variables when they're **called**, not when they're defined. `[lambda: i for i in range(3)]` produces three functions that all return `2`. To capture the current value, bind it as a default argument (`lambda i=i: i`) or use `functools.partial`.

## What is a generator?
A function containing `yield`. Calling it returns a lazy iterator, and execution pauses at each `yield` and resumes on `next()`. Generators use O(1) memory for arbitrarily long sequences and can be chained into pipelines. Generator expressions, written `(x for x in xs)`, are the inline form. `yield from` delegates to a sub-generator.

## What is a decorator?
A callable that takes a function (or class) and returns a replacement, applied with `@decorator` above the `def`. `@d def f` is just `f = d(f)`. Use `functools.wraps` inside the wrapper so the original function's name, docstring and signature are preserved. Decorators that take arguments need an extra outer layer: a function that returns the decorator.

## What is a context manager?
An object with `__enter__` and `__exit__`, used through `with`. It guarantees cleanup (closing a file, releasing a lock, rolling back a transaction) even when an exception is raised. `__exit__` receives the exception and can suppress it by returning `True`. `contextlib.contextmanager` turns a generator with a single `yield` into a context manager.

## What are dunder methods?
"Double underscore" methods such as `__init__`, `__repr__`, `__eq__`, `__hash__`, `__len__`, `__iter__` and `__getitem__`. Python calls them to implement built-in syntax and protocols, so `len(x)` calls `x.__len__()`. Implementing them makes your objects behave like built-ins. If you define `__eq__` without `__hash__`, instances become **unhashable**.

## What is a descriptor?
An object that defines `__get__`, `__set__` or `__delete__` and lives as a class attribute. It controls attribute access on instances. `property`, `staticmethod`, `classmethod`, bound methods and `__slots__` are all built on descriptors. **Data descriptors** (those with `__set__`) take precedence over the instance `__dict__`, while non-data descriptors don't.

## What is the MRO?
The **Method Resolution Order**: the sequence of classes Python searches for an attribute, computed with the C3 linearization algorithm. It guarantees that every class appears before its parents and that the order of base classes is respected. `super()` follows the MRO of the instance's class, not simply "the parent class", which is what makes cooperative multiple inheritance work. Inspect it with `Cls.__mro__`.

## What does `__slots__` do?
It declares a fixed set of instance attributes and removes the per-instance `__dict__`, which cuts memory use and speeds up attribute access a little. The trade-off is that you can't add attributes that aren't listed, and inheritance requires every class in the chain to cooperate. It's useful when you create millions of small objects.

## What is a metaclass?
The class of a class. `type` is the default metaclass. A metaclass controls how a class is created (`__new__`/`__init__` running on the class body), which lets you register, validate or rewrite classes. Frameworks like Django's ORM use them. `__init_subclass__` and class decorators cover most use cases more simply.

## How does `asyncio` work?
A single-threaded event loop runs **coroutines** (`async def`). At each `await` a coroutine hands control back to the loop, which resumes whichever coroutine has I/O ready. That makes it great for many concurrent network connections, but any blocking call (`time.sleep`, synchronous `requests`, heavy CPU work) stalls *every* task. Offload those with `asyncio.to_thread` or `run_in_executor`.

## Coroutine vs Task in asyncio
Calling an `async def` function only creates a **coroutine object**. Nothing runs until it is awaited. Wrapping it with `asyncio.create_task()` schedules it to run concurrently right away. Keep a reference to the task, because the loop holds only weak references and an unreferenced task can be garbage-collected. `TaskGroup` (3.11+) gives structured concurrency.

## How does CPython manage memory?
Mainly through **reference counting**: an object is freed as soon as its refcount drops to zero, which makes destruction deterministic. A separate **generational cycle collector** (`gc` module) finds reference cycles that refcounting alone would leak. Small objects come from the `pymalloc` arena allocator, so freed memory isn't always returned to the OS.

## Shallow vs deep copy in Python
Assignment never copies; it binds another name to the same object. `copy.copy`, `list(x)`, `x[:]` and `dict(x)` make **shallow** copies: a new container holding the same inner objects. `copy.deepcopy` recursively copies the whole structure, handling cycles through a memo dict. `[[0] * 3] * 3` creates three references to the *same* inner list.

## Why must dict keys be hashable?
Dicts and sets are hash tables. A key's `__hash__` picks its bucket and `__eq__` resolves collisions, so the hash must stay stable for as long as the key is stored, which in practice means immutable. Lists and dicts are unhashable, and tuples are hashable only if all their elements are. Objects that compare equal must have equal hashes. Dicts have preserved insertion order since 3.7.

## What are `*args` and `**kwargs`?
`*args` collects extra positional arguments into a tuple and `**kwargs` collects extra keyword arguments into a dict. At a call site, `*` and `**` unpack sequences and mappings into arguments. A bare `*` in a signature makes the following parameters keyword-only, and `/` makes the preceding ones positional-only.

## What are type hints actually for?
Annotations are **not enforced at runtime**. Python stores them and ignores them. Static checkers such as mypy and pyright, IDEs, and libraries like Pydantic and FastAPI read them. `typing.Protocol` gives structural ("duck") typing. `from __future__ import annotations`, and the lazy annotations of 3.14, defer evaluation, which avoids forward-reference errors.

## What is a virtual environment?
An isolated directory with its own interpreter link and `site-packages`, so each project gets its own dependency versions instead of polluting the system Python. Create one with `python -m venv .venv`, or use tools like `uv` and `poetry` that manage them for you. Activating it only adjusts `PATH`; nothing magical happens.

## `dataclass` vs `NamedTuple` vs Pydantic
`@dataclass` generates `__init__`, `__repr__` and `__eq__` for plain mutable classes, with optional `frozen=True` and `slots=True`. `NamedTuple` creates immutable, tuple-compatible records that support indexing and unpacking. **Pydantic** models validate and coerce data at runtime from type hints, which suits API boundaries. None of the standard-library options validate types.

## What does `if __name__ == "__main__":` do?
When a file runs as a script, its `__name__` is `"__main__"`. When it's imported, `__name__` is the module's name. The guard runs code only when the file is executed directly, so importing the module doesn't trigger side effects. It's also **required** on platforms that use `spawn` with `multiprocessing`, which re-imports the main module in each child process.

## EAFP vs LBYL
**E**asier to **A**sk **F**orgiveness than **P**ermission (`try: d[k] except KeyError:`) is idiomatic Python. **L**ook **B**efore **Y**ou **L**eap (`if k in d:`) checks first. EAFP avoids race conditions between the check and the use (for example, a file deleted after an `exists()` check), and it's fast when the exception is rare.

## What is the walrus operator?
`:=` is an **assignment expression** (3.8+) that assigns and returns a value inside an expression. The classic uses are `while (chunk := f.read(4096)):`, and reusing a computed value inside a comprehension filter (`[y for x in xs if (y := f(x))]`). It can't be used as a plain top-level statement without parentheses.
