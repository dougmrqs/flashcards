---
title: AI Engineering
description: Building software on top of LLMs: agents, RAG, evals and the gotchas.
icon: 🤖
order: 13
---

## What is an AI agent?
An LLM running **in a loop**: it gets a goal, decides on an action, calls a **tool** (search, run code, edit a file, call an API), reads the result, and repeats until it decides it's done. Unlike a single prompt-response call, the model chooses the control flow. That makes agents flexible but less predictable, so production agents need step limits, permission boundaries for risky tools, and logs of every step for debugging.

## What is a token?
The unit an LLM reads and writes. It's usually a word fragment produced by a tokenizer such as BPE, not a character or a whole word. A common English word may be one token, while rare words, code, numbers and non-English text often split into several. Context limits, pricing and latency are all counted in tokens. Tokenization also explains classic failures such as miscounting letters in a word: the model never sees individual characters.

## What is the context window?
The maximum number of tokens a model can attend to in one request: system prompt, conversation history, tool results, retrieved documents **and** the output. Anything outside it doesn't exist to the model. Bigger windows help, but cost and latency grow with input size, and recall of details buried in the middle of very long contexts can degrade. Curating what goes in usually beats stuffing everything in.

## Temperature and top-p
Sampling settings that control randomness. **Temperature** rescales the probability distribution over the next token: low values make output more deterministic, high values make it more varied. **Top-p** (nucleus sampling) samples only from the smallest set of tokens whose probabilities add up to *p*. Use low randomness for extraction and code and more for brainstorming. Even temperature 0 isn't guaranteed to be bit-for-bit reproducible across runs.

## Why do LLMs hallucinate?
A language model generates **plausible continuations**, not verified facts. When it lacks knowledge, it can produce fluent, confident text that is wrong, such as invented citations, APIs or numbers. Mitigations: ground answers in retrieved sources (RAG) and ask for citations, let the model say "I don't know", use tools for facts and arithmetic, and verify output automatically where you can (run the code, validate against a schema).

## What is a system prompt?
Instructions placed before the conversation that set the model's role, rules, tone, output format and available tools. Models are trained to weight it above user messages, which makes it the right place for policy and product behavior. It is **not** a security boundary: a determined user or injected content can sometimes override it, so never put secrets in it or rely on it alone for access control.

## Prompt engineering vs context engineering
**Prompt engineering** is wording the instructions well: clear task, constraints, examples, output format. **Context engineering** is the broader job of deciding *everything* that goes into the context window on each call: which documents to retrieve, which tool results and history to keep or summarize, and which tools to expose. For agents and long tasks, most quality problems are context problems (missing, stale or noisy information) rather than phrasing problems.

## Few-shot prompting
Including a few input → output examples in the prompt so the model infers the pattern, format and edge-case handling. It's often more effective than describing the format in prose. Pitfalls: the model may copy surface features of the examples (length, wording, a skewed label distribution), and examples cost tokens on every call. Pick diverse, representative examples, and include tricky cases.

## Chain-of-thought and reasoning models
**Chain-of-thought** means having the model work through intermediate steps before answering, which improves multi-step problems such as math, logic and planning. **Reasoning models** are trained to do this internally, spending extra "thinking" tokens before the final answer, often with a configurable budget. The trade-off is more latency and tokens for better accuracy on hard tasks. Simple lookups and formatting don't need it.

## Tool use (function calling)
You describe tools to the model with a name, a description and a JSON Schema for the parameters. Instead of answering in text, the model can emit a structured **tool call**. **Your code** executes it and sends the result back, and the model continues. The model never runs anything itself. Good tool names and descriptions matter as much as prompts, and arguments should be validated like any untrusted input.

## Structured outputs
Constraining the model to produce output matching a **JSON Schema**, often enforced with constrained decoding so invalid JSON can't be generated at all. This beats asking nicely for JSON and parsing with a regex. A schema-valid response can still be semantically wrong, so keep validating values (ranges, enums, cross-field rules) and design schemas the model can fill naturally, for example a `reasoning` field before the `answer`.

## What is MCP (Model Context Protocol)?
An open protocol for connecting AI applications to tools and data sources. A server exposes **tools**, **resources** and **prompts** through a standard interface, and any MCP-capable client can use them, so each integration is written once rather than once per app. Think "USB for LLM tools". MCP servers run with real permissions, so install them only from sources you trust and scope what they can access.

## What is RAG?
**Retrieval-Augmented Generation**: before generating, retrieve relevant documents (from a search index, vector store or database) and put them in the prompt so the model answers from them. It gives the model private or up-to-date knowledge without retraining, and lets you cite sources. Answer quality is capped by retrieval quality: if the right chunk isn't retrieved, the model can't use it. Most RAG debugging is really search debugging.

## What are embeddings?
Dense vectors, typically hundreds to a few thousand dimensions, produced by a model so that semantically similar texts land close together. Closeness is measured with cosine similarity or dot product. "How do I reset my password?" and "forgot login credentials" end up near each other despite sharing no words. Embeddings power semantic search, clustering, deduplication and RAG retrieval. Vectors from different embedding models aren't comparable.

