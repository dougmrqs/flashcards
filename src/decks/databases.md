---
title: Databases
description: Storage engines, transactions, indexes and scaling data
icon: 🗄️
order: 9
---

## What does ACID stand for?
**Atomicity**: a transaction applies fully or not at all. **Consistency**: it moves the database from one valid state to another, respecting constraints. **Isolation**: concurrent transactions don't see each other's partial work (to a degree set by the isolation level). **Durability**: once committed, data survives crashes, usually via a write-ahead log flushed to disk.

## What is BASE?
An alternative philosophy to ACID used by many distributed NoSQL stores: **B**asically **A**vailable, **S**oft state, **E**ventual consistency. The system prioritizes staying available and partition-tolerant, allows replicas to diverge temporarily, and converges over time. It's a trade, not a defect: you gain scale and availability and push conflict handling into the application.

## How does a database index speed up queries?
An index is a separate data structure, usually a **B+ tree**, that keeps column values sorted with pointers to rows. Instead of scanning every row (`O(n)`), the database descends the tree in `O(log n)` and can also read ranges in order. The cost: extra storage and slower writes, since every insert, update and delete must also maintain each index.

## B-tree vs LSM-tree storage engines
**B-trees** update pages in place; reads are fast and predictable, but random writes cause write amplification (Postgres, MySQL InnoDB). **LSM-trees** buffer writes in memory, flush them as sorted immutable files and merge them later through **compaction**; writes are fast and sequential, but reads may check several files (mitigated by Bloom filters). Used by RocksDB, Cassandra and ScyllaDB.

## What is a composite index and why does column order matter?
An index on multiple columns, e.g. `(country, city)`, sorted by the first column, then the second within it. It can serve queries filtering on `country` or `country AND city`, but generally not on `city` alone: the **leftmost prefix rule**. Put equality-filtered columns before range-filtered ones, since a range on an earlier column stops later columns from narrowing the scan.

## What is a covering index?
An index that contains every column a query needs, so the database answers it from the index alone without fetching rows from the table (an **index-only scan**). You can add non-key columns with `INCLUDE` in Postgres and SQL Server. It can dramatically speed up hot queries, but each extra column makes the index bigger and writes costlier.

## What are transaction isolation levels?
SQL defines four, each preventing more anomalies. **Read Uncommitted**: dirty reads possible. **Read Committed**: see only committed data, but a re-read can change (non-repeatable read). **Repeatable Read**: rows you read stay the same, though new rows may appear (phantoms) in the standard definition. **Serializable**: equivalent to some serial order. Defaults differ: Postgres uses Read Committed, MySQL InnoDB Repeatable Read.

## What are dirty, non-repeatable and phantom reads?
**Dirty read**: you see another transaction's uncommitted change, which may roll back. **Non-repeatable read**: you read a row twice and get different values because someone committed an update in between. **Phantom read**: you run the same query twice and a new matching row appears because someone inserted it. Higher isolation levels rule these out progressively.

## What is MVCC?
**Multi-version concurrency control**: instead of locking rows for reads, the database keeps multiple versions of each row tagged with transaction IDs, and every transaction reads a consistent **snapshot**. Readers don't block writers and writers don't block readers. The cost is garbage: old versions must be cleaned up (Postgres `VACUUM`, InnoDB purge of undo logs).

## What is a write-ahead log (WAL)?
Before changing data pages, the database appends a description of the change to a sequential log and flushes it to disk. On a crash, it replays the log to redo committed work and undo uncommitted work, giving atomicity and durability while letting data pages be written lazily. The same log stream is often used for replication and change data capture.

## What is the N+1 query problem?
Fetching a list with one query, then running one more query **per item** for related data: 1 query for 100 posts plus 100 queries for their authors. It's common with ORM lazy loading and kills performance through round trips. Fix it with a join, a batched `WHERE id IN (...)` query, or the ORM's eager loading (`include`, `select_related`, `preload`).

## Partitioning vs sharding
**Partitioning** splits a large table into smaller pieces (by range, list or hash of a key), typically within one database server, so queries and maintenance touch less data. **Sharding** is partitioning across **multiple servers**, each holding a subset of the data, to scale writes and storage beyond one machine. Sharding adds cross-shard queries, rebalancing and distributed transactions.

