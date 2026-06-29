# Networking & Protocols

**What you'll learn.** How data actually moves between a browser and a server - from the IP packet up through TCP, TLS, and the HTTP family (1.1 / 2 / 3) - and how every layer adds or removes round-trips that you can *count*. By the end you'll be able to reason about why a cold HTTPS request costs ~3–4 RTTs, why HTTP/2 fixed one head-of-line-blocking problem but not the deeper one, and when to reach for WebSockets vs SSE vs gRPC streaming.

**Prerequisites.** Read [`01-foundations-and-estimation.md`](./01-foundations-and-estimation.md) first - specifically the latency-numbers table. This module constantly converts protocol behaviour into *round-trips*, and a round-trip is only meaningful if you've internalised that a same-region RTT is ~0.5–1 ms, cross-US ~40 ms, and cross-Atlantic ~80–140 ms. Networking is the dominant tax on user-perceived latency, and almost all of that tax is *round-trips × RTT*.

---

## 1. The mental model: layers and the "round-trip tax"

The single most useful framing for a senior engineer: **latency is mostly counted in round-trips, and each protocol layer adds a fixed number of them before any useful byte flows.** Bandwidth rarely limits a small request; the speed of light and the number of handshakes do.

A cold request to `https://api.example.com` from a fresh browser:

```
DNS lookup        ~1 RTT (often more; uncached)
TCP handshake     1 RTT  (SYN / SYN-ACK / ACK)
TLS 1.2 handshake 2 RTT  (TLS 1.3: 1 RTT, or 0 with resumption)
HTTP request      1 RTT  (send request, get first byte)
-----------------------------------------------------
Total before data ~5 RTT cold, ~1 RTT warm
```

At 80 ms cross-Atlantic RTT, that cold path is ~400 ms *before the server even starts working*. This is why connection reuse, TLS resumption, CDNs (shorter RTT), and HTTP/3 (fewer handshakes) all matter so much - they each shave whole RTTs.

### OSI vs TCP/IP

OSI is the 7-layer teaching model; the real internet runs the 4-layer TCP/IP model. Know the mapping because interviewers and RFCs use both.

| OSI layer | TCP/IP layer | What lives here | Examples |
|-----------|--------------|-----------------|----------|
| 7 Application / 6 Presentation / 5 Session | Application | App protocols, encryption, serialization | HTTP, gRPC, DNS, TLS* |
| 4 Transport | Transport | Ports, reliability, ordering | TCP, UDP, QUIC* |
| 3 Network | Internet | Addressing, routing | IP, ICMP, BGP |
| 2 Data Link / 1 Physical | Link | Frames on the wire | Ethernet, Wi-Fi |

\*TLS is awkward: it sits between transport and application. QUIC blurs it further - it runs *over UDP* but absorbs TLS and parts of TCP's job into the application layer (userspace). Keep that in mind; it's the key to understanding HTTP/3.

**Encapsulation:** each layer wraps the one above. `[Ethernet [ IP [ TCP [ TLS [ HTTP ] ] ] ] ]`. Routers read IP headers; switches read Ethernet; the server's kernel reassembles TCP; userspace decrypts TLS and parses HTTP.

---

## 2. Transport layer: TCP vs UDP

### TCP - reliable, ordered, connection-oriented

TCP gives you a **reliable, in-order byte stream** over an unreliable packet network. It achieves this with sequence numbers, acknowledgements (ACKs), retransmission of lost segments, and a checksum. It also adds **flow control** (don't overrun the receiver) and **congestion control** (don't overrun the network). All of this costs round-trips and head-of-line blocking - the price of reliability.

### UDP - fire and forget

UDP is a thin wrapper over IP: just ports and a checksum. No handshake, no ordering, no retransmission, no congestion control. You get datagrams that may arrive out of order, duplicated, or not at all. That's a *feature* when you'd rather drop a late packet than wait for it (live audio/video, gaming) - and it's the foundation QUIC builds reliability on top of *in userspace*, so it can iterate faster than kernel TCP.

