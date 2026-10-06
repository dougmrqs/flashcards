---
title: Patterns
description: Design patterns and principles worth knowing by name
icon: 🧩
order: 5
---

## Single Responsibility Principle (SRP)
The "S" in SOLID: a module should have **one reason to change**, meaning it answers to one actor or concern. A class that formats invoices *and* emails them changes whenever either the layout or the mail provider changes. Splitting them keeps changes local and tests focused. It's about cohesion of change, not "do only one thing".

## Open/Closed Principle (OCP)
The "O" in SOLID: software entities should be **open for extension, closed for modification**. You add behavior by writing new code (a new strategy, plugin or subclass) instead of editing stable, tested code. In practice this means depending on abstractions at the points you expect variation, not making everything pluggable up front.

## Liskov Substitution Principle (LSP)
The "L" in SOLID: a subtype must be usable anywhere its base type is expected **without breaking correctness**. Subtypes may not strengthen preconditions, weaken postconditions or break invariants. The classic violation is `Square extends Rectangle`: setting the width silently changes the height, which breaks code that assumed the two are independent.

## Interface Segregation Principle (ISP)
The "I" in SOLID: clients shouldn't be forced to depend on methods they don't use. Prefer several small, role-specific interfaces (`Readable`, `Writable`) over one fat interface. Fat interfaces create needless coupling, stub implementations that throw "not supported", and recompiles or redeploys triggered by unrelated changes.

## Dependency Inversion Principle (DIP)
The "D" in SOLID: high-level policy shouldn't depend on low-level details; **both depend on abstractions**, and the abstraction is owned by the high-level side. Your `OrderService` depends on an `OrderRepository` interface it defines, and the Postgres adapter implements it. This makes the core testable and keeps infrastructure swappable.

## Dependency Injection
A technique where an object **receives its collaborators from outside** (constructor, setter or parameter) instead of creating them itself. It's the usual way to apply Dependency Inversion: tests pass fakes, and production wires real implementations. A DI container is optional; passing arguments by hand ("pure DI") is often enough.

## Composition over inheritance
The advice to build behavior by **combining objects that have capabilities** instead of inheriting from a class hierarchy. Inheritance couples the subclass to its parent's internals (the fragile base class problem) and fixes relationships at compile time. Composition lets you mix behaviors freely and swap them at runtime. Inheritance still fits genuine "is-a" relationships.

## Strategy pattern
Encapsulates a family of interchangeable algorithms behind a common interface and lets the caller pick one at runtime. Examples are pricing rules, compression codecs and sort comparators. It replaces growing `if/else` or `switch` chains on a "type" field. In languages with first-class functions, a strategy is often just a function you pass in.

## Observer pattern
A subject keeps a list of subscribers and **notifies them when its state changes**, so producers don't know who consumes their events. It's the basis of event emitters, DOM listeners and reactive UI. Watch for memory leaks from forgotten unsubscriptions, and for hard-to-trace control flow when observers trigger further events.

## Decorator pattern
Wraps an object in another object with the **same interface** that adds behavior before or after delegating, such as caching, logging, retries or authorization. Decorators stack (`new Logging(new Caching(repo))`) and avoid a subclass explosion for every combination. HTTP middleware is the same idea applied to request handlers.

## Adapter pattern
Converts one interface into another that the client expects, letting incompatible components work together without changing either. Wrapping a third-party payment SDK behind your own `PaymentGateway` interface is the textbook case. It also isolates vendor churn: when the SDK changes, only the adapter changes.

## Facade pattern
Provides a **simple, unified entry point** to a complex subsystem. For example, `VideoConverter.convert(file, 'mp4')` hides codecs, buffers and muxers. Unlike an adapter it doesn't match an existing interface; it defines a simpler one. Use it to reduce coupling to a subsystem, but don't let it grow into a god object.

