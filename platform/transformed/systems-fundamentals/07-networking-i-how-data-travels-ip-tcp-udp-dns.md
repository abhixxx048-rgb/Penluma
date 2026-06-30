---
title: 'How Data Travels the Internet: IP, TCP, UDP & DNS'
metaTitle: 'How the Internet Works: IP, TCP, UDP, DNS'
description: >-
  A clear, practical guide to how data travels the internet: IP, TCP, UDP, and
  DNS explained in plain language so you can debug slow, hung, and flaky apps.
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 6
icon: ⚙️
keywords:
  - how the internet works
  - TCP vs UDP
  - what is DNS
  - IP address explained
  - TCP three-way handshake
  - how data travels over the internet
  - what happens when you type a URL
  - connection refused meaning
  - DNS TTL propagation
  - QUIC and HTTP/3
  - ports and sockets explained
  - networking for developers
faq:
  - q: What is the difference between TCP and UDP?
    a: >-
      TCP guarantees that every byte arrives in order, using a handshake,
      acknowledgements, and retransmission. UDP just fires packets off with no
      promises. Use TCP for web pages, APIs, and downloads; use UDP for voice,
      video, games, and DNS, where a late packet is useless anyway.
  - q: What does "connection refused" actually mean?
    a: >-
      It means your packet reached the machine, but no program was listening on
      that IP and port. The host is up; the service you wanted is not running,
      crashed, or is on a different port. It is different from a timeout, which
      means nothing answered at all.
  - q: Why does a DNS change take so long to "propagate"?
    a: >-
      Because old answers are cached for the length of their TTL (Time To Live).
      Resolvers keep serving the old IP until that timer expires. Lower the TTL
      a day or two before a planned change so caches refresh quickly at cutover.
  - q: What is the difference between an IP address and a port?
    a: >-
      The IP address gets data to the right machine, like a building's street
      address. The port gets it to the right program on that machine, like the
      apartment number. You need both, written as IP:port, to reach a service.
  - q: What happens when you type a URL and press Enter?
    a: >-
      The browser parses the URL, looks up the domain via DNS, opens a TCP
      connection, sets up TLS encryption, sends an HTTP request, and renders the
      response, usually triggering many more lookups and connections for images,
      CSS, and scripts.
  - q: Is UDP unreliable and therefore worse than TCP?
    a: >-
      No. UDP trades reliability for speed on purpose. Skipping handshakes and
      retransmission means lower latency, which is exactly what live voice,
      video, and gaming need, where a delayed packet is worse than a missing one.
author: Brexis Wazik
transformed: true
polished: true
linked: true
sources:
  - https://en.wikipedia.org/wiki/Internet_protocol_suite
  - https://en.wikipedia.org/wiki/Transmission_Control_Protocol
  - https://en.wikipedia.org/wiki/Domain_Name_System
---

A request hangs for thirty seconds and then dies. Another fails instantly with "connection refused." A change you made to a domain works on your laptop but not your phone. These are not random gremlins. They are the network behaving exactly as designed, and once you understand the four pieces underneath every app, the weird stuff stops being weird.

Every distributed app is just programs on different machines talking over a network. When your code [calls a database](/blog/systems-fundamentals/04-databases-i-relational-databases-sql-acid), hits an API, reads a cache, or asks one microservice to talk to another, that is bytes leaving one machine and, hopefully, arriving at another.

## Why this matters

Here is the uncomfortable truth that shapes this entire field: the network is the one part you can never make perfectly reliable. Messages get lost, duplicated, reordered, or delayed in ways nobody can predict.

Almost every [hard problem in distributed systems](/blog/distributed-systems/13-why-distributed-systems-are-hard) traces back to this. Timeouts, retries, consistency, latency budgets, that one intermittent bug nobody can reproduce, all of it grows out of how the network actually behaves.

So if you understand **IP**, **TCP**, **UDP**, and **DNS**, you can reason about *why* a service is slow, *why* a request hangs forever, and what a cryptic error really means. That is the difference between guessing at outages and actually fixing them.

## The big idea: layers that stack like envelopes

Networking is built in **layers**. A layer is one level of responsibility. Each one solves a single problem and trusts the layer below it to handle the rest. The part that encrypts your data does not need to know anything about how Wi-Fi works.

