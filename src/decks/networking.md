---
title: Networking
description: HTTP, TCP, DNS, TLS and what happens between client and server
icon: 🌐
order: 10
---

## What happens when you type a URL and press Enter?
The browser parses the URL, checks caches, resolves the hostname through **DNS**, opens a **TCP** connection (or QUIC for HTTP/3), performs a **TLS handshake**, and sends an HTTP request. The server (often via CDN and load balancer) responds; the browser parses HTML, fetches CSS, JS and images (often reusing connections), builds the DOM and CSSOM, runs scripts, then lays out and paints the page.

## The TCP three-way handshake
Before sending data, TCP establishes a connection: the client sends **SYN** with its initial sequence number, the server replies **SYN-ACK** with its own and acknowledges the client's, and the client sends **ACK**. That costs one round trip before any request. Closing uses FIN/ACK in each direction. TCP Fast Open can carry data in the SYN to save a round trip on repeat connections.

## TCP vs UDP
**TCP** is connection-oriented and gives a reliable, ordered byte stream with retransmission, flow control and congestion control, at the cost of handshakes and head-of-line blocking. **UDP** sends independent datagrams with no delivery or ordering guarantees and no connection setup, so it's lower latency. DNS, video calls, games and QUIC build on UDP and add only the reliability they need.

## What is head-of-line blocking?
When one delayed item holds up everything queued behind it. In **HTTP/1.1**, a connection handles one request at a time, so a slow response blocks the next. HTTP/2 fixed that at the HTTP layer with multiplexing, but kept it at the **TCP layer**: one lost packet stalls all streams on the connection until it's retransmitted. HTTP/3 over QUIC removes that by making streams independent.

## HTTP/1.1 vs HTTP/2 vs HTTP/3
**HTTP/1.1**: text protocol, one in-flight request per connection, so browsers open ~6 connections per host. **HTTP/2**: binary framing, many concurrent **streams multiplexed** over one TCP connection, plus header compression (HPACK). **HTTP/3**: same semantics over **QUIC** on UDP, with independent streams, TLS 1.3 built in, faster setup, and connections that survive network changes.

## What is QUIC?
A transport protocol built on **UDP** that HTTP/3 runs on. It integrates TLS 1.3 so connection setup and encryption happen in one round trip (0-RTT on resumption), multiplexes independent streams so a lost packet only stalls its own stream, and uses connection IDs instead of IP/port tuples so a connection survives switching from Wi-Fi to cellular. Running in user space lets it evolve faster than kernel TCP.

## How does DNS resolution work?
The client asks a **recursive resolver** (ISP, 1.1.1.1, 8.8.8.8). On a cache miss, the resolver queries a **root** server, which points to the **TLD** server (`.com`), which points to the domain's **authoritative** nameserver, which returns the record. Every answer is cached for its **TTL** at each level, including the OS and browser, which is why DNS changes take time to propagate.

## Common DNS record types
**A** maps a name to an IPv4 address, **AAAA** to IPv6. **CNAME** aliases one name to another (not allowed at the zone apex). **MX** names mail servers, **TXT** holds arbitrary text (SPF, domain verification), **NS** delegates a zone to nameservers, and **SRV** advertises host and port for a service. ALIAS/ANAME are provider-specific CNAME-like records that work at the apex.

## The TLS handshake
Client and server agree on a protocol version and cipher suite, perform a key exchange (usually ephemeral **ECDHE**) to derive shared symmetric keys, and the server proves its identity with a **certificate** chain the client verifies against trusted CAs. TLS 1.3 completes this in **one round trip** (0-RTT on resumption, with replay caveats), down from two in TLS 1.2. Data is then encrypted symmetrically.

## What is SNI?
**Server Name Indication** is a TLS extension where the client sends the hostname it wants in the ClientHello. It lets one IP address host many HTTPS sites with different certificates, because the server can pick the right certificate before the encrypted session exists. In standard TLS it's sent in plaintext, so observers see which site you're visiting; Encrypted Client Hello (ECH) addresses that.

## What is CORS?
**Cross-Origin Resource Sharing** relaxes the browser's same-origin policy. When a page reads a response from a different origin (scheme, host or port), the browser only exposes it if the server returns `Access-Control-Allow-Origin` matching the page. It's enforced by the **browser**, not the server: curl ignores it. It controls whether JS can read the response, not whether the request reaches the server.

## What is a CORS preflight request?
For cross-origin requests that aren't "simple" (methods other than GET/HEAD/POST, custom headers, or a JSON `Content-Type`), the browser first sends an `OPTIONS` request asking permission. The server must answer with `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` (and can cache the answer with `Access-Control-Max-Age`). Only then is the real request sent.