## Vector databases and ANN search
Stores that index embeddings for fast **nearest-neighbor** queries. Exact search compares the query with every vector, which is too slow at scale, so they use **approximate nearest neighbor** (ANN) indexes such as HNSW or IVF that trade a little recall for big speedups. Options range from dedicated engines to extensions such as `pgvector`. Production needs usually include metadata filtering and hybrid keyword + vector search.

## Chunking
Splitting documents into pieces before embedding them for retrieval. Chunks that are too large dilute the embedding and waste context; chunks that are too small lose surrounding meaning, for example a sentence that says "it" without saying what "it" is. Common strategies: split on structure (headings, paragraphs, functions), use overlapping windows, and attach metadata such as the title or section path to each chunk. Chunking choices often matter more than the choice of vector DB.

## What is reranking?
A second retrieval stage. A fast first pass (vector or keyword search) fetches many candidates, say 50–100, then a slower, more accurate model, usually a **cross-encoder** that reads the query and each document together, re-scores them and keeps the best few for the prompt. It's a cheap, reliable way to improve RAG precision without re-indexing anything.

## Prompting vs RAG vs fine-tuning
Escalate in order of cost. **Prompting** first: instructions and examples, quick to iterate. **RAG** when the model lacks *knowledge*, especially private or changing data. **Fine-tuning** when it needs a *behavior* prompts can't reliably produce: a consistent style or format, a narrow task done cheaper by a smaller model, or domain jargon. Fine-tuning is a poor way to add facts: they're hard to update and still get hallucinated.

## What is LoRA?
**Low-Rank Adaptation**: a parameter-efficient fine-tuning method. Instead of updating all of a model's weights, you freeze them and train small low-rank matrices added to certain layers. That's a tiny fraction of the parameters, so training needs far less memory and the resulting adapter is small enough to store or swap per customer or task. QLoRA combines it with a quantized base model to fine-tune on even more modest hardware.

## What are evals?
Automated tests for LLM features: a dataset of inputs with expected outputs or grading criteria, run against every prompt, model or retrieval change. Because outputs are non-deterministic and "correct" is fuzzy, evals score quality across many cases instead of asserting exact strings. Without them, every prompt tweak is a guess that may silently break other cases. Start small, with real failures from production, and grow the set over time.

## LLM-as-judge
Using an LLM to grade another model's output against a rubric ("Is this answer faithful to the provided sources? Score 1–5 with a reason"). It scales evaluation to open-ended outputs where exact matching doesn't work. Judges have biases: favoring longer answers, their own style, or the first option shown. Use specific rubrics, prefer pass/fail or pairwise comparisons, and check the judge against human labels.

## What is prompt injection?
Text that hijacks an LLM by being read as instructions. **Direct** injection comes from the user ("ignore previous instructions…"). **Indirect** injection is hidden in content the model processes, such as a web page, email, document or tool result, and is the dangerous one for agents. There is no complete fix, because instructions and data share the same channel. Limit the blast radius instead: least-privilege tools, human confirmation for risky actions, and no single agent that has private data, untrusted input and a way to exfiltrate.

## Guardrails
Checks around a model call that enforce policy regardless of what the model does. **Input** checks catch prompt injection, off-topic requests or PII. **Output** checks cover schema validation, PII leaks, unsafe content and grounding in the sources. **Action** guardrails cover allow-lists, spending caps and human approval. Deterministic code beats asking the model to police itself, and guardrails add latency, so put the strictest ones where the stakes are highest.

## What is prompt caching?
Reusing the model's processed state for a **prompt prefix** that repeats across requests, such as a long system prompt, tool definitions or a big document. Cached input tokens are typically much cheaper and faster than fresh ones. It only matches an *exact* prefix, so put stable content first and variable content (the user's question, timestamps) last. Changing one early character invalidates everything after it.

## Why stream LLM responses?
Generation is token-by-token and can take many seconds. **Streaming** (usually via Server-Sent Events) shows output as it's produced, so perceived latency drops to *time to first token*. It complicates things: you parse partial output, handle errors mid-stream, and can't validate the full response before showing it. For structured output or tool calls, you often buffer until a complete unit has arrived.

## Latency and cost trade-offs
Cost and latency scale with **model size** and **tokens**: input tokens (prompt, history, retrieved docs) and output tokens, which are generated sequentially and usually cost more. Levers: route easy requests to a smaller model, trim and cache context, cap output length, run independent calls in parallel, and avoid needless agent steps. Measure per-feature cost; a chatty agent loop can multiply token usage many times over.

## Multi-agent systems
Splitting work across several LLM agents, for example an orchestrator that delegates to specialized sub-agents with their own prompts, tools and fresh context windows. Benefits: parallelism and focused context per subtask. Costs: more tokens, harder debugging, and errors that compound as agents pass imperfect results to each other. Reach for it when subtasks are genuinely independent; a single well-equipped agent is often enough.

## Quantization
Storing model weights in fewer bits, for example 8-bit or 4-bit integers instead of 16-bit floats, to cut memory and speed up inference. It's what makes running sizable open-weight models on a single GPU or laptop feasible. Quality loss at 8-bit is usually small; more aggressive quantization trades more accuracy for size. It's usually applied after training (post-training quantization) and is different from distillation, which trains a smaller model.
