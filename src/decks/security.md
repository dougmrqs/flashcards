---
title: Security
description: Web and application security concepts every developer meets
icon: 🔐
order: 11
---

## Cross-Site Scripting (XSS)
Injecting attacker-controlled script into pages other users view. **Stored** XSS is saved in the database, **reflected** XSS comes back from the request, and **DOM-based** XSS happens in client-side JS sinks like `innerHTML`. It lets attackers steal sessions, act as the user, or deface pages. Defenses: context-aware output encoding (frameworks do this by default), avoiding raw-HTML sinks, sanitizing allowed HTML (e.g. DOMPurify), and a strict CSP.

## Cross-Site Request Forgery (CSRF)
A malicious site makes the victim's browser send a **state-changing request** to another site where they're logged in. The browser attaches the cookies automatically, so the request looks legitimate. Defenses: anti-CSRF tokens (synchronizer or double-submit), `SameSite` cookies, checking the `Origin` header, and never changing state on `GET`. APIs authenticated only with a bearer header aren't affected.

## SQL injection
Untrusted input concatenated into a SQL string changes the **query's structure**. For example, `' OR 1=1 --` bypasses a login check, and stacked queries can drop tables. The fix is **parameterized queries / prepared statements**, where data never becomes code. ORMs help, but raw-query escape hatches and dynamic identifiers (column names, `ORDER BY`) still need allowlists.

## Server-Side Request Forgery (SSRF)
Tricking a server into making HTTP requests **to destinations the attacker chooses**, often internal services or the cloud metadata endpoint (`169.254.169.254`) that hands out credentials. It typically shows up in URL fetchers, webhooks and image proxies. Defenses: allowlist destinations, resolve and block private IP ranges (watch for DNS rebinding and redirects), and use IMDSv2.

## Content Security Policy (CSP)
An HTTP response header that tells the browser **which sources may load scripts, styles, frames and so on**, for example `script-src 'self' 'nonce-abc123'`. A strict, nonce- or hash-based CSP blocks most injected scripts even when an XSS bug exists. Avoid `'unsafe-inline'` and broad wildcards. Roll it out with `Content-Security-Policy-Report-Only` first to find breakages.

## Password hashing (bcrypt, scrypt, Argon2)
Passwords must be stored with a **slow, salted, adaptive** hash, not a fast one like SHA-256 or MD5, which GPUs can test billions of times per second. Argon2id (memory-hard) is the current recommendation, with scrypt and bcrypt as acceptable alternatives. Raise the work factor over time and rehash on login. Never encrypt passwords; encryption is reversible.

## Salt and pepper
A **salt** is a unique random value per password, stored alongside the hash. It makes identical passwords hash differently and defeats precomputed rainbow tables. A **pepper** is a secret value added to every password and stored *outside* the database (in an HSM or secrets manager), so a database dump alone isn't enough to crack hashes. Modern libraries generate salts automatically.

## JWT pitfalls
JSON Web Tokens are signed, not encrypted, so **anyone can read the payload**. Common mistakes: accepting `alg: none` or algorithm confusion (an RS256 public key used as an HS256 secret), not validating `exp`/`aud`/`iss`, putting secrets in claims, and storing tokens in `localStorage` where XSS can steal them. They're also hard to revoke before expiry, so use short lifetimes plus refresh tokens.

## OAuth 2.0 vs OpenID Connect
**OAuth 2.0** is for *authorization*: it gives an app an access token to call an API on a user's behalf without sharing their password. It doesn't define who the user is. **OpenID Connect (OIDC)** is a layer on top that adds *authentication*: an **ID token** (a JWT) with verified identity claims, plus a `userinfo` endpoint. "Log in with X" is OIDC.

## PKCE
Proof Key for Code Exchange (pronounced "pixie"). It's an OAuth extension where the client sends a hash of a random `code_verifier` with the authorization request and the raw verifier when exchanging the code. An attacker who intercepts the authorization code can't redeem it. It's mandatory for public clients (SPAs, mobile apps) and recommended for all clients in OAuth 2.1.

## Principle of least privilege
Every user, service and process should get **only the permissions it needs, for only as long as it needs them**. This limits the blast radius when credentials leak or code is compromised. In practice: scoped API tokens, read-only database users for read paths, narrow IAM policies, no root containers, and time-boxed elevation instead of standing admin rights.

## Defense in depth
Layering **multiple independent controls** so one failure doesn't mean a breach: input validation *and* parameterized queries *and* least-privilege database accounts *and* monitoring. It assumes each layer will eventually be bypassed. Think network segmentation, WAF, authentication, authorization, encryption and logging all working together.

## Timing attacks
Learning secrets from **how long an operation takes**. A naive `a == b` comparison returns at the first mismatched byte, so response times leak how many leading characters of a token or HMAC are correct. Use constant-time comparison (`crypto.timingSafeEqual`, `hmac.compare_digest`) for secrets. Login endpoints should also take similar time for unknown users.

## IDOR (Insecure Direct Object Reference)
An access-control bug where changing an identifier, such as `/invoices/1001` to `/invoices/1002`, gives you **someone else's data**. The server authenticated the user but never checked that they're allowed to access *that object*. Fix it with object-level authorization checks on every request (scope queries by owner or tenant). Random UUIDs make guessing harder but are not a fix.

## SameSite cookies
A cookie attribute that controls whether cookies are sent on **cross-site requests**. `Strict` means never; `Lax` (the default for cookies without the attribute in Chromium-based browsers) allows them only on top-level `GET` navigations; `None` means always and requires `Secure`. It's a strong CSRF mitigation. Pair session cookies with `HttpOnly` (no JS access) and `Secure` (HTTPS only).

## Supply-chain attacks
Compromising software **through its dependencies or build pipeline** rather than the target directly. Examples: typosquatted packages, hijacked maintainer accounts, malicious `postinstall` scripts, dependency confusion between private and public registries, and compromised CI. Mitigations: lockfiles, pinned versions, provenance and signing (Sigstore, SLSA), minimal dependencies, and scoped CI secrets.

## Dependency confusion
A supply-chain attack where an attacker publishes a **public package with the same name as your private, internal one**, at a higher version. Misconfigured package managers prefer the public registry and install the attacker's code. Prevent it with scoped or namespaced packages (`@company/…`), registry mapping per scope, and lockfiles with integrity hashes.

## Clickjacking
Loading your site in an **invisible iframe** on an attacker's page and tricking users into clicking real buttons (delete account, approve payment) that they can't see. Prevent framing with the `Content-Security-Policy: frame-ancestors 'none'` header (or `'self'`), or the legacy `X-Frame-Options: DENY`.

## Open redirect
An endpoint that redirects to a **URL taken from user input**, like `/login?next=https://evil.com`. Attackers use your trusted domain in phishing links, and it can chain into OAuth token theft. Only allow relative paths or an allowlist of destinations, and validate carefully, since `//evil.com` and `/\evil.com` are also external.