The classic teaching diagram is the OSI 7-layer model, but real internet software uses the simpler **TCP/IP 4-layer model**, so that is what we will use because it matches reality.

| Layer | Its one job | Examples |
|---|---|---|
| Application | Speak the app's language | HTTP, DNS, email |
| Transport | Deliver to the right program | TCP, UDP, QUIC |
| Internet | Move data between machines across networks | IP |
| Link | Move bits across one physical hop | Ethernet, Wi-Fi |

Think of mailing a letter as a parcel inside a parcel inside a parcel. Your HTTP request is the **letter**. TCP wraps it in an envelope that adds port numbers and reliability. IP wraps *that* in an envelope with the source and destination addresses. The link layer wraps it once more with the hardware address for the next hop.

This wrapping has a name: **encapsulation**. Each layer adds its own small header of control information around the data from above. The receiving machine unwraps in reverse, and each layer reads only its own header and ignores the rest.

If you remember one thing from this whole article, make it this. Encapsulation is the master key to networking.

## Packets: why data gets chopped up

Data is not sent as one giant blob. It is chopped into small pieces called **packets**. Each packet carries a header (addresses, length, control fields) plus a slice of your actual data.

Why bother chopping it up? Three reasons:

1. **Fair sharing.** Many conversations share one wire instead of one huge transfer hogging it.
2. **Cheap recovery.** If a small piece is lost, only that piece is resent, not the whole file.
3. **Flexible routing.** Different packets can take different paths to the same destination.

Each link has a **Maximum Transmission Unit (MTU)**, the largest payload it carries in one frame. On typical Ethernet that is about **1500 bytes**. Send something bigger and it either gets split up or silently dropped. This is exactly why large DNS answers sent over UDP fall back to TCP: they no longer fit in a single packet.

## IP: addresses and routing, with no promises

**IP (Internet Protocol)** has one job: get a packet from the source machine to the destination machine across many connected networks.

The crucial part: IP is **best-effort and connectionless**. "Best-effort" means it tries but promises nothing. "Connectionless" means there is no setup conversation first; each packet travels on its own. IP does not guarantee delivery, does not guarantee order, and does not prevent duplicates.

That sounds broken, but it is deliberate. Keep the core of the internet dumb and fast, and push reliability out to the edges, to TCP, which we will meet shortly.

### IPv4 vs IPv6

- **IPv4** is 32 bits, written as four numbers from 0 to 255, like `142.250.72.110`. That gives about 4.3 billion addresses, far too few for today's internet. The central pool ran dry in 2011.
- **IPv6** is 128 bits, written as eight groups of hex, like `2001:db8::1` (the `::` collapses a run of zero groups). The address space is astronomically large. As of 2025, global adoption sits under half, so this is a slow, decades-long transition.

Do not assume "everyone is on IPv6 now." With adoption under 50%, dual-stack setups and shared IPv4 are still everyday reality.

### Subnets and CIDR

An IP address splits into a **network part** (which network you are on) and a **host part** (which machine within it). **CIDR notation** writes this as an address plus a slash-number.

For example, `192.168.1.0/24` means "the first 24 bits are the network, the rest is the host." With 32 total bits, 8 are left for hosts, giving 256 addresses from `192.168.1.0` to `192.168.1.255`. A `/24` is a common home-network size.

Grouping machines into **subnets** lets **routers** make decisions by network prefix instead of memorizing every machine. Routing is **hop-by-hop**: each router checks its routing table, picks the next hop, and forwards. No single router knows the whole path. The `traceroute` tool reveals these hops one by one.

### Private addresses and NAT

Some IPv4 ranges are reserved as **private** and never appear on the public internet: `10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16`.

**NAT (Network Address Translation)** lets a whole home or office share one public IP. A home with five devices on `192.168.1.x` all browse through one public address. The router rewrites each outgoing packet's source and uses port numbers to remember which reply belongs to which device. A side effect: incoming connections need port-forwarding to reach a device hiding behind NAT.

## Ports: finding the right program

An IP address gets you to the right *machine*. A **port** (a number from 0 to 65535) gets you to the right *program* on that machine. The combination **IP:port** is called an **endpoint**.

