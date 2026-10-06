---
title: JavaScript
description: Runtime model, language quirks and the parts of JS that surprise people.
icon: ⚡
order: 1
---

## What is the event loop?
The mechanism that lets single-threaded JavaScript handle async work without blocking. Synchronous code runs on the **call stack**. When the stack is empty, the loop first drains the entire **microtask queue** (Promise callbacks, `queueMicrotask`), then may render, then takes one **macrotask** (timers, I/O, UI events) and repeats. Long synchronous work blocks everything, including rendering.

## Microtasks vs macrotasks
**Microtasks** (Promise reactions, `queueMicrotask`, `MutationObserver`) run right after the current script finishes and before anything else, and the queue is drained completely. **Macrotasks** (`setTimeout`, `setInterval`, I/O, events) run one per loop iteration. So `Promise.resolve().then(a); setTimeout(b)` always runs `a` before `b`. A microtask that keeps scheduling more microtasks can starve rendering.

## What is hoisting?
Declarations are processed before code runs. `var` declarations are hoisted and initialized to `undefined`. Function declarations are hoisted along with their body, so they can be called before they appear in the source. `let`, `const` and `class` are hoisted too, but they stay uninitialized until their declaration line runs (see the Temporal Dead Zone).

## What is the Temporal Dead Zone?
The stretch between entering a scope and the line where a `let`/`const`/`class` binding is declared. Accessing the binding there throws a `ReferenceError`, even though the name is known to the scope. That's why `typeof x` can throw for a `let x` declared further down in the block, while for an undeclared name it safely returns `"undefined"`.

## What is a closure?
A function bundled with references to the variables of the scope it was created in. The inner function keeps those variables alive and can read and change them after the outer function has returned. Closures are the basis of private state, partial application and callbacks, and of the classic bug where every callback in a `var` loop sees the final value of `i`.

## How does `this` get its value?
It depends on how a function is called, not where it is defined. `obj.f()` sets `this` to `obj`. A bare `f()` gives `undefined` in strict mode (the global object in sloppy mode). `new F()` binds `this` to the new object, and `call`/`apply`/`bind` set it explicitly. **Arrow functions** have no `this` of their own and take it from the enclosing scope, which is why they're the usual choice for callbacks.

## What is prototypal inheritance?
Every object has an internal `[[Prototype]]` link to another object. When a property lookup misses, it walks up this **prototype chain** until it finds the property or reaches `null`. `class` syntax is mostly sugar over this mechanism: methods live on `Constructor.prototype`, and instances delegate to that object.

## `==` vs `===`
`===` compares without type conversion. `==` applies the **Abstract Equality** coercion rules, which give results like `0 == ''`, `'0' == false` and `null == undefined` all being `true`, while `NaN == NaN` is `false`. Use `===` by default. The one common idiom for `==` is `x == null`, which matches both `null` and `undefined`.

