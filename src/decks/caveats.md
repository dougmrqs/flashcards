---
title: Caveats
description: Cross-language gotchas that bite in production.
icon: ⚠️
order: 7
---

## Floating-point precision
IEEE 754 binary floats can't exactly represent most decimal fractions, so `0.1 + 0.2 != 0.3` in nearly every language. Errors accumulate over many operations, and comparing floats with `==` is fragile. Compare with a relative tolerance (`math.isclose`), and never use floats for money; use integer minor units (cents) or a decimal type.

## Why is NaN not equal to itself?
IEEE 754 defines every comparison with NaN as false, including `NaN == NaN`. So `x != x` is a NaN test, and NaN in a list breaks sorting, `includes`/`in` checks (depending on the language) and dict or set keys. Use dedicated checks such as `Number.isNaN` or `math.isnan`. In IEEE arithmetic (JS, Java, C), float division by zero gives `Infinity` or NaN instead of an error, although Python raises `ZeroDivisionError`.

## Integer overflow
Fixed-width integers wrap around or are undefined behavior when they exceed their range. Signed overflow is UB in C/C++, Java wraps silently, and Rust panics in debug builds. Real bugs: the 2^31 limit on timestamps and IDs (the **Year 2038 problem**), and `(lo + hi) / 2` overflowing in binary search; use `lo + (hi - lo) / 2`. JS numbers lose integer precision past 2^53.

## Why is string length not "number of characters"?
"Character" has several meanings: **bytes** (UTF-8 encoding), **code units** (UTF-16, which JS `.length` counts), **code points**, and **grapheme clusters** (what users see). `"👍🏽".length` is 4 in JS, Python's `len` gives 2 code points, and a user sees 1. Truncating or reversing strings by code unit can split emoji and produce invalid text. Use grapheme-aware APIs such as `Intl.Segmenter`.

## Unicode normalization
The same visible text can have different code point sequences: `é` can be one precomposed code point (U+00E9) or `e` plus a combining accent. They render identically but compare unequal and hash differently. Normalize (NFC is common) before comparing, deduplicating or storing usernames. NFKC also folds look-alike compatibility characters.

## Encoding mismatch (mojibake)
Bytes only become text through an encoding. Decoding UTF-8 bytes as Latin-1 or Windows-1252 turns `café` into `cafÃ©`. Always state the encoding at boundaries such as files, HTTP `Content-Type`, DB connections and CSV exports. Default "platform encodings" differ between OSes. Decode at input, work with text internally, and encode at output.