## Authentication vs authorization
**Authentication (AuthN)** answers "who are you?" by verifying identity with passwords, passkeys, MFA or SSO. **Authorization (AuthZ)** answers "what may you do?" by checking permissions for a specific action and resource. Many breaches are authorization bugs in otherwise well-authenticated apps; IDOR is the classic example. Enforce AuthZ on the server, never only in the UI.

## Session fixation
An attacker gets a victim to use a **session ID the attacker already knows**, for example by planting it via a URL or cookie, then waits for the victim to log in, which upgrades that same session. Defense: **regenerate the session ID on login** and on any privilege change, and don't accept session IDs from URLs.

## Secrets management
API keys, database passwords and signing keys must **never live in source code or images**; git history keeps them forever. Store them in a secrets manager (Vault, AWS Secrets Manager, etc.) or injected environment variables. Scope them narrowly, rotate them regularly, and scan commits with tools like gitleaks. If a secret leaks, rotate it first; removing it from git isn't enough.

## Hashing vs encryption vs encoding
**Encoding** (Base64, URL encoding) changes representation and provides no security; anyone can reverse it. **Encryption** (AES, RSA) is reversible *with a key* and protects confidentiality. **Hashing** (SHA-256, Argon2) is one-way and is used for integrity checks and password storage. Mixing these up, such as "encrypting" with Base64, is a classic bug.

## Insecure deserialization
Deserializing **untrusted data into native objects** can execute code. Python `pickle`, Java `ObjectInputStream`, PHP `unserialize` and YAML loaders that build arbitrary objects can trigger "gadget chains" that run during object construction. Never deserialize untrusted input with these formats. Use data-only formats (JSON) with schema validation, or safe loaders like `yaml.safe_load`.

## Rate limiting and brute-force protection
Capping how many requests a client can make in a time window, using token or leaky buckets, per IP, account or API key. It slows credential stuffing, password guessing, scraping and resource-exhaustion abuse. On login, combine it with progressive delays, MFA and breached-password checks. Avoid hard account lockouts, which attackers can use to deny service to legitimate users.

## HSTS
**HTTP Strict Transport Security**: the header `Strict-Transport-Security: max-age=31536000; includeSubDomains` tells browsers to **only use HTTPS** for your domain from then on. This blocks SSL-stripping downgrade attacks on public Wi-Fi. The very first visit is still vulnerable unless the domain is on the browser **preload list**.