## How do you choose a shard key?
Pick a key with **high cardinality** and even distribution so no shard becomes a hotspot, and that matches your access pattern so most queries hit a single shard (e.g. `tenant_id` for a SaaS app). A monotonically increasing key like a timestamp sends all new writes to one shard. Changing the shard key later is very expensive, so it's one of the most important early decisions.

## What is replication lag?
With asynchronous replication, replicas apply the primary's changes after a delay, from milliseconds to minutes under load. Reading from a replica right after writing to the primary can return stale data, so a user may not see their own update. Mitigations: read-your-writes routing (send a user's reads to the primary briefly after they write), or waiting until the replica has caught up to a given log position.

## Synchronous vs asynchronous replication
**Synchronous**: the primary waits for replicas to confirm a write before acknowledging the commit, so no acknowledged data is lost on failover, but every write pays network latency and stalls if a replica is down. **Asynchronous**: the primary commits immediately and ships changes later; faster and more available, but a failover can lose the most recent writes. Semi-sync waits for at least one.

## Optimistic vs pessimistic locking
**Pessimistic locking** takes a lock up front (`SELECT ... FOR UPDATE`) so others wait; safe under high contention but reduces concurrency and risks deadlocks. **Optimistic locking** reads freely and checks at write time, typically with a version column: `UPDATE ... SET version = version + 1 WHERE id = ? AND version = ?`. If zero rows changed, someone else won and you retry.

## What is a deadlock in a database?
Two transactions each hold a lock the other needs: A locks row 1 and wants row 2, while B locks row 2 and wants row 1. Neither can proceed. Databases detect the cycle and abort one transaction, which the application must retry. Reduce them by locking rows in a consistent order, keeping transactions short, and using appropriate indexes so fewer rows get locked.

## Normalization vs denormalization
**Normalization** organizes data so each fact is stored once (1NF, 2NF, 3NF...), avoiding update anomalies and keeping data consistent, at the cost of joins. **Denormalization** deliberately duplicates data (storing a customer's name on each order, precomputed counts) to make reads faster and simpler, accepting the burden of keeping copies in sync. OLTP leans normalized; analytics and read models lean denormalized.

## OLTP vs OLAP
**OLTP** (online transaction processing) handles many small, concurrent reads and writes of individual records: orders, logins, payments. Row-oriented databases like Postgres fit. **OLAP** (online analytical processing) runs fewer, heavy queries that aggregate over millions of rows. **Columnar** stores (ClickHouse, BigQuery, Snowflake) fit, since they read only needed columns and compress well.

## What is a columnar database?
A database that stores data **column by column** rather than row by row. A query summing one column over a billion rows reads only that column, and similar values stored together compress extremely well and suit vectorized execution. The tradeoff: inserting or updating single rows is expensive, so columnar stores excel at analytics, not transactional workloads.

## What is connection pooling and why is it needed?
Opening a database connection is expensive (TCP + TLS + authentication + server process or memory per connection), and databases handle only a limited number of concurrent connections well. A **pool** keeps a set of open connections that requests borrow and return. External poolers like **PgBouncer** let many app instances share a small number of real Postgres connections.

## What does EXPLAIN do?
`EXPLAIN` shows the **query plan** the optimizer chose: which indexes, join algorithms (nested loop, hash, merge) and scan types it'll use, with estimated costs and row counts. `EXPLAIN ANALYZE` actually runs the query and reports real timings and row counts. Large gaps between estimated and actual rows often point to stale statistics or a misleading query shape.

## What is change data capture (CDC)?
Streaming every insert, update and delete from a database to other systems by reading its **replication log** (Postgres WAL, MySQL binlog) rather than polling tables. Tools like Debezium turn changes into events on Kafka for search indexing, caches, data warehouses or other services. It's low-latency, doesn't require app changes, and captures deletes that polling misses.

## What is a soft delete and what does it cost?
Marking rows as deleted (`deleted_at` timestamp) instead of removing them, so data can be restored or audited. The costs: every query must remember to filter them out, unique constraints must account for deleted rows (partial indexes help), tables keep growing, and it may conflict with legal requirements to actually erase personal data.

## What is a query optimizer's cardinality estimate?
The optimizer's guess of how many rows each step of a plan will produce, based on table **statistics** (row counts, histograms, distinct values). These estimates drive every decision: index vs full scan, join order, join algorithm. When statistics are stale or columns are correlated, estimates go wrong and the optimizer picks a terrible plan. Running `ANALYZE` refreshes the statistics.