| Dimension | TCP | UDP | When to choose |
|-----------|-----|-----|----------------|
| Connection | Yes (handshake) | None | TCP for request/response; UDP for one-shot/streaming |
| Reliability | Guaranteed delivery + retransmit | None | TCP when every byte matters (web, DB, files) |
| Ordering | In-order byte stream | No ordering | TCP for streams; UDP when app reorders or doesn't care |
| Head-of-line blocking | Yes (one lost segment stalls all) | No | UDP for media where a late frame is useless |
| Congestion control | Built-in | App's job | TCP for fairness; UDP must add its own (QUIC does) |
| Overhead | 20-byte header + handshake | 8-byte header | UDP for latency-critical small messages |
| Multiplexing | One stream per connection | Per-datagram | - |
| Examples | HTTP/1-2, TLS, SSH, DB | DNS, QUIC/HTTP3, VoIP, gaming, video | DNS uses UDP, falls back to TCP for large responses |

### The TCP 3-way handshake

```
Client                          Server
  |  SYN  seq=x                    |   "I want to talk, my seq starts at x"
  |  ───────────────────────────► |
  |        SYN-ACK seq=y, ack=x+1  |   "OK, my seq is y, I got your x"
  |  ◄─────────────────────────── |
  |  ACK ack=y+1                   |   "Got it, let's go"
  |  ───────────────────────────► |
  |  [connection ESTABLISHED]      |
  |  ── application data ───────►  |   (data can ride on the 3rd packet)
```

That's **1 full RTT** before you can send data. The client and server also negotiate the **Maximum Segment Size (MSS)** and options like window scaling and SACK here. *TCP Fast Open (TFO)* can carry data on the SYN to save the RTT on repeat connections, but middlebox breakage limited its adoption.

### Connection teardown

```
Client                          Server
  |  FIN  ──────────────────────► |   "I'm done sending"
  |  ◄────────────────────── ACK  |
  |  ◄────────────────────── FIN  |   "I'm done too"
  |  ACK ───────────────────────► |
  |  [client enters TIME_WAIT ~2*MSL, ~60s]
```

The four-way close exists because each side closes its half independently. The gotcha: the side that closes first sits in **TIME_WAIT** (~60 s) to absorb stray late packets and prevent old segments contaminating a new connection on the same 4-tuple. On a busy load balancer or proxy that opens/closes many short connections, you can exhaust ephemeral ports with tens of thousands of sockets stuck in TIME_WAIT - a classic production failure (see war stories).

### Flow control vs congestion control

These are different and frequently confused.

- **Flow control** protects the *receiver*. The receiver advertises a **receive window (rwnd)** in every ACK ("I have room for N more bytes"). The sender never sends more unacked data than the window. A slow consumer naturally throttles a fast producer.

- **Congestion control** protects the *network*. The sender maintains a **congestion window (cwnd)** and probes for available bandwidth, treating packet loss (or, in modern algorithms, delay) as the signal to back off. Effective send window = `min(rwnd, cwnd)`.

**Slow start:** a new connection doesn't know the available bandwidth, so it starts with a small cwnd (historically ~10 MSS ≈ ~14 KB, per RFC 6928) and **doubles cwnd every RTT** until it hits a threshold (`ssthresh`) or loss. This is why a brand-new connection is slow even on a fat pipe - and why **connection reuse is so valuable**: an established, warmed-up connection already has a large cwnd. After `ssthresh`, it switches to **congestion avoidance** (linear growth). On loss it backs off (multiplicative decrease - "AIMD").

