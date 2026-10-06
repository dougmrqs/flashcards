---
title: Algorithms
description: Data structures, complexity and the techniques behind classic problems
icon: 🧮
order: 3
---

## What does Big-O notation actually describe?
An **upper bound on growth rate** as input size `n` tends to infinity, ignoring constants and lower-order terms. `O(n)` says runtime grows at most linearly; it says nothing about actual speed for small `n`. Big-Θ is a tight bound, Big-Ω a lower bound. It is usually quoted for the worst case, but you can state best, average or amortized bounds too.

## What is amortized analysis?
Averaging the cost of an operation over a **sequence** of operations rather than judging each one alone. A dynamic array that doubles capacity when full has an occasional `O(n)` copy, but across `n` appends the total work is `O(n)`, so each append is **amortized `O(1)`**. Unlike average-case analysis, no probability is involved: it's a guarantee about any sequence.

## Two pointers technique
Use two indices that move through a sequence, often from both ends toward each other or one chasing the other. On a sorted array you can find a pair summing to a target in `O(n)`: if the sum is too small move the left pointer right, too large move the right pointer left. It's also used for removing duplicates in place, merging sorted lists and detecting palindromes.

## Sliding window technique
Maintain a contiguous range `[left, right]` over an array or string and update an aggregate incrementally as the window grows on the right and shrinks on the left, instead of recomputing per window. It turns many `O(n²)` substring/subarray problems (longest substring without repeats, max sum of size `k`) into `O(n)`, since each element enters and leaves the window at most once.

## What is dynamic programming?
Solving a problem by combining solutions to **overlapping subproblems** that have **optimal substructure**, storing each subproblem's answer so it's computed once. It can be top-down (recursion + memoization) or bottom-up (filling a table in dependency order, often reducible to `O(1)` extra rows). Classic examples: Fibonacci, knapsack, edit distance, longest common subsequence.

## Memoization vs tabulation
Both are dynamic programming. **Memoization** is top-down: write the natural recursion and cache results keyed by arguments; only reachable subproblems get computed, but deep recursion can overflow the stack. **Tabulation** is bottom-up: iterate over subproblems in an order where dependencies are already filled; no recursion overhead and often easier to optimize for memory.

## Greedy algorithms
Make the locally best choice at each step and never revisit it. They are fast and simple but only correct when the problem has the **greedy-choice property** (a local optimum leads to a global one), which usually needs a proof (exchange argument). Correct for interval scheduling, Huffman coding, Dijkstra and MST; wrong for 0/1 knapsack or coin change with arbitrary denominations.

## BFS vs DFS
**Breadth-first search** explores level by level with a queue; on an unweighted graph it finds shortest paths in edges. **Depth-first search** goes as deep as possible first using a stack or recursion; it's the basis for cycle detection, topological sort and connected components. Both run in `O(V + E)`. DFS uses memory proportional to depth, BFS to the widest frontier.

## Dijkstra's algorithm
Finds shortest paths from one source in a graph with **non-negative** edge weights. It repeatedly takes the unvisited node with the smallest tentative distance (from a min-heap) and relaxes its edges. With a binary heap it runs in `O((V + E) log V)`. A negative edge breaks it because a settled node might later get a cheaper path; use Bellman-Ford there.

## A* search
Dijkstra guided by a **heuristic**: it expands nodes by `g(n) + h(n)`, where `g` is the cost so far and `h` estimates the remaining cost to the goal. If `h` never overestimates (is **admissible**), A* still returns the optimal path while exploring far fewer nodes. Common in pathfinding on maps and grids, with heuristics like Manhattan or straight-line distance.

## Topological sort
A linear ordering of a **directed acyclic graph** where every edge `u → v` has `u` before `v`, as in build systems, task schedulers and package installs. **Kahn's algorithm** repeatedly removes nodes with in-degree 0; a DFS approach outputs nodes in reverse post-order. Both are `O(V + E)`. If nodes remain that can't be removed, the graph has a cycle.

## Union-Find (disjoint set)
A structure that tracks which elements belong to the same set, supporting `find(x)` (which set?) and `union(a, b)` (merge). With **path compression** and **union by rank**, operations run in nearly constant amortized time (inverse Ackermann). Used in Kruskal's MST, connected components and detecting cycles in undirected graphs.

## What is a heap / priority queue?
A **binary heap** is a complete binary tree stored in an array where each parent is ≤ (min-heap) its children. Peeking the minimum is `O(1)`; insert and extract-min are `O(log n)` via sift-up/down; building one from `n` items is `O(n)`. It's the usual implementation of a priority queue, used in Dijkstra, schedulers and top-k problems.

