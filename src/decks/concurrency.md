---
title: Concurrency
description: Threads, locks, async and the bugs that only show up under load.
icon: 🧵
order: 8
---

## Concurrency vs parallelism
**Concurrency** means structuring a program as multiple tasks whose execution overlaps in time, possibly interleaved on one core. **Parallelism** means actually running at the same instant on multiple cores. An async event loop is concurrent but not parallel. "Concurrency is about dealing with lots of things at once; parallelism is about doing lots of things at once" (Rob Pike).

## Process vs thread
A **process** has its own address space, so it's isolated, but creating it and communicating with it costs more (IPC). **Threads** live inside a process and share its memory, which makes communication cheap but requires synchronization. A crashing thread can take down the whole process, while a crashing process usually can't harm its siblings.

## What is a race condition?
The result depends on the timing or interleaving of concurrent operations. The classic case is **check-then-act** (`if not exists: create`) or **read-modify-write** (`count += 1`), where two threads read the same old value and one update is lost. Fix it with atomic operations, locks, or designs that avoid shared mutable state.

## Data race vs race condition
A **data race** is a specific low-level bug: two threads access the same memory without synchronization, and at least one access is a write. In C/C++ and Go it is undefined behavior or yields torn values. A **race condition** is the broader logic bug of timing-dependent results, and it can occur even with perfectly synchronized, data-race-free code.

## What is a deadlock?
Two or more threads each wait forever for a resource another one holds. It requires four **Coffman conditions**: mutual exclusion, hold-and-wait, no preemption and circular wait. The most practical prevention is to break circular wait by always acquiring locks in a **global consistent order**. Lock timeouts (`tryLock`) are another option.

## Livelock vs starvation
In a **livelock**, threads keep reacting to each other and changing state but make no progress, like two people repeatedly stepping aside in a hallway. Randomized backoff fixes it. **Starvation** is when a thread never gets the resource because others keep winning, for example under unfair locks or with low priority. Fair queuing or aging fixes that.

## Mutex vs semaphore
A **mutex** gives exclusive access to one owner at a time, and only the owner may unlock it. A **semaphore** is a counter that allows up to N concurrent holders: `acquire` decrements and blocks at 0, `release` increments. Semaphores are used to limit concurrency, for example "at most 10 outbound requests". A binary semaphore resembles a mutex but has no notion of ownership.

## What is a read-write lock?
A lock that allows **many concurrent readers or one exclusive writer**. It helps for read-heavy shared data. Watch out for writer starvation if readers keep arriving, and for higher overhead than a plain mutex under low contention. Upgrading a read lock to a write lock in place usually deadlocks.

## What is a condition variable?
A way for threads to sleep until some condition on shared state becomes true. It's always used together with a mutex: lock, check the condition **in a `while` loop**, and `wait()`, which atomically releases the lock and sleeps. The loop matters because of **spurious wakeups** and because another thread may consume the state first. Signal it after changing the state.

## What is an atomic operation?
An operation that appears indivisible to other threads. No one can observe it half-done. Hardware provides atomic load, store, swap, fetch-and-add and **compare-and-swap (CAS)**. Atomics are the building blocks of lock-free counters and data structures, and they're much cheaper than locks for simple shared counters.

## What is compare-and-swap (CAS)?
An atomic instruction: "if the value at address X is still A, set it to B; otherwise tell me it changed". Lock-free algorithms loop: read, compute, CAS, and retry on failure. A known problem is the **ABA problem**: the value changed from A to B and back to A, so CAS succeeds incorrectly. Tagged pointers or version counters solve it.

## What is a memory model?
The rules for when a write in one thread becomes visible to another. CPUs and compilers **reorder** instructions and cache values, so without synchronization one thread can see another's writes late or out of order. Locks, `volatile` (in Java), atomics, and acquire/release ordering create **happens-before** edges that guarantee visibility.