**Algorithms:** Reno/CUBIC (loss-based; CUBIC is the Linux default) vs **BBR** (Google; models bottleneck bandwidth + RTT, doesn't wait for loss - much better on lossy/high-BDP links and widely deployed on YouTube/GCP).

**Bandwidth-Delay Product (BDP):** `BDP = bandwidth × RTT`. This is the amount of data "in flight" to keep a pipe full. Example: 100 Mbps × 80 ms = `12.5 MB/s × 0.08 s ≈ 1 MB`. If your TCP window (rwnd, capped without **window scaling**) is smaller than the BDP, you *cannot* saturate the link no matter the bandwidth - the sender stalls waiting for ACKs. High-BDP "long fat networks" (satellite, transcontinental) need window scaling enabled (it is, by default, since ~2 decades) and benefit hugely from BBR.

---

## 3. TLS: encryption and its handshake cost

TLS sits on top of TCP (for HTTP/1-2) and provides confidentiality, integrity, and authentication (the server proves identity via an X.509 certificate signed by a CA). The handshake is where the RTTs go.

### TLS 1.2 - 2 RTTs

```
Client                                   Server
  | ClientHello (ciphers, random)         |
  | ─────────────────────────────────────►|
  | ServerHello, Certificate,             |
  | ServerKeyExchange, ServerHelloDone    |
  | ◄─────────────────────────────────────|
  | ClientKeyExchange, ChangeCipherSpec,  |
  | Finished                               |
  | ─────────────────────────────────────►|
  | ChangeCipherSpec, Finished            |
  | ◄─────────────────────────────────────|
  | [encrypted application data]          |
```

Two round-trips *on top of* the TCP handshake. Cold HTTPS = 1 (TCP) + 2 (TLS) = 3 RTTs before the HTTP request.

### TLS 1.3 - 1 RTT, or 0-RTT resumption

TLS 1.3 (RFC 8446) is a major redesign: it removed legacy ciphers, made forward secrecy mandatory (ephemeral Diffie-Hellman only), and **cut the handshake to 1 RTT** by having the client *guess* the key-share in its first message.

```
Client                                   Server
  | ClientHello + key_share               |
  | ─────────────────────────────────────►|
  | ServerHello + key_share, {Cert,       |
  | Finished}  (encrypted)                 |
  | ◄─────────────────────────────────────|
  | {Finished} + [application data]       |
  | ─────────────────────────────────────►|
```

**0-RTT resumption:** on a *return* visit, the client can send application data in its very first packet using a pre-shared key (PSK) from the prior session. Zero handshake RTTs. The catch: **0-RTT data is replayable** - an attacker can capture and resend it. So 0-RTT is safe only for idempotent requests (a GET, never a "transfer $100"). Treat 0-RTT requests as untrusted-for-replay at the application layer.

| | TLS 1.2 | TLS 1.3 |
|---|---|---|
| Handshake RTTs | 2 | 1 (0 on resumption) |
| Forward secrecy | Optional | Mandatory (ephemeral DH) |
| Cipher suites | Many, some weak | Small, all AEAD |
| Resumption | Session IDs/tickets | PSK, 0-RTT |
| Replay risk | - | 0-RTT data is replayable |

### TLS termination & mTLS

**TLS termination** = where encryption ends. Usually at the load balancer / CDN edge (e.g., AWS ALB, Cloudflare, an Nginx/Envoy proxy), which decrypts and forwards plaintext (or re-encrypts) to backends. Terminating at the edge offloads CPU from app servers and centralises certificate management - but the internal hop is now plaintext unless you re-encrypt. **TLS passthrough** forwards encrypted bytes to the backend (needed when the backend must see the client cert).

**mTLS (mutual TLS):** *both* sides present certificates. The server verifies the client's cert too. This is the backbone of zero-trust service-to-service auth in service meshes (Istio/Linkerd via Envoy sidecars) - every internal call is mutually authenticated and encrypted, removing the "trusted network" assumption. Cost: cert issuance/rotation infrastructure (e.g., SPIFFE/SPIRE) and the extra handshake work.

---

## 4. DNS: turning names into addresses

Before any TCP handshake, the client must resolve the hostname. The resolution path:

```
Browser cache → OS cache → Recursive resolver (ISP / 1.1.1.1 / 8.8.8.8)
   → Root nameserver (.)        "ask the .com servers"
   → TLD nameserver (.com)      "ask example.com's authoritative NS"
   → Authoritative NS           "example.com = 93.184.216.34"
   → answer cached per TTL, returned to browser
```

A fully cold lookup can be multiple RTTs to different servers; in practice the recursive resolver caches aggressively, so most lookups are ~1 RTT or served from cache. **TTL** controls cache lifetime - low TTLs enable fast failover/rebalancing but increase lookup load and resolver pressure.

**DNS as a load balancer / GeoDNS:** the authoritative server can return *different answers* based on the resolver's location (GeoDNS) or in round-robin/weighted fashion. This is how providers like AWS Route 53 (latency-based, geolocation, weighted routing), Cloudflare, and NS1 do global traffic steering. Limitation: DNS-based LB is coarse - caching and TTL mean you can't react instantly, and you balance per-*resolver*, not per-user. That's why anycast (below) is often preferred for the finest-grained, fastest steering.

**DoH/DoT** (DNS over HTTPS/TLS) encrypt the lookup for privacy. Modern apps and browsers increasingly default to them.

---

## 5. CDNs and anycast

A **CDN** (Cloudflare, Akamai, Fastly, AWS CloudFront, Google Cloud CDN) places content close to users at hundreds of edge **PoPs (points of presence)**. The win is twofold: (1) **shorter RTT** - serving from a PoP 5 ms away instead of an origin 120 ms away collapses every handshake RTT and every congestion-control RTT; (2) **offload** - the origin sees only cache misses. Reread the round-trip math in §1: a CDN that cuts RTT from 120 ms to 5 ms makes the *entire* cold path 24× cheaper.

**Anycast** is the routing trick that makes this work: the *same IP address* is announced from many PoPs via BGP, and the internet's routing naturally sends each client to the topologically nearest PoP. Unlike GeoDNS, anycast steers at the *network* layer with no DNS-cache lag and provides instant failover (withdraw a PoP's BGP announcement and traffic reroutes). Cloudflare and Google's frontends are built on anycast. The historical caveat - TCP connections could in theory flap between PoPs mid-flow - is handled by stable routing and connection-aware edges.

