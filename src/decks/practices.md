---
title: Engineering Practices
description: Testing, code quality and how teams ship.
icon: 🛠️
order: 12
---

## What is TDD?
**Test-Driven Development**: write a failing test first (**red**), write the simplest code that makes it pass (**green**), then clean up the code while the tests stay green (**refactor**), in short cycles. The tests act as a design tool. Writing the test first forces you to think about the API and makes the code testable by construction. The payoff is a fast, trustworthy regression suite and small, confident steps, not "more tests" for their own sake.

## What is BDD?
**Behavior-Driven Development** grew out of TDD. Behavior is described in business language as examples that developers, testers and domain experts agree on, usually as **Given** (context) / **When** (action) / **Then** (outcome) scenarios. Tools like Cucumber can run these scenarios as tests. Its main value is shared understanding before coding. Without real collaboration it collapses into verbose integration tests.

## What is cyclomatic complexity?
A metric (McCabe, 1976) that counts the **linearly independent paths** through a function: roughly `1 + number of decision points` (`if`, loops, `case`, `&&`, `||`, `catch`). It equals the number of test cases needed to cover every basis path, which is an upper bound on what full branch coverage needs. Values above about 10–15 usually signal a function that's hard to test and reason about, and a candidate for splitting.

## What is cognitive complexity?
A metric (introduced by SonarSource) that estimates how hard code is for a **human to read**, not how many paths it has. It adds a penalty for **nesting**, so an `if` inside a loop inside a `try` costs more than three flat `if`s. Constructs that read easily, like a `switch` or early returns, cost little. It often ranks functions differently from cyclomatic complexity and tracks "this is confusing" more closely.

## Test pyramid vs testing trophy
The **test pyramid** (Mike Cohn) says to write many fast unit tests, fewer integration tests and very few slow end-to-end tests. The **testing trophy** (Kent C. Dodds) moves the bulk to **integration tests**, on top of a base of static analysis (types, linters), arguing they give the most confidence per test. Both agree on the core idea: favor fast, reliable tests, and use E2E sparingly for critical flows.

## Test doubles: mocks, stubs, fakes and spies
Stand-ins for real dependencies in tests. A **stub** returns canned answers. A **fake** is a working but simplified implementation (an in-memory repository). A **spy** records how it was called so you can check afterwards. A **mock** is set up with expectations about the calls it should receive and fails the test if they don't happen. Heavy mocking couples tests to implementation details, so prefer fakes and real objects where they're cheap.

## What is the Arrange-Act-Assert pattern?
A structure for tests: **Arrange** the inputs and dependencies, **Act** by calling the one behavior under test, **Assert** on the outcome. BDD calls the same three parts Given/When/Then. Keeping the sections distinct, ideally with one act per test, makes tests readable at a glance and makes it obvious what failed. Multiple act/assert rounds in one test usually mean it should be split.

## What makes a test flaky?
A flaky test passes and fails on the same code. Common causes are timing and sleeps, async races, test ordering or shared state, real network or clock dependencies, random data without a fixed seed, and resource leaks between tests. Flaky tests destroy trust: people start re-running CI until it goes green and ignore real failures. Quarantine them quickly and fix the root cause; don't add retries.

## Why isn't 100% code coverage the goal?
Coverage measures which lines or branches **ran** during tests, not whether anything was **checked**. A test with no assertions can reach 100%. Chasing the number produces tests of trivial getters and tests coupled to implementation details. Coverage is useful in the other direction: **low** coverage reliably points to untested code. Many teams aim for a healthy range and focus on covering critical logic.

## What is mutation testing?
A way to test your tests. A tool makes small changes (**mutants**) to the code, such as flipping `>` to `>=`, replacing `+` with `-` or deleting a call, then runs the suite. If a test fails, the mutant is "killed". If everything still passes, the mutant "survived", which reveals a missing or weak assertion. The **mutation score** is a far better signal than coverage, but slower. Tools include Stryker, PIT and mutmut.

## What is property-based testing?
Instead of hand-picked examples, you state **properties** that must hold for all inputs, like `decode(encode(x)) == x` or "sorting is idempotent". The framework then generates hundreds of random inputs to try to break them. When it finds a failure it **shrinks** the input to a minimal counterexample. It finds edge cases humans don't think of. Tools include QuickCheck, Hypothesis and fast-check.

## What is contract testing?
Testing the agreement between a service **consumer** and **provider** in isolation, without spinning up both. In consumer-driven contracts (Pact), the consumer's tests record the requests it makes and the responses it expects, producing a contract. The provider's CI then verifies it can satisfy that contract. It catches breaking API changes early and replaces most slow, brittle cross-service end-to-end tests.

## What are snapshot tests, and their pitfalls?
Snapshot tests serialize output (a rendered component, a JSON response), save it, and fail when a later run differs. They're cheap to write and catch unintended changes. The pitfalls: large snapshots nobody reads, reviewers who blindly accept updates (`-u`), and snapshots that encode incidental details and break on harmless changes. Keep them small and focused, and treat a snapshot diff as code to review.