The IP address is the street address of an apartment building. The port is the specific apartment. You need both to deliver to the right person, meaning the right process.

- **Well-known ports (0 to 1023):** standard services. HTTP 80, HTTPS 443, DNS 53, SSH 22.
- **Registered ports (1024 to 49151):** assigned to specific applications.
- **Ephemeral ports (~49152 to 65535):** the random temporary port your client picks for each outgoing connection.

This is where "connection refused" finally makes sense. Your packet reached the machine, but nothing was listening on that port. The host is up; the service is not.

## TCP vs UDP: the two ways to deliver

Both **TCP** and **UDP** add port numbers so the operating system knows which program to hand the data to. The difference is what they *guarantee*.

### TCP: reliable, ordered, connection-oriented

**TCP (Transmission Control Protocol)** gives you a reliable, in-order stream of bytes built on top of unreliable IP. Before any data flows, it sets up a connection with the **3-way handshake**:

```
   Client                          Server
     | ----------- SYN ----------> |   "here's my start number"
     | <-------- SYN-ACK --------- |   "got it; here's mine"
     | ----------- ACK ----------> |   "got yours"
     |        (data flows)         |
```

SYN means "synchronize," ACK means "acknowledge." After these three messages both sides are connected. Notice this costs one full **round-trip** (a message there and back) *before* any real data moves. Add **TLS**, [the encryption behind HTTPS](/blog/systems-fundamentals/08-networking-ii-the-web-stack-http-tls-load-balancing-caching), and you pay another round-trip or two on top. This setup cost is why connection reuse matters so much for speed.

Once connected, TCP keeps its promises through three mechanisms working together:

- **Reliability and ordering.** Every byte has a sequence number. The receiver acknowledges what it got, and anything unacknowledged is retransmitted after a timeout. Your app always reads a clean, in-order stream.
- **Flow control.** The receiver advertises a *window*: how many more bytes it can accept right now. This stops a fast sender from drowning a slow receiver. It is about the two *endpoints*.
- **Congestion control.** TCP also limits its own send rate to avoid overwhelming the *network*. The classic scheme is **AIMD (Additive Increase / Multiplicative Decrease)**: grow the rate slowly while things are fine, then cut it sharply the moment a packet is lost, since loss signals a traffic jam.

Flow control is a slow cashier telling a fast bagger "slow down, my counter is full," which is about the two people. Congestion control is everyone on a highway easing off the gas when traffic jams, which is about the shared road. Mixing these two up is one of the most common networking mistakes, so keep the cashier and the highway separate in your head.

TCP's main weakness is **head-of-line (HOL) blocking**. Because TCP is one single ordered stream, if one packet is lost, every byte behind it must wait for that packet to be resent, even bytes that already arrived and belong to unrelated requests. Picture a single-lane checkout where one stuck customer blocks everyone behind them, even though their goods are ready to scan.

### UDP: connectionless, fast, fire-and-forget

**UDP (User Datagram Protocol)** is the opposite trade. No handshake, no acknowledgements, no ordering, no retransmission. You send a **datagram**, a self-contained packet, and hope. It may arrive, arrive out of order, arrive twice, or vanish.

In return you get very low latency, tiny overhead (an 8-byte header), no head-of-line blocking, and the ability to send one-to-many.

| Aspect | TCP | UDP |
|---|---|---|
| Connection | Yes (3-way handshake) | No |
| Reliable delivery | Yes (ack + retransmit) | No |
| In-order | Yes | No |
| Overhead / latency | Higher | Very low |
| Best for | Web, APIs, databases, email | Voice, video, games, DNS |

A phone call is UDP: a dropped half-second is better than replaying it three seconds late. Downloading a contract PDF is TCP: every byte must arrive perfectly and in order.

### QUIC and HTTP/3: the modern twist

**QUIC** runs over UDP but rebuilds reliability, ordering, and congestion control in software, and crucially gives each logical *stream* its own ordering. A lost packet stalls only its own stream, not the others, which kills TCP's transport-level head-of-line blocking. QUIC also merges the connection and TLS handshakes to cut setup round-trips. **HTTP/3** is simply HTTP running over QUIC. That single improvement is the headline reason the web industry moved off plain TCP.

## Common misconceptions