CDNs also do **edge TLS termination** and increasingly **edge compute** (Cloudflare Workers, Lambda@Edge, Fastly Compute) - running logic at the PoP so even dynamic responses skip the origin round-trip.

---

## 6. The HTTP family

### Keep-alive & connection pooling

HTTP/1.0 opened a new TCP+TLS connection per request - catastrophic given §1's RTT tax. **HTTP/1.1 keep-alive** (`Connection: keep-alive`, default) reuses the connection for many requests, amortising the handshake *and* keeping cwnd warm. **Connection pooling** is the client-side counterpart: browsers keep ~6 connections per origin; backend HTTP clients (and DB drivers - see [`05-databases-and-storage.md`](./05-databases-and-storage.md)) maintain a pool to avoid per-call handshakes. Pool sizing is a real tuning problem: too small → queueing; too large → resource exhaustion and connection storms on restart.

### HTTP/1.1's flaw: head-of-line blocking

On a single HTTP/1.1 connection, responses must come back **in request order**. A slow first response blocks every response behind it - **HOL blocking at the HTTP layer**. The 1990s workaround was "pipelining" (rarely worked due to proxies) and "domain sharding" (spread assets over many hostnames to get more parallel connections - an ugly hack that fights congestion control).

### HTTP/2: multiplexing over one connection

HTTP/2 (RFC 7540) keeps the HTTP semantics but changes the wire format: it's **binary** and splits everything into **frames** belonging to numbered **streams**. Many streams multiplex over **one TCP connection**, interleaved, so a slow response no longer blocks others *at the HTTP layer*. It adds **header compression (HPACK)** (HTTP headers are hugely repetitive) and **stream prioritisation**. Server push existed but was a flop and is deprecated.