## Cache-Control: no-cache vs no-store
`no-store` means don't keep a copy anywhere, ever: use it for sensitive data. `no-cache` is misleading: the response **may** be stored but must be **revalidated** with the server before each use (via `ETag` or `Last-Modified`). `max-age=N` lets caches reuse it for N seconds without asking; `private` restricts it to the browser, while `public` and `s-maxage` allow shared caches like CDNs.

## What are ETags and conditional requests?
An `ETag` is an identifier for a specific version of a resource. The client stores it and later sends `If-None-Match: "<etag>"`; if the resource hasn't changed, the server returns **`304 Not Modified`** with no body, saving bandwidth. `Last-Modified` with `If-Modified-Since` works similarly with timestamps. `If-Match` lets clients avoid overwriting someone else's update.

## What is HTTP keep-alive?
Reusing one TCP (and TLS) connection for multiple HTTP requests instead of opening a new one each time, avoiding repeated handshakes and TCP slow start. It's the default in HTTP/1.1 (`Connection: keep-alive`). Servers and proxies close idle connections after a timeout; a mismatch where the client reuses a connection the server just closed causes sporadic "connection reset" errors.

## WebSockets vs Server-Sent Events
**WebSockets** upgrade an HTTP connection into a persistent, **bidirectional** channel for text or binary frames: suited to chat, games and collaborative editing. **Server-Sent Events** keep a plain HTTP response open and stream **server-to-client** text events, with automatic reconnection and event IDs built in. SSE is simpler and works through most proxies; pick WebSockets when the client must send frequently too.

## What is long polling?
The client makes an HTTP request and the server **holds it open** until it has new data or a timeout passes, then responds; the client immediately sends another request. It approximates server push over plain HTTP and works everywhere, but each message costs a full request/response and servers must hold many pending connections. SSE and WebSockets have largely replaced it.

## What is a CDN?
A **content delivery network** is a set of geographically distributed edge servers that cache and serve content close to users, reducing latency and offloading the origin. Requests are routed to a nearby edge via DNS or anycast. Besides static assets, CDNs terminate TLS, absorb DDoS traffic, and can run code at the edge. Cache keys and invalidation (purging) are the usual pain points.

## What is anycast?
A routing technique where the **same IP address** is announced from many locations, and BGP routing delivers each packet to the topologically nearest one. It's how public DNS resolvers (1.1.1.1, 8.8.8.8), root DNS servers and CDNs serve global traffic from one address, with automatic failover and natural DDoS distribution. It works best for short-lived or stateless traffic.

## What is NAT?
**Network Address Translation** lets many devices on a private network (`192.168.x.x`, `10.x.x.x`) share one public IP. The router rewrites the source address and port of outgoing packets and keeps a table to route replies back. It extended IPv4's life, but it breaks inbound connections to devices behind it, which is why peer-to-peer apps need techniques like STUN and TURN.

## What are MTU and fragmentation?
The **MTU** (maximum transmission unit) is the largest packet a link can carry, typically 1500 bytes on Ethernet. Larger IP packets get fragmented or, with the don't-fragment flag set, dropped with an ICMP message so the sender can lower its size (path MTU discovery). When firewalls block that ICMP, connections can hang on large transfers: a classic VPN and tunnel issue.

## What is TCP congestion control?
TCP limits how much unacknowledged data it sends using a **congestion window** that adapts to the network. **Slow start** grows the window exponentially from a small value until loss or a threshold, after which it grows linearly; packet loss shrinks it. Algorithms include Reno, CUBIC (the Linux default) and BBR, which models bandwidth and RTT instead of reacting to loss.

## What is Nagle's algorithm?
A TCP optimization that buffers small writes until the previous segment is acknowledged, combining them into fewer packets. Combined with **delayed ACKs** on the other side, it can add tens to hundreds of milliseconds of latency to interactive request/response traffic. Latency-sensitive apps disable it with the `TCP_NODELAY` socket option, which most HTTP clients and databases do.

## Reverse proxy vs forward proxy
A **forward proxy** sits in front of **clients** and makes requests on their behalf: corporate egress filtering, anonymity, caching. Servers see the proxy, not the client. A **reverse proxy** sits in front of **servers** and receives requests on their behalf: nginx, HAProxy, load balancers and CDNs doing TLS termination, routing and caching. Clients see the proxy, not the backends.

## What do 502, 503 and 504 mean?
All signal server-side trouble, often surfaced by a proxy. **502 Bad Gateway**: the proxy got an invalid response or connection failure from the upstream. **503 Service Unavailable**: the server is overloaded or in maintenance; it may send `Retry-After`. **504 Gateway Timeout**: the proxy didn't get a response from the upstream in time. Knowing which one tells you where to look.