## What is type coercion?
JS implicitly converts values when operators expect a particular type. `+` concatenates if either operand is a string (`1 + '2'` is `'12'`), while `-` converts to numbers (`'3' - 1` is `2`). Objects go through `ToPrimitive` (`valueOf`, then `toString`), which is why `[] + {}` gives `'[object Object]'`. Truthiness has 8 falsy values: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` and `NaN`.

## `null` vs `undefined`
`undefined` means "no value assigned": uninitialized variables, missing properties and arguments, and functions without a `return`. `null` is an explicit "empty" value that a programmer sets on purpose. `typeof null === 'object'` is a historical bug that was never fixed. `??` and `?.` treat both values as nullish.

## `??` vs `||`
`a || b` returns `b` whenever `a` is **falsy**, which replaces valid values like `0`, `''` and `false`. `a ?? b` returns `b` only when `a` is `null` or `undefined`. Use `??` for defaults when `0` or an empty string are legitimate values, e.g. `const port = config.port ?? 3000`.

## What does `async`/`await` actually do?
An `async` function always returns a Promise. `await` pauses the function and schedules the rest of it as a microtask once the awaited Promise settles, and the thread is free to do other work in the meantime. It is syntax over Promises, not threads. Sequential `await`s in a loop run one after another, so use `Promise.all` to run independent work concurrently.

## `Promise.all` vs `allSettled` vs `race` vs `any`
`all` resolves with every result, or rejects as soon as **one** rejects. `allSettled` always waits for all of them and reports each outcome. `race` settles with whichever promise settles first, success or failure. `any` resolves with the first **success** and rejects with an `AggregateError` only if all of them fail. None of these cancel the losing operations.

## What is an unhandled promise rejection?
A Promise that rejects with no `.catch` or `try/await` handling it by the end of the microtask checkpoint. Browsers log it and fire an `unhandledrejection` event. Node.js (since v15) **crashes the process** by default. A common cause is a floating promise: calling an async function without awaiting or returning its result.

## Shallow vs deep copy
Spread (`{...obj}`, `[...arr]`) and `Object.assign` copy only the top level, so nested objects are still shared by reference. `structuredClone(value)` makes a real deep copy and handles `Map`, `Set`, `Date` and cycles, but not functions, DOM nodes or class prototypes. `JSON.parse(JSON.stringify(x))` drops `undefined`, functions and Dates, so avoid it for deep copies.

## `Map` vs plain object
`Map` accepts keys of any type (objects included), keeps insertion order, has `.size`, and is optimized for frequent adds and deletes. Plain objects only support string or symbol keys, inherit from `Object.prototype` (so a `"__proto__"` key can be dangerous), and are better for fixed record shapes and JSON. Use `Map` for dictionaries keyed by user data.

## What are `WeakMap` and `WeakRef`?
A `WeakMap` holds its keys (which must be objects) **weakly**: once nothing else references a key, the entry can be garbage collected. That makes it ideal for attaching metadata or caches to objects without leaking memory. It cannot be iterated. `WeakRef` holds a weak reference to a single object, and `FinalizationRegistry` runs callbacks after collection. GC timing is not deterministic.

## What is a Symbol?
A primitive whose value is always unique, even when two have the same description. Symbols are used as property keys that cannot collide, and they're skipped by `for…in` and `JSON.stringify`. **Well-known symbols** such as `Symbol.iterator`, `Symbol.asyncIterator` and `Symbol.toPrimitive` let objects hook into language behavior like `for…of` and coercion.

## What are iterators and generators?
An **iterable** has a `[Symbol.iterator]()` method that returns an iterator whose `next()` yields `{ value, done }`. `for…of`, spread and destructuring all consume this protocol. A **generator** (`function*`) is a function that can pause at each `yield`, which makes lazy sequences and custom iterables short to write. `async function*` together with `for await` handles async streams.

## ES modules vs CommonJS
**ESM** (`import`/`export`) is static: imports are resolved before any code runs, which enables tree-shaking. Bindings are live, loading is asynchronous, and top-level `await` is allowed. **CommonJS** (`require`/`module.exports`) runs synchronously at call time and copies values. In Node, ESM can import CJS. Recent Node versions can also `require()` a synchronous ESM graph, but not one that uses top-level `await`.

## What is strict mode?
An opt-in (`'use strict'`) and stricter variant of JS that turns silent errors into thrown ones. Assigning to undeclared variables throws, `this` is `undefined` in plain function calls, `with` is forbidden, and duplicate parameter names are errors. ES modules and class bodies are **always** strict.

## What does `Array.prototype.sort` do by default?
Without a comparator, it converts elements to **strings** and sorts by UTF-16 code units, so `[10, 9, 1].sort()` gives `[1, 10, 9]`. It also sorts **in place** and returns the same array. Pass `(a, b) => a - b` for numbers, use `localeCompare` or `Intl.Collator` for human text, and use `toSorted()` for a non-mutating copy. The sort has been guaranteed stable since ES2019.

## What is debouncing vs throttling?
**Debounce** waits until calls have stopped for N ms, then runs once. It suits search-as-you-type or saving after the user stops editing. **Throttle** runs at most once every N ms during a continuous stream of calls, which suits scroll or resize handlers. Both are built with closures and timers and reduce work triggered by noisy events.

## What are Web Workers?
Real background threads in the browser, each with its own event loop and global scope and no DOM access. They talk to the main thread with `postMessage`, which copies data with the structured clone algorithm, or by transferring ownership of `ArrayBuffer`s. They keep CPU-heavy work (parsing, image processing) from freezing the UI. `SharedArrayBuffer` plus `Atomics` allows shared memory.

## What is tree-shaking?
Dead-code elimination by bundlers. Unused exports are dropped from the final bundle. It relies on the **static structure of ES modules**, and code with side effects at import time can't be safely removed unless the package declares `"sideEffects": false`. CommonJS and dynamic `require` largely defeat it.