**But HTTP/2 still suffers TCP head-of-line blocking.** All those streams share *one* TCP byte stream. If a single TCP segment is lost, the kernel holds back *all* subsequent bytes - for *every* multiplexed stream - until the retransmission arrives, because TCP guarantees in-order delivery to the application. On a clean network HTTP/2 is great; on a lossy mobile link, one lost packet stalls all your "parallel" streams. This is the deeper HOL problem HTTP/2 *couldn't* solve, because it lives below HTTP, in TCP.

### HTTP/3: QUIC kills TCP head-of-line blocking

HTTP/3 (RFC 9114) runs over **QUIC** (RFC 9000), which runs over **UDP**. QUIC reimplements reliability, ordering, congestion control, and TLS 1.3 *in userspace*, with streams as first-class citizens. Because QUIC understands streams natively, **a lost packet only stalls the stream it belonged to** - other streams keep flowing. That's the fix HTTP/2 couldn't make.

Other QUIC wins:
- **Faster handshake:** transport + TLS 1.3 are combined into **1 RTT** (0-RTT on resumption). No separate TCP-then-TLS staircase.
- **Connection migration:** a QUIC connection is identified by a **Connection ID**, not the IP/port 4-tuple. Switch from Wi-Fi to cellular and the connection survives the IP change - no re-handshake. Huge for mobile.
- Always encrypted; harder for middleboxes to ossify/interfere.

Downsides: UDP is sometimes throttled/blocked by firewalls (so clients fall back to TCP/HTTP2), and userspace congestion control historically cost more CPU than kernel TCP (improving with offload).

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Transport | TCP | TCP | QUIC over UDP |
| Wire format | Text | Binary frames | Binary frames |
| Concurrency | 1 req/response per conn (~6 conns) | Multiplexed streams, 1 conn | Multiplexed streams, 1 conn |
| HOL blocking | HTTP-layer (per conn) | TCP-layer only | None (per-stream loss isolation) |
| Header compression | None | HPACK | QPACK |
| Handshake RTTs (cold) | TCP + TLS (3) | TCP + TLS (3) | 1 (combined), 0 on resume |
| Connection migration | No | No | Yes (Connection ID) |
| When to use | Legacy/simple, debuggable | Default for most HTTPS sites | Lossy/mobile networks, latency-critical CDNs |

Practical note: you usually don't *choose* - you enable all three at the edge (CDN/LB) and clients negotiate the best via ALPN (in TLS) and the `Alt-Svc` header (advertises HTTP/3). Cloudflare, Google, Meta serve HTTP/3 broadly today.

---

## 7. Real-time: WebSocket vs SSE vs polling vs gRPC

HTTP is request/response. For server→client push you need something else. (See [`07-real-time-and-messaging.md`](./07-real-time-and-messaging.md) for the messaging side.)

- **Short polling:** client asks "anything new?" every N seconds. Simple, but wasteful (most responses are empty) and latency = polling interval.
- **Long polling:** client request *hangs open* until the server has data (or times out), then immediately re-requests. Lower latency, fewer empty responses, but a held connection per client and re-request overhead.
- **Server-Sent Events (SSE):** a single long-lived HTTP response that the server keeps writing to (`text/event-stream`). **One-directional** (server→client only), text-only, but dead simple, rides ordinary HTTP/2, and the browser `EventSource` auto-reconnects with `Last-Event-ID`. Great for notifications, live feeds, dashboards, LLM token streaming.
- **WebSocket:** a full **bidirectional** binary/text channel. Starts as an HTTP request with `Upgrade: websocket`, then the connection is "upgraded" off HTTP into a raw framed duplex socket. Best for chat, multiplayer, collaborative editing, trading. Cost: it's not plain HTTP, so proxies/LBs need WS support, and you manage your own reconnect/heartbeat/backpressure.

```
WebSocket upgrade:
Client → GET /ws  Upgrade: websocket, Sec-WebSocket-Key: ...
Server → 101 Switching Protocols, Sec-WebSocket-Accept: ...
        [now a bidirectional frame stream, no more HTTP]
```