## What is false sharing?
Two threads write to *different* variables that happen to sit on the same CPU **cache line** (typically 64 bytes). Every write invalidates the line on the other core, so the line bounces between caches and performance drops even though there is no logical sharing. Fix it by padding or aligning hot per-thread data onto separate cache lines.

## Lock-free vs wait-free
**Lock-free**: at least one thread always makes progress; others may retry, but the system as a whole never stalls, even if a thread is paused. **Wait-free**: *every* thread completes in a bounded number of steps, which is stronger and rarer. Both avoid deadlocks and priority inversion, but they're hard to get right, so prefer proven library implementations.

## What is priority inversion?
A high-priority task waits for a lock held by a low-priority task, which is in turn preempted by medium-priority tasks, so the high-priority task effectively runs at low priority. It famously reset the Mars Pathfinder lander. The fix is **priority inheritance**: the lock holder temporarily inherits the waiter's priority.

## Thread pool
A fixed set of reusable worker threads that pull tasks from a queue. It avoids the cost of creating a thread per task and **bounds** concurrency so a burst of work can't exhaust memory or CPU. Size it for the workload: about the number of cores for CPU-bound work, more for blocking I/O. Submitting tasks that wait on other tasks in the same small pool can deadlock it.

## Green threads, coroutines and virtual threads
Lightweight tasks scheduled by the **runtime** in user space instead of the OS, and multiplexed onto a few OS threads (an M:N model). Goroutines, Java virtual threads, Erlang processes and Kotlin coroutines all fit here. Python's asyncio coroutines are also lightweight, but they run on a single thread. They're cheap enough to run millions of, which makes "one task per connection" practical, but blocking the underlying OS thread can stall many of them.

## Preemptive vs cooperative scheduling
**Preemptive**: the scheduler can interrupt a task at any time, as with OS threads, so a busy loop can't hog the CPU, but you must synchronize everywhere. **Cooperative**: tasks yield only at explicit points (`await`, `yield`), so state between yields is safe from interleaving, but one task that never yields starves all the others.

## What is the actor model?
Concurrency through isolated **actors** that each own their state and communicate only by sending asynchronous messages to mailboxes. An actor processes one message at a time, so its internal state needs no locks. Erlang/Elixir and Akka are built around it. It's a natural fit for distribution and supervision ("let it crash") hierarchies.

## What is CSP?
**Communicating Sequential Processes**: independent processes that synchronize and share data by passing messages over **channels** instead of sharing memory. It's the model behind Go's goroutines and channels ("Don't communicate by sharing memory; share memory by communicating"). Unlike actors, channels are first-class and anonymous, and unbuffered sends synchronize sender and receiver.

## Producer–consumer problem
Producers add work to a shared buffer and consumers remove it, which requires synchronization so that consumers wait while the buffer is empty and producers wait while it's full. A **bounded blocking queue** solves it, and most standard libraries provide one (`queue.Queue`, `BlockingQueue`, buffered channels). It decouples the rates of production and processing.

## What is thread safety?
Code is thread-safe if it behaves correctly when called from multiple threads at the same time, without extra synchronization by the caller. Common strategies are immutability, thread confinement (each thread owns its data), synchronization (locks or atomics), and concurrent collections. Note that calling two individually thread-safe methods in sequence is **not** atomic as a whole.

## Double-checked locking
An optimization for lazy initialization: check without the lock, then lock and check again before creating the object. It's subtly broken without proper memory ordering, because another thread may see a non-null reference to a **partially constructed** object. In Java the field must be `volatile`. Prefer language-provided lazy initialization (static holders, `sync.Once`, `std::call_once`).

## Amdahl's law
The speedup from parallelizing is limited by the **serial fraction** of the work: speedup ≤ 1 / (s + (1 − s)/N). If 10% is serial, no number of cores can make it more than 10× faster. It explains why removing serial bottlenecks such as locks and coordination often matters more than adding cores. **Gustafson's law** offers the counterpoint that larger problems parallelize better.
