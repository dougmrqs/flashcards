---
title: Anti-patterns
description: Recognizable traps, why they hurt and how to get out
icon: 🚫
order: 6
---

## God object
One class or module that **knows and does too much**, such as a `Manager` or `Utils` that every feature touches. It becomes a merge-conflict magnet, it's hard to test, and every change risks unrelated behavior. The fix is to extract cohesive responsibilities into smaller classes along the lines of change (SRP), usually one seam at a time.

## Shotgun surgery
When a single logical change forces **small edits across many files**. Adding a field might mean touching the DTO, three mappers, two validators and the UI. It signals that one concept is scattered. The fix is to move the related behavior together (Move Method/Field) so that one change lives in one place. It's the opposite symptom of a god object.

## Divergent change
One module **changes for many unrelated reasons**; you edit the same class for database tweaks, pricing rules and report formatting. That's a sign it mixes several responsibilities, and changes for one concern risk breaking the others. Split the class by reason for change. Shotgun surgery is the mirror-image symptom.

## Primitive obsession
Using raw strings, numbers and booleans for domain concepts: an email as a `string`, money as a `float`, a status as an `int`. Validation gets duplicated everywhere, and nothing stops you passing a user ID where an order ID belongs. The fix is small **value objects** or branded types that validate once and carry behavior.

## Stringly typed code
Representing structured data or choices as **free-form strings**: `"ADMIN,EDITOR"` role lists, `type: "creditcard"` flags, or JSON blobs passed around as text. Typos compile fine and fail at runtime, refactors miss usages, and nothing documents the valid values. Use enums, union types, proper data structures and parse-at-the-boundary.

## Magic numbers and strings
Unexplained literals in logic, such as `if (status === 3)` or `timeout = 86400000`. Readers can't tell what they mean, and when the value changes, every copy has to be found. Replace them with **named constants** or enums (`OrderStatus.Shipped`, `ONE_DAY_MS`), defined once next to the concept they describe.

## Boolean trap
A boolean parameter whose meaning is invisible at the call site: `render(true, false)` or `createUser(name, true)`. Readers must jump to the definition, and adding more flags multiplies combinations. Use **named options** (`{ sendWelcomeEmail: true }`), enums, or two clearly named functions instead of a flag that switches behavior.

## Feature envy
A method that is **more interested in another object's data** than its own, calling `order.getCustomer().getAddress().getZip()` to compute something about the order's customer. It means the behavior is in the wrong place. Move the method (or part of it) to the class that owns the data: "tell, don't ask".

## Anemic domain model
Domain objects that are **just bags of getters and setters**, with all business rules living in service classes. It looks like OOP but is procedural code, so invariants can be bypassed by anyone with a setter. Move behavior and validation into the entities and value objects, and make invalid states impossible to construct.

## Premature optimization
Optimizing code **before measuring** where time is actually spent. Knuth called it "the root of all evil (or at least most of it)". You get complexity, bugs and harder-to-change code, usually in a path that isn't the bottleneck. Write clear code first, profile real workloads, then optimize the measured hot spots. Sound architecture choices up front don't count.

## Golden hammer
"If all you have is a hammer, everything looks like a nail": forcing **one familiar tool or technology onto every problem**, such as Kafka for a simple job queue, microservices for a three-person app, or regex for parsing HTML. It produces needless complexity and poor fits. Choose tools by the problem's constraints, and keep learning alternatives.

## Cargo cult programming
Copying code, rituals or architecture **without understanding why they exist**: pasting StackOverflow snippets, adding config "because the template had it", or adopting a big company's process at startup scale. It brings their costs without their benefits and makes the code hard to reason about. Ask what problem each piece solves, and remove the ones that solve nothing.

## Lava flow
**Dead or half-finished code that hardened** into the codebase: experiments, unused branches and "don't touch, might be needed" modules nobody understands anymore. It confuses readers, slows builds, and gets defensively maintained forever. Delete it. Version control remembers, and tests and coverage tools show what's actually used.

## Big ball of mud
A system with **no discernible architecture**: everything depends on everything, boundaries were never enforced, and it grew by expedient patches. Each change is risky and slow. Recovery is incremental: add characterization tests, carve out modules with clear interfaces, and use the strangler-fig approach rather than a big-bang rewrite.

## Spaghetti code
Code with **tangled, unstructured control flow**: deeply nested conditionals, jumps, flags that steer execution far away, and long functions doing many things. It's hard to follow and hard to change safely. Fix it with guard clauses, extracting well-named functions, and replacing flag-driven branching with polymorphism or explicit state machines.

## Copy-paste programming
Duplicating code blocks instead of abstracting the shared knowledge. Bug fixes must then be applied in N places, and in practice they're applied in N−1. The fix is to extract the shared function or module **once the duplication represents the same knowledge**. Similar-looking code that changes for different reasons can stay separate.

## Distributed monolith
Services that are deployed separately but **tightly coupled**: they must be released together, share a database, or chain synchronous calls for every request. You pay the costs of distribution (network failures, latency, operational overhead) without the benefit of independence. The fix is to redraw boundaries around business capabilities with owned data, or merge back into a modular monolith.

## Speculative generality
Abstractions, hooks, parameters and plugin systems built **"in case we need it someday"**: an interface with one implementation, a config option nobody sets, a framework inside the app. It adds indirection and maintenance cost for imagined requirements. Inline or remove it (YAGNI), and add flexibility when a real second use case appears.

## Leaky abstraction
An abstraction that **forces its users to know the details it was meant to hide**. Examples are an ORM where you must understand the generated SQL to avoid N+1 queries, or a "simple" file API that behaves differently on network drives. Joel Spolsky's law says all non-trivial abstractions leak to some degree. Document the leaks and give escape hatches.

## Poltergeist
A short-lived class whose only job is to **invoke methods on other classes and then vanish**, such as a `ControllerHelper` that's created, calls two services and is discarded. It adds indirection with no state or responsibility of its own. Remove it and move its few lines to the caller or the object that actually owns the behavior.

## Sequential coupling
A class that requires its methods to be **called in a specific order** (`init()`, then `configure()`, then `start()`), and fails in confusing ways otherwise. Callers must memorize hidden rules. Enforce the order with constructors that produce ready-to-use objects, builders, or the type system (each step returns the next stage's type).

## Exception swallowing
Catching errors and **silently ignoring them**: `catch (e) {}` or logging and continuing as if nothing happened. Failures become invisible, data gets corrupted quietly, and debugging is miserable. Only catch what you can actually handle. Otherwise let it propagate, or rethrow with context, and fail loudly at a well-defined boundary.

## Not Invented Here (NIH)
Rejecting proven external solutions and **rebuilding things in-house** (your own crypto, ORM, date library or auth system) because "ours will fit better". It costs time, misses years of hardening, and creates code only your team can maintain. Build what's core to your business, and adopt well-maintained libraries for the rest.

## Inner-platform effect
Building a system so configurable that it becomes a **poor replica of the platform it runs on**: a "flexible" rules engine with its own expression language, or an EAV schema that reimplements a database inside a database. It's slower, less safe and harder to use than the real thing. Use the host language and database directly.

## Hardcoded configuration
Embedding environment-specific values such as URLs, credentials and feature toggles **directly in source code**. Every environment change needs a code change and deploy, and secrets leak into version control. Follow the 12-factor approach: read configuration from the environment or a secrets manager, validated at startup.