## Case-insensitive comparison pitfalls
Lowercasing to compare fails in some locales. Under a Turkish locale, locale-sensitive lowercasing (Java's default `toLowerCase()`, JS `toLocaleLowerCase('tr')`) turns `I` into dotless `ı`, not `i`, and German `ß` uppercases to `SS`. For caseless matching, use **case folding** (`str.casefold()` in Python, or `localeCompare` with a sensitivity option) and fix the locale for machine-readable identifiers.

## Storing local time instead of UTC
Local times are ambiguous: offsets change with DST and with government rule changes. Store instants as **UTC** (or with an explicit offset), and convert to the user's zone only for display. For future events in a place, such as "9am in Lisbon", store the local time *plus* an IANA zone name like `Europe/Lisbon`, because the offset may change before the event.

## Daylight saving time traps
On DST transitions some local times **don't exist** (the spring-forward gap) and others **happen twice** (the fall-back overlap). "Add one day" and "add 24 hours" differ, and a 2:30 a.m. daily job may run twice or not at all. Do arithmetic on UTC instants for durations, and on calendar dates for calendar logic, with a proper timezone library.

## Clock skew and wall-clock time
Wall-clock time (`Date.now()`, `time.time()`) can jump backwards or forwards with NTP adjustments or manual changes. Never use it to measure durations; use a **monotonic clock** (`performance.now()`, `time.monotonic()`). Across machines, clocks disagree, so timestamps alone can't reliably order events in a distributed system.

## Off-by-one errors
Errors at the boundaries of ranges: `<` vs `<=`, inclusive vs exclusive ends, 0- vs 1-based indexing, or fencepost counting (10 metres of fence with posts every metre needs 11 posts). **Half-open intervals** `[start, end)` reduce them: the length is `end - start` and adjacent ranges compose without overlap. Most standard libraries use them.

## Aliasing and shared mutable state
Two references to the same mutable object mean a change through one is visible through the other. Bugs appear when a function mutates its argument, a default value or a cached object that callers assumed they owned, or when a "copy" is actually shallow. Prefer immutability or explicit copies at boundaries, and document whether a function mutates its input.

## Sorting strings is locale-dependent
Default string sorts compare code points, which puts `Z` before `a` and `é` after `z`. They also mishandle numbers in names, putting `file10` before `file2`. Human-facing lists need **locale-aware collation** (`Intl.Collator`, ICU, `locale.strxfrm`) and possibly a "natural" numeric option. Machine identifiers should use a stable, locale-independent ordering.

## Line endings: CRLF vs LF
Windows uses `\r\n`, Unix uses `\n`. Mixed line endings break shell scripts (`bad interpreter: /bin/bash^M`), produce noisy diffs, and confuse parsers that split on `\n`. Normalize in git with `.gitattributes` (`* text=auto eol=lf`), and strip `\r` when parsing external text input.

## Byte order (endianness)
Multi-byte numbers are stored either least-significant byte first (**little-endian**, as on x86 and ARM in practice) or most-significant first (**big-endian**, the network byte order). Reading binary files or protocols with the wrong byte order gives garbage numbers. Always specify endianness explicitly when serializing (`DataView`, `struct.pack('<I')`, `htonl`).

## Truncation vs floor in integer division
Languages disagree about negative integer division. C, Java, JS (`Math.trunc`) and Go **truncate toward zero** (`-7 / 2 = -3`), while Python's `//` **floors** (`-7 // 2 = -4`). Modulo follows the same split: `-7 % 3` is `-1` in C/JS and `2` in Python. This breaks porting code, wrap-around indexing and hash bucketing.

## Rounding is not what you learned at school
Many runtimes round half-to-even (**banker's rounding**): Python's `round(2.5)` is `2`. JS `Math.round` rounds half toward +∞, so `Math.round(-2.5)` is `-2`. Binary floats also mean `round(2.675, 2)` gives `2.67`, because 2.675 is really 2.67499…. Choose the rounding mode explicitly for anything financial.

## Hash iteration order
Never rely on the iteration order of hash-based collections unless the language guarantees it. Go **randomizes** map iteration on purpose, Java's `HashMap` order changes with capacity, and Python dicts and JS `Map`/`Set` preserve insertion order, but Python sets don't. Code that "worked" can break on a version upgrade or a resize.

## Silent truncation and implicit conversion
Values get quietly cut or changed when converted: a 64-bit ID through a 32-bit int, a big integer ID through JSON into a JS number (above 2^53), a `VARCHAR(50)` truncating input, or a float cast to an int. The symptom is subtly wrong data, not an error. Validate at boundaries, and send large IDs as strings.

## Leap years and calendar arithmetic
A year is a leap year if it is divisible by 4, except century years, which must be divisible by 400 (2000 was a leap year, 1900 was not). "Same day next month" from 31 January is undefined, and Feb 29 + 1 year needs a rule. Don't hand-roll date math; use a calendar-aware library and decide your clamping rules explicitly.

## Relying on undefined or implementation-defined behavior
Code that relies on behavior the spec doesn't guarantee, such as unspecified evaluation order, uninitialized memory, sort stability before it was guaranteed, or reading a moved-from value, can pass every test and then break on another compiler, optimization level or runtime version. In C/C++, undefined behavior lets the optimizer assume it *never happens* and remove your checks.

## Hidden quadratic string building
Strings are immutable in many languages, so `s += piece` inside a loop can copy the whole string on each iteration, giving **O(n²)** total work. Build up a list and `join`, or use a builder (`StringBuilder`, `strings.Builder`, `io.StringIO`). Some runtimes optimize the simple case, but you shouldn't rely on that.

## Path and filename assumptions
File paths differ by OS: separators (`/` vs `\`), case sensitivity (macOS and Windows filesystems are usually case-insensitive, Linux is case-sensitive), reserved names (`CON`, `NUL` on Windows), max path length, and allowed characters. Use path libraries (`path.join`, `pathlib`) instead of concatenating strings, and never trust user-supplied filenames.

## Locale-dependent number formatting
`1,234.5` in en-US is `1.234,5` in de-DE. Parsing with locale-aware functions, or formatting with a locale-aware `toString`, can corrupt CSVs, configs and APIs. Use **invariant formats** (plain `.` decimals, ISO 8601 dates) for machine data, and locale formatting (`Intl.NumberFormat`) only for display.