## Factory Method and Abstract Factory
Creational patterns that **move object construction behind an interface**. A Factory Method lets subclasses or callers decide which concrete class to instantiate. An Abstract Factory creates *families* of related objects (for example, all widgets for a given UI theme) that must be used together. Both keep `new ConcreteThing()` out of business logic.

## Builder pattern
Constructs a complex object **step by step** through a fluent API, then produces it with `build()`. It avoids telescoping constructors with many optional parameters and can validate the whole object at the end. Examples include query builders, HTTP request builders and test-data builders. Languages with named or default arguments need it less.

## Singleton pattern
Guarantees a class has **exactly one instance** with a global access point. It's useful for truly unique resources, but it's often criticized: it's hidden global state, it couples callers to a concrete class, and it makes tests order-dependent. Prefer creating one instance at the composition root and injecting it.

## Command pattern
Turns a request into an **object** holding everything needed to perform it, for example `{ execute(), undo() }`. This allows queuing, logging, retrying, scheduling and undo/redo. Job queues, editor undo stacks and transactional scripts use it. Commands decouple *what* to do from *when* and *where* it runs.

## Template Method pattern
A base class defines the **skeleton of an algorithm** and lets subclasses override specific steps ("hooks") without changing the overall order. Frameworks use it heavily: you fill in `setUp()` or `handle()`, and the framework calls them. It's inheritance-based; Strategy is the composition-based alternative.

## Proxy pattern
A stand-in object with the **same interface** as the real one that controls access to it. Uses include lazy loading (virtual proxy), remote calls (remote proxy), access checks (protection proxy) and caching. ORMs' lazy-loaded relations and JS `Proxy` objects are everyday examples. The structure is like a decorator's, but the intent is controlling access rather than adding features.

## Repository pattern
Mediates between the domain and data storage, exposing a **collection-like interface** (`findById`, `add`, `remove`) for aggregates. Domain code stays free of SQL or ORM details and becomes easy to test with in-memory fakes. Don't just mirror every table: a repository per aggregate root, with domain-meaningful queries, is the intent.

## Unit of Work
Tracks every change made to objects during a business transaction and **commits them together**, in the correct order and inside one database transaction. ORMs implement it for you: Hibernate's Session, EF's DbContext and SQLAlchemy's Session. It pairs naturally with repositories and gives you atomicity across several aggregates' changes.

## Null Object pattern
Instead of returning `null`, return an object that implements the expected interface with **neutral, do-nothing behavior**, such as a `NoopLogger` or a `GuestUser`. Callers no longer need null checks scattered everywhere. Use it when "absence" has a sensible default behavior; when absence is an error, fail loudly instead.

## State pattern
An object delegates behavior to a **current state object** and swaps that object when its state changes. For example, a `Document` behaves differently in `Draft`, `Review` and `Published`. It replaces sprawling conditionals on a status field and makes the valid transitions explicit. Simpler cases can use an explicit state machine table instead.

## Chain of Responsibility
Passes a request along a **chain of handlers**, where each one handles it, passes it on, or both. Middleware pipelines (Express, ASP.NET), logging filters and approval workflows follow this shape. The sender doesn't know which handler will act, so handlers can be added, removed or reordered independently.

## Value Object
An object **defined by its attributes rather than an identity**, for example `Money(10, "EUR")` or `Email("a@b.com")`. Value objects are immutable, compared by value, and validate themselves on creation, so an invalid one can't exist. They're the main cure for primitive obsession and carry domain behavior such as `money.add(other)`.

## DRY, and the rule of three
**Don't Repeat Yourself** means every piece of *knowledge* should have one authoritative representation. It's about knowledge, not identical-looking code. Two snippets that look alike but change for different reasons should stay separate. The **rule of three** suggests waiting for the third duplication before abstracting, so you know what actually varies.

## YAGNI and KISS
**You Aren't Gonna Need It** means not building features or extension points until a real requirement appears; speculative generality costs effort now and makes changes harder later. **Keep It Simple** means preferring the most straightforward solution that works. Together they push back on over-engineering, while refactoring keeps the code ready to grow when needs arrive.