## How does a hash table work?
A hash function maps a key to a bucket index in an array. Collisions are handled by **chaining** (a list per bucket) or **open addressing** (probe for another slot). With a good hash and a bounded **load factor**, lookups are `O(1)` on average; the table resizes and rehashes when it gets too full. Worst case is `O(n)` if many keys collide.

## What is a trie?
A prefix tree where each edge represents a character and each path from the root spells a key. Lookup and insert cost `O(L)` in the key length, independent of how many keys are stored, and all keys sharing a prefix live under one subtree. That makes tries a natural fit for autocomplete, spell checking and IP routing (longest prefix match), at the cost of memory.

## Binary search beyond sorted arrays
Binary search works on any **monotonic predicate**: if `ok(x)` is false then true as `x` grows, you can find the boundary in `O(log range)`. That's "binary search on the answer": the smallest capacity that ships packages in `D` days, the minimum speed to finish in time. Watch for off-by-one errors in the loop invariant and overflow in `(lo + hi) / 2`.

## Why is comparison sorting at least O(n log n)?
Any sort that only compares elements must distinguish all `n!` possible orderings, and each comparison yields one bit of information. A decision tree with `n!` leaves needs height `log₂(n!) ≈ n log n`. Algorithms like **counting sort** and **radix sort** beat this bound because they exploit the structure of keys (bounded integers) rather than comparing them.

## Quicksort vs mergesort
**Quicksort** partitions around a pivot in place, is cache-friendly and fast in practice, but degrades to `O(n²)` with bad pivots and isn't stable. **Mergesort** guarantees `O(n log n)`, is stable and suits linked lists and external sorting, but needs `O(n)` extra memory for arrays. Production sorts are often hybrids: introsort, Timsort, pdqsort.

## What is a stable sort?
A sort is **stable** if elements that compare equal keep their original relative order. It matters when sorting by multiple keys in passes: sort by last name, then stably by department, and names stay ordered within each department. Mergesort, insertion sort and Timsort are stable; quicksort and heapsort typically aren't.

## What is backtracking?
A depth-first search over a space of partial solutions: make a choice, recurse, and **undo the choice** when it leads to a dead end. Pruning branches that can't succeed early is what makes it practical. It's the standard approach for N-Queens, Sudoku, generating permutations or subsets, and constraint satisfaction problems.

## What is a Bloom filter?
A space-efficient probabilistic set: `k` hash functions set bits in a bit array on insert, and a query checks those same bits. It can return **false positives but never false negatives**: "definitely not present" or "probably present". Databases and caches use it to skip disk lookups for keys that don't exist. Standard Bloom filters can't delete items.

## Consistent hashing
A way to map keys to `N` nodes so that adding or removing a node moves only about `1/N` of the keys, unlike `hash(key) % N`, which reshuffles almost everything. Nodes and keys are hashed onto a ring and each key belongs to the next node clockwise. **Virtual nodes** (many points per server) smooth out the load. Used by distributed caches and Dynamo-style databases.

## What is a skip list?
A sorted linked list with extra randomized "express lanes": each node is promoted to higher levels with probability ½, so searches skip ahead and drop down. It gives expected `O(log n)` search, insert and delete like a balanced tree, but is simpler to implement and to make concurrent. Redis sorted sets and some LSM-tree memtables use skip lists.

## Why do self-balancing trees exist?
A plain binary search tree degrades into a linked list (`O(n)` operations) when keys arrive in sorted order. **Self-balancing trees** such as AVL and red-black trees rotate nodes on insert and delete to keep height `O(log n)`. Red-black trees rebalance less often and back many standard-library ordered maps; AVL trees are more strictly balanced and faster for lookups.

## What is reservoir sampling?
A way to pick `k` items uniformly at random from a stream of unknown length in one pass with `O(k)` memory. Keep the first `k` items; for the `i`-th item (1-based), replace a random reservoir slot with probability `k/i`. Every item ends with equal probability `k/n`. Useful for sampling logs or huge datasets that don't fit in memory.

## Space-time tradeoff
Many algorithms can trade memory for speed or vice versa. Caching, memoization, lookup tables and indexes spend memory to avoid recomputation; streaming or recomputing on demand saves memory at the cost of time. Recognizing this tradeoff is often the key to an optimization: e.g. a hash set makes "find a duplicate" `O(n)` time at `O(n)` space instead of `O(n²)` time with `O(1)`.