| | Short poll | Long poll | SSE | WebSocket |
|---|---|---|---|---|
| Direction | C→S, pull | C→S, pull (held) | S→C only | Bidirectional |
| Transport | HTTP | HTTP | HTTP (1 conn) | TCP via HTTP upgrade |
| Latency | = interval | low | low | lowest |
| Server cost | high (empty reqs) | held conns | held conns | held conns |
| Auto-reconnect | n/a | manual | built-in (EventSource) | manual |
| Binary | no | no | no (text) | yes |
| Proxy/LB friendliness | trivial | easy | easy | needs WS support |
| When to use | trivial/legacy | fallback | feeds, notifications, LLM streaming | chat, games, collab, trading |

### gRPC over HTTP/2

gRPC is a binary RPC framework using **Protocol Buffers** (compact, schema-typed) over **HTTP/2**. It leans on HTTP/2 multiplexing and supports four call types: **unary** (request/response), **server streaming**, **client streaming**, and **bidirectional streaming** - all over a single connection's streams. It's the default for internal service-to-service comms (low overhead, strong contracts, code-gen, deadlines/cancellation propagation). Caveats: HTTP/2 is required, so it doesn't run natively in browsers - you need **gRPC-Web** (a proxy like Envoy translates) for browser clients. Compared to JSON/REST, gRPC trades human-readability for size, speed, and schema enforcement (see [`08-apis-and-communication.md`](./08-apis-and-communication.md)).

---

## 8. Common pitfalls / war stories

- **TIME_WAIT port exhaustion.** A proxy or a service mesh sidecar opening a fresh short-lived connection per request piles up tens of thousands of sockets in TIME_WAIT and exhausts ephemeral ports → new connections fail with `EADDRNOTAVAIL`. Fix: **reuse connections (keep-alive / pooling)**, raise the ephemeral port range, enable `tcp_tw_reuse`. The real fix is almost always "stop opening so many connections."

- **HTTP/2 made things *slower* on flaky mobile.** Teams enable HTTP/2, multiplex 100 streams over one TCP connection, then a single packet loss on a 4G link stalls *all* of them via TCP HOL blocking - sometimes worse than HTTP/1.1's 6 independent connections (loss on one doesn't block the others). The fix is HTTP/3/QUIC, not more HTTP/2 tuning.

- **DNS TTL too high during a migration/failover.** You change the IP but resolvers (and stubborn clients/JVMs that cache DNS forever) keep hitting the dead origin for hours. Set low TTLs *before* a planned cutover; for instant failover prefer anycast or a health-checked LB behind a stable IP.

- **0-RTT replay.** A team enabled TLS 1.3 0-RTT for "speed" and an attacker replayed a captured early-data request. 0-RTT is replayable by design - never put non-idempotent operations on the 0-RTT path.

- **TLS terminated at the LB, plaintext inside.** "We're HTTPS!" - but the LB→app hop was plaintext over a shared VPC, and an internal foothold could sniff it. Re-encrypt internal hops or adopt mTLS for service-to-service.

- **Slow start tax on serverless / per-request connections.** Functions that open a fresh DB or HTTP connection per invocation pay the full handshake + cold cwnd every time. Persistent connection pools (or proxies like RDS Proxy / PgBouncer) keep windows warm.

- **WebSocket through a "smart" proxy.** A load balancer that doesn't honour `Upgrade` silently downgrades or kills WS connections; idle-timeout proxies drop long-lived WS/SSE without heartbeats. Add app-level pings and configure LB idle timeouts above your heartbeat interval.

---

## 🧩 Case Study: Cloudflare's HTTP/3 + QUIC + anycast edge

**The problem.** Cloudflare runs a reverse-proxy CDN sitting in front of millions of websites, serving on the order of tens of millions of HTTP requests *per second* across 300+ PoPs in 100+ countries. A huge slice of that traffic is mobile - phones on lossy 4G/5G links, behind carrier NAT, hopping between Wi-Fi and cellular. For those users the dominant cost is exactly the **round-trip tax from §1**: a cold HTTPS page load was paying DNS + TCP(1) + TLS(2) = ~3 RTTs of handshake *before the first byte*, and on a 2–5% packet-loss mobile link, HTTP/2's "parallel" streams were stalling on **TCP head-of-line blocking** (§6) - sometimes performing *worse* than HTTP/1.1's six independent connections. The challenge: cut the handshake RTTs, kill the HOL stall on lossy links, and survive the IP changes mobile clients constantly suffer - at planet scale, without asking site owners to do anything.