## What is regression testing?
Re-running existing tests after a change to confirm that behavior which worked before still works. The common practice is: **when you fix a bug, first write a test that reproduces it**, then fix the code. The bug then can't silently come back. An automated suite in CI is effectively a continuous regression test. Without one, every change risks re-breaking old fixes.

## Coupling and cohesion
**Coupling** is how much one module depends on the internals of others. **Cohesion** is how strongly the things inside one module belong together. The goal is **low coupling, high cohesion**: modules that do one coherent job and talk through narrow, stable interfaces. High coupling means changes ripple across the codebase. Low cohesion means "utility" modules nobody can name or own.

## What is technical debt?
Ward Cunningham's metaphor: shipping a quicker, less clean solution is like taking on debt. You move faster now but pay **interest** as extra effort on every future change, until you pay down the principal by refactoring. Debt can be deliberate and prudent ("ship now, clean up next sprint") or reckless and accidental. The problem isn't having debt, it's not tracking it and letting the interest compound.

## What is refactoring?
Changing the **internal structure** of code **without changing its observable behavior**, in small, safe steps (Martin Fowler). Examples include extract function, rename, inline variable and move method. It depends on a good test suite to prove behavior didn't change. Refactoring isn't rewriting, and it shouldn't be mixed with feature work in the same commit, so that each change is easy to review and revert.

## What is a code smell?
A surface symptom in code that *often* points to a deeper design problem: long methods, large classes, duplicated code, long parameter lists, feature envy, primitive obsession, shotgun surgery. The term comes from Kent Beck and Martin Fowler's *Refactoring*. A smell isn't a bug, and it isn't always wrong. It's a prompt to look closer, and each smell maps to well-known refactorings that remove it.

## What is the Boy Scout rule?
"Always leave the code better than you found it" (popularized by Robert C. Martin). When you touch a file for a feature or fix, make a small improvement nearby: rename an unclear variable, extract a function, delete dead code. Continuous small cleanups keep entropy in check without big "refactoring sprints". Keep these changes small and separate from the main change, so reviews stay easy.

## CI vs continuous delivery vs continuous deployment
**Continuous integration**: everyone merges to the main branch at least daily, and every merge is built and tested automatically. **Continuous delivery**: every change that passes the pipeline is *releasable*, and going to production is a business decision taken with one click. **Continuous deployment**: every passing change goes to production automatically, with no human gate. Each builds on the previous one.

## What is trunk-based development?
Developers integrate small changes into a single shared branch (**trunk**/`main`) at least daily. Branches are either absent or live for hours, not weeks. Unfinished work is hidden behind **feature flags** rather than kept on long-lived branches. It avoids painful merges and integration surprises, and research (DORA) links it to high delivery performance. It requires a solid automated test suite.

## What are feature flags?
Runtime switches that turn code paths on or off without deploying, separating **deploy** from **release**. Uses include hiding unfinished work on trunk, gradual rollouts to a percentage of users, A/B tests, per-customer enablement, and kill switches for risky features. The cost is that every flag doubles a code path. Stale flags become technical debt, so give each one an owner and remove it once it's fully rolled out.

## Blue-green vs canary deployments
**Blue-green**: run two identical production environments, deploy to the idle one (green), test it, then switch all traffic over at once. Rollback is just switching back. **Canary**: release the new version to a small slice of traffic (1%, then 10%…) and watch error rates and latency before widening it. A canary limits the blast radius of a bad release. Blue-green gives instant, all-or-nothing cutover and rollback.

## What is semantic versioning?
SemVer versions take the form `MAJOR.MINOR.PATCH`. Bump **MAJOR** for breaking changes to the public API, **MINOR** for backward-compatible features and **PATCH** for backward-compatible bug fixes. Versions `0.x` make no stability promises. Package managers rely on it: `^1.4.2` accepts any `1.x ≥ 1.4.2`, and `~1.4.2` accepts only `1.4.x`. It only works if maintainers are honest about what breaks.

## What are the DORA metrics?
Four measures of software delivery performance from the DevOps Research and Assessment program (*Accelerate*). **Deployment frequency** and **lead time for changes** measure throughput. **Change failure rate** and **time to restore service** measure stability. The key finding is that speed and stability aren't trade-offs: high performers are better at both. Use the metrics to improve the system, not to rank individuals.

## What is a blameless postmortem?
A written review after an incident that asks **what** happened and **why the system allowed it**, not **who** made the mistake. It assumes people acted reasonably given what they knew at the time. It covers a timeline, impact, contributing factors and concrete follow-up actions. Blame makes people hide information, and honest postmortems are how organizations actually learn and stop repeat incidents.

## What is a code review for?
Code review is mainly for **sharing knowledge and keeping the codebase coherent**: spreading context, catching design problems, keeping consistency and mentoring. Finding bugs is a side benefit; tests and linters should catch most of those. Small PRs get much better reviews than huge ones. Automate style and formatting checks, so humans can focus on correctness, design and readability.