- **"UDP is broken or always worse."** No. It is a deliberate trade. Skipping reliability overhead means lower latency, which is exactly right for live voice, video, and games where a late packet is useless anyway.
- **"You can dodge head-of-line blocking by opening more TCP connections."** At the transport level it is baked into TCP's single ordered stream. The real fix is QUIC/HTTP/3 and its independent per-stream ordering.
- **"Everyone is on IPv6 now."** Adoption is under half in 2025. NAT and dual-stack are still daily life.
- **"A CNAME stores an IP address."** It stores another *name*, which must then be resolved itself. And do not confuse an **A** record (IPv4) with an **AAAA** record (IPv6).
- **"Connection refused and timeout are the same."** Refused means the host answered "nothing is listening here." A timeout means nothing answered at all, often a firewall or a down host.

## DNS: turning names into addresses

**DNS (Domain Name System)** is the internet's phone book. Humans use names like `www.example.com`; machines need IP addresses. DNS is a distributed, hierarchical, heavily cached database read right to left. In `www.example.com.` the trailing dot is the implicit *root*, `com` is the **top-level domain**, `example` is the domain, and `www` is the host.

A **recursive resolver** does the legwork. It asks everyone and returns the final answer (often your ISP's, or public ones like `8.8.8.8` and `1.1.1.1`). **Authoritative servers** hold the real records. Resolution walks the hierarchy, each level delegating to the next:

```
 "www.example.com?"
       |
       v
 Recursive Resolver
   |-> Root server      : ".com lives over there"
   |-> .com TLD server  : "example.com's NS is over there"
   |-> Authoritative    : "A record = 93.184.x.x, TTL 300"
       |
       v
 answer cached on the way back
```

Record types worth knowing:

- **A** maps a hostname to an IPv4 address.
- **AAAA** maps a hostname to an IPv6 address.
- **CNAME** is an alias: "this name is really that other name." It cannot sit at the root of a domain or coexist with other records at the same name.
- **MX** says which server handles email for the domain.
- **NS** says which servers are authoritative for a zone. **TXT** holds arbitrary text, used for domain verification and email policies.

Every record carries a **TTL (Time To Live)** in seconds, which is how long it may be cached. A high TTL (say 86400, one day) means fewer lookups but slow changes. A low TTL (60 to 300) updates quickly but adds query load. DNS usually travels over **UDP port 53**, falling back to TCP for large answers.

This is the secret behind the dreaded "my DNS change won't propagate." If you edit a record while its TTL is still high, caches keep serving the old value until that timer runs out. There is nothing to fix; you are just waiting.

## How to use this

1. **Read errors literally.** "Connection refused" means the port has no listener. A hang means a firewall, a wrong IP, or a dead host. They point at different fixes.
2. **Lower TTL before a migration.** Days before a planned DNS change, drop the TTL to a minute or two so caches expire by cutover. Raise it again afterward.
3. **Pick the right transport.** Reach for TCP when correctness matters (APIs, files, payments). Reach for UDP when freshness beats completeness (live media, telemetry, gaming).
4. **Reuse connections.** Every new TCP+TLS connection costs round-trips. Keep-alive, connection pools, HTTP/2, and HTTP/3 exist to amortize that cost. Use them.
5. **Never hardcode IP addresses.** IPs change; names do not. Depend on DNS and let TTL handle the rest.
6. **Mind the MTU.** If large requests mysteriously fail while small ones work, suspect a packet that is too big to pass.
7. **Use the tools.** `traceroute` shows the hops, `dig` shows DNS answers and TTLs, and `ss`/`netstat` shows what is actually listening.

## Conclusion

The single idea worth carrying away: the network is a shared, unreliable medium, and every layer above IP exists to paper over that one fact. Loss, delay, and reordering are not failures of the system; they are the system, and TCP, UDP, DNS, and QUIC are just different bargains struck against them.

Once you see a "page load" as it really is, dozens of round-trips each exposed to loss and latency, a natural question follows: how do large systems stay fast and correct when any one of those round-trips can fail at any moment? That is where retries, timeouts, idempotency, and [consistency](/blog/distributed-systems/17-consistency-models) come in, and it is exactly the territory the next layer up, [distributed systems design](/blog/systems-fundamentals/09-distributed-systems-many-computers-working-as-one), is built to handle.
