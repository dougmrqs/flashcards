---
title: Architecture
description: Distributed systems and the big structural decisions behind software
icon: 🏛️
order: 4
---

## What is the CAP theorem?
In a distributed data store, when a **network partition** happens you must choose between **consistency** (every read sees the latest write or errors) and **availability** (every request gets a non-error response). You can't give up partition tolerance on a real network, so the real choice is CP vs AP during a partition. It says nothing about normal operation; see PACELC for that.

## What does PACELC add to CAP?
PACELC: if there's a **P**artition, choose **A**vailability or **C**onsistency; **E**lse, in normal operation, choose **L**atency or **C**onsistency. It captures that even without failures, strong consistency costs latency because replicas must coordinate. DynamoDB and Cassandra are typically PA/EL; Spanner and traditional relational setups lean PC/EC.

## What is eventual consistency?
A guarantee that if no new writes happen, all replicas will **eventually** converge to the same value. In the meantime, readers may see stale or different data depending on which replica they hit. It enables high availability and low latency, but applications must tolerate anomalies, often with session guarantees like read-your-writes or with conflict resolution (last-write-wins, CRDTs).

## What is CQRS?
**Command Query Responsibility Segregation**: use separate models for writes (commands that change state and enforce invariants) and reads (queries shaped for the screens that need them). The read side can be denormalized, cached or stored in a different database and is often updated asynchronously, so it may lag. It pays off for complex domains or very different read/write loads; for simple CRUD it's overhead.

## What is event sourcing?
Instead of storing the current state, store an **append-only log of domain events** (`OrderPlaced`, `ItemAdded`) and derive state by replaying them. You get a full audit trail, the ability to rebuild new projections and to answer "what was the state at time T?". Costs: event schema versioning, snapshots for long streams, and eventual consistency for read models. Often paired with CQRS.

## Hexagonal architecture (ports and adapters)
Put the domain logic at the center with no dependencies on frameworks, databases or UI. The core defines **ports** (interfaces it needs or offers), and the outside world plugs in through **adapters** (an HTTP controller, a Postgres repository, a fake for tests). Dependencies point inward. Clean Architecture and Onion Architecture are close variants of the same idea.

## Microservices vs monolith
A **monolith** is deployed as one unit: simple to develop, test and run, with in-process calls and single transactions. **Microservices** split the system into independently deployable services owning their data, letting teams scale and ship separately, at the price of network failures, distributed transactions, observability and ops overhead. A well-modularized monolith is usually the better starting point.

## What is a modular monolith?
A single deployable application whose code is split into modules with **explicit boundaries**: each module owns its data and exposes a narrow public API, and others can't reach into its internals. You get much of the organizational clarity of microservices without network calls or distributed transactions, and a clean module can later be extracted into a service if it needs to scale independently.

## What is idempotency and why does it matter?
An operation is idempotent if performing it multiple times has the same effect as once. Networks force retries, and a retried non-idempotent request (charge a card) can duplicate side effects. APIs handle this with an **idempotency key**: the client sends a unique ID, the server stores the result and returns it for repeats. `PUT` and `DELETE` are idempotent by definition in HTTP; `POST` isn't.

## Delivery semantics: at-most-once, at-least-once, exactly-once
**At-most-once**: send without retry; messages may be lost. **At-least-once**: retry until acknowledged; messages may be duplicated. **Exactly-once** delivery over an unreliable network is impossible in general; what systems offer is **exactly-once processing**, usually at-least-once delivery plus idempotent consumers or transactional deduplication.

## What is backpressure?
A mechanism for a slow consumer to signal a fast producer to **slow down**, instead of buffering without bound until memory runs out or latency explodes. Forms include bounded queues that block or reject, TCP flow control, pull-based streams (the consumer requests `n` items), and HTTP `429`/`503` responses. Without it, overload in one component cascades through the system.

## What is the circuit breaker pattern?
A wrapper around calls to a dependency that tracks failures. **Closed**: calls pass through. After too many failures it trips **open**: calls fail fast without hitting the dependency, giving it time to recover and protecting callers' threads. After a timeout it goes **half-open** and lets a few trial calls through; success closes it, failure opens it again.

## What is the saga pattern?
A way to keep data consistent across services without a distributed transaction. A saga is a sequence of local transactions, each publishing an event or command for the next; if a step fails, previously completed steps are undone by **compensating actions** (refund the payment, release the stock). It can be **choreographed** (services react to events) or **orchestrated** (a coordinator drives the steps).