**Applying the module's concepts.**

*Anycast routing (§5) gets the client to a near PoP with no DNS lag.* Cloudflare announces the *same* IP from every PoP via BGP, so a client's packets reach the topologically nearest edge automatically. This is the **anycast pattern from the CDN section**: steering happens at the network layer, instantly, with no TTL/cache delay - so the RTT that *every* subsequent handshake is multiplied by is already as small as the network allows (often single-digit ms instead of 100+ ms to origin).

*HTTP/3 / QUIC (§6) collapses the handshake and removes TCP HOL blocking.* Once the packet lands at a near PoP, QUIC's combined transport+TLS-1.3 handshake replaces the TCP-then-TLS staircase, turning ~3 cold RTTs into **1 RTT - and 0-RTT on resumption** for returning visitors (exactly the **0-RTT resumption** described in §3 and the QUIC wins in §6). Because QUIC streams are first-class at the transport layer, **a lost packet only stalls its own stream** - the precise fix HTTP/2 *couldn't* make because it lived above TCP. On a lossy mobile link, the other in-flight responses keep flowing.

*Connection reuse + migration (§2, §6) keep the warmed-up path alive.* A QUIC connection is keyed by a **Connection ID**, not the IP/port 4-tuple, so when a phone switches Wi-Fi→cellular the connection - and its warmed-up congestion window (the **slow-start tax** from §2 already paid) - *survives the IP change* with no re-handshake. This is connection reuse taken to its logical extreme: not just amortising one handshake, but preserving it across network changes.

```
        Phone on 4G (2-5% loss)
                 │  same anycast IP announced by every PoP via BGP
                 ▼
        ┌──────────────────────┐   nearest PoP, ~5ms RTT (not 120ms to origin)
        │  Cloudflare edge PoP  │
        │  ┌────────────────┐   │   QUIC/UDP:443
        │  │ QUIC + TLS 1.3 │   │   1-RTT cold, 0-RTT resume
        │  │  Conn-ID keyed │   │   stream-isolated loss recovery
        │  └────────────────┘   │
        └──────────┬───────────┘
                   │ cache HIT → served from edge (origin never touched)
                   │ cache MISS → warm pooled conn to origin
                   ▼
              Origin server

  Loss of one UDP packet:
    HTTP/2 over TCP →  ▓▓▓░░░░  ALL streams stall (TCP HOL)
    HTTP/3 over QUIC → ▓▓▓░▓▓▓  only the affected stream stalls
  Phone switches Wi-Fi→cellular (IP changes):
    TCP  → 4-tuple invalid → full re-handshake (3 RTTs lost)
    QUIC → Connection ID unchanged → connection continues, 0 RTTs
```

**The trade-off they accepted.** QUIC runs in **userspace over UDP**, which costs noticeably more CPU than kernel TCP - early on, several times the per-byte send cost - and UDP is throttled or blocked by some firewalls and carrier middleboxes. Cloudflare accepted both: they invested heavily in optimising userspace congestion control and UDP send paths (GSO/segmentation offload, eBPF), and they **fail back gracefully** - clients that can't get UDP/443 through fall straight back to HTTP/2 over TCP. The bet was that the latency win for the majority on clean-enough networks outweighs the CPU cost and the fallback minority. They also accepted 0-RTT's **replay risk** (§3) by gating early-data to idempotent requests at the edge.

**Results.** Cloudflare reported HTTP/3 reaching first-byte and page-load improvements most pronounced exactly where the theory predicts - high-latency, high-loss connections, where eliminating TCP HOL blocking and saving handshake RTTs compound. Independent and Cloudflare measurements have shown meaningful tail-latency (p95/p99) reductions on lossy/mobile networks, with the largest wins on the slowest connections; connection migration eliminated reconnection stalls for users moving between networks. The handshake itself dropped from ~3 cold RTTs to 1 (0 on resume) - at 80 ms cross-region RTT that alone is ~160 ms shaved off a cold visit before any caching benefit.

### Lessons
- **Latency wins come from removing whole round-trips, not shaving milliseconds.** Anycast (near PoP), QUIC's 1-RTT/0-RTT handshake, and connection migration each eliminate *entire RTTs* - the highest-leverage optimisation per §1's round-trip math.
- **Solve a problem at the layer it actually lives in.** HTTP/2's HOL stall was a *TCP* problem; no amount of HTTP tuning fixed it. Moving reliability into userspace QUIC was the only place the fix could go.
- **A faster default protocol still needs a fallback.** UDP isn't universally allowed, so HTTP/3 is offered (via `Alt-Svc`/ALPN) with automatic TCP fallback - never a hard cutover that strands users.
- **Identity beats addressing for mobile.** Keying a connection by a stable Connection ID instead of the IP 4-tuple is what makes seamless network switching possible - a generalisable idea wherever endpoints roam.

## 9. Test yourself

1. **Count the RTTs** for a cold `https://` GET over TLS 1.2/HTTP1.1 vs a warm connection. *(Hint: DNS + TCP(1) + TLS1.2(2) + request(1); warm reuses TCP+TLS so ≈1.)*
2. Explain why HTTP/2 fixes HTTP-layer head-of-line blocking but **not** TCP-layer HOL blocking, and how HTTP/3 fixes the latter. *(Hint: streams share one ordered TCP byte stream; QUIC makes streams independent at the transport layer.)*
3. What is the bandwidth-delay product of a 1 Gbps link with 50 ms RTT, and why does it matter for your TCP window? *(Hint: 125 MB/s × 0.05 s ≈ 6.25 MB in flight; a smaller window can't fill the pipe.)*
4. Why is TLS 1.3 0-RTT data unsafe for a "purchase" request but fine for fetching a product image? *(Hint: early data is replayable; idempotency.)*
5. Contrast GeoDNS and anycast for global load balancing. Which reacts faster to a PoP failure and why? *(Hint: DNS caching/TTL lag vs BGP-level steering.)*
6. When would you pick SSE over WebSocket, and vice versa? *(Hint: one-way push + auto-reconnect simplicity vs bidirectional/binary.)*
7. Why does opening a new connection per request hurt even on a fast network with no DNS cost? *(Hint: handshake RTTs + cold congestion window / slow start.)*
8. Your gRPC service works server-to-server but won't work from a browser. Why, and what's the fix? *(Hint: browsers can't speak raw HTTP/2 framing/trailers; gRPC-Web + Envoy proxy.)*

---

## 10. Further reading

- **Ilya Grigorik, *High Performance Browser Networking*** (O'Reilly, free online) - the definitive practical text on TCP, TLS, HTTP/1-2, WebSocket, and the RTT-counting mindset used throughout this module.
- **RFCs:** 9293 (TCP), 8446 (TLS 1.3), 9000 (QUIC), 9114 (HTTP/3), 7540 (HTTP/2), 6298 (TCP retransmission), 6928 (initial window), 6455 (WebSocket).
- **DDIA (Kleppmann), *Designing Data-Intensive Applications*** - networking assumptions behind distributed systems (unreliable networks, timeouts) in Ch. 8.
- **Cloudflare & Google blogs** on QUIC/HTTP/3, BBR, and anycast - excellent real-world deployment writeups.
- Siblings: [`01-foundations-and-estimation.md`](./01-foundations-and-estimation.md) (latency numbers), [`05-databases-and-storage.md`](./05-databases-and-storage.md) (connection pooling), [`07-real-time-and-messaging.md`](./07-real-time-and-messaging.md), [`08-apis-and-communication.md`](./08-apis-and-communication.md).