## What is the transactional outbox?
Solves the **dual-write problem**: updating your database and publishing a message can't be atomic, so a crash between them loses or invents events. Instead, write the event into an `outbox` table in the **same transaction** as the business change. A separate relay (polling or change data capture) then publishes outbox rows to the broker, giving at-least-once delivery.

## What is the twelve-factor app?
A methodology for building cloud-friendly services. Key points: config in **environment variables**, **stateless processes** with state in backing services, backing services as attached resources, logs written to **stdout** as event streams, strict separation of build/release/run, fast startup and graceful shutdown (disposability), and dev/prod parity. It's the foundation of most container platforms' assumptions.

## Horizontal vs vertical scaling
**Vertical scaling** (scale up) means a bigger machine: more CPU, RAM, faster disks. It's simple but has a hard ceiling and a single point of failure. **Horizontal scaling** (scale out) means more machines behind a load balancer; it scales further and adds redundancy but requires stateless services or partitioned state, and brings distributed-systems problems.

## What is a stateless service?
A service that keeps no client-specific state in its own memory between requests; sessions, uploads and caches live in external stores (database, Redis, object storage). Any instance can serve any request, so you can add, remove or restart instances freely and load-balance without sticky sessions. "Stateless" doesn't mean no state, just that state isn't tied to an instance.

## What is a load balancer, L4 vs L7?
A load balancer spreads requests across backend instances and removes unhealthy ones. **Layer 4** balancers route by IP and port and forward TCP/UDP streams without inspecting content: very fast, protocol-agnostic. **Layer 7** balancers understand HTTP, so they can route by path, host or header, terminate TLS, rewrite requests and retry, at more CPU cost.

## Cache-aside vs write-through caching
**Cache-aside** (lazy loading): the app checks the cache, and on a miss reads the database and populates the cache; writes update the DB and invalidate the key. Simple, but the first read is slow and stale data is possible. **Write-through**: every write goes to the cache and the database together, keeping the cache fresh at the cost of write latency. **Write-behind** defers DB writes, risking loss.

## What is a cache stampede?
When a popular cache entry expires, many concurrent requests miss at once and all hit the database to rebuild it, potentially overloading it (also called the **thundering herd** or dogpile effect). Mitigations: a lock or **single-flight** so only one request recomputes, serving stale data while refreshing in the background, and adding **jitter** to TTLs so keys don't expire together.

## What is a service mesh?
An infrastructure layer that handles service-to-service traffic, usually via a **sidecar proxy** (like Envoy) next to each service instance. It provides mTLS, retries, timeouts, load balancing, traffic splitting and telemetry without changing application code. Istio and Linkerd are examples. It adds operational complexity and latency, so it's worth it mainly with many services.

## What is an API gateway?
A single entry point in front of many backend services that handles cross-cutting concerns: routing, authentication, rate limiting, TLS termination, request aggregation and protocol translation. It simplifies clients and centralizes policy, but can become a bottleneck or a dumping ground for business logic. The **BFF** (backend for frontend) variant has one gateway per client type.

## What is leader election?
A process by which nodes in a cluster agree on a single node to coordinate work (accept writes, run scheduled jobs). It's typically built on a consensus system (etcd, ZooKeeper, Raft) or on a **lease** with expiry. The hard part is split brain: an old leader that is paused may not know it lost leadership, so writes should carry a **fencing token** that storage can reject.

## What does a consensus algorithm like Raft do?
It lets a cluster of nodes agree on an ordered log of commands despite crashes, so every node applies the same state changes (replicated state machine). Raft elects a leader, which appends entries and commits them once a **majority** has stored them. With `2f + 1` nodes it tolerates `f` failures. Paxos solves the same problem; etcd and Consul use Raft.

## What is Conway's law?
"Organizations design systems that mirror their own communication structure." If three teams build a compiler, you get a three-pass compiler. The practical takeaway (the "inverse Conway maneuver") is to shape team boundaries around the architecture you want, since service boundaries drawn against team boundaries create constant cross-team coordination.

## What is a bounded context?
A Domain-Driven Design concept: an explicit boundary within which a domain model and its language are consistent. "Customer" means something different to billing than to support, and forcing one shared model creates a tangled mess. Each bounded context owns its model, and contexts integrate through well-defined contracts or translation layers. They're natural candidates for module or service boundaries.
