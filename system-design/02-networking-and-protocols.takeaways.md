**This document explains how data travels between a user's browser and a server - and why some websites feel instant while others feel slow. It shows that most of the delay is not about bandwidth ("pipe size") but about the number of back-and-forth messages two computers must exchange before any real data flows. Understanding this helps you make better decisions about speed, real-time features, and infrastructure.**

**The main parts explained simply:**

- **Round-trip tax** - Every time a browser connects to a server, they must exchange several "hello" messages before any useful data moves. Each exchange takes time (a "round-trip"). A cold start over a secure connection can cost 3–5 of these round-trips before a single byte of your page arrives. Cutting round-trips is the single biggest lever for a faster site.

- **TCP vs UDP** - TCP is the reliable delivery method: every byte arrives in order, nothing is lost. UDP is the "fire and forget" method: faster, but packets can be lost or arrive out of order. Most websites use TCP; live video calls and the newer HTTP/3 use UDP because dropping a late packet is better than waiting for it.

- **TLS (the padlock / HTTPS)** - Encryption that protects data in transit. Older TLS needed 2 extra round-trips to set up; the newer version (TLS 1.3) cuts that to 1, and on a return visit can skip the setup entirely (0 round-trips). Never use the "0-RTT" shortcut for actions that move money - it can be replayed by attackers.

- **DNS** - The internet's phone book. Before your browser can connect to a server it must look up the server's address by name. This lookup itself costs time, which is why CDNs and caching matter even before a page starts loading.

- **CDNs and anycast** - A CDN places copies of your content at hundreds of locations around the world. Users are served from the nearest one, turning a 120 ms round-trip into a 5 ms one. Anycast routes traffic to the nearest location automatically at the network level, with no lag from DNS caching.

- **HTTP versions (1.1 / 2 / 3)** - HTTP/1.1 could only handle one request at a time per connection. HTTP/2 handles many at once, but a single lost packet can still freeze all of them. HTTP/3 fixes that by treating each request independently - a lost packet only delays its own request, not everyone else's.

- **Real-time options (WebSocket, SSE, polling)** - For live updates (chat, notifications, order status): SSE is the simple choice when the server just needs to push updates to the browser; WebSocket is needed when the browser also sends data back continuously (chat, collaborative editing). Plain polling (asking "anything new?" every few seconds) wastes resources and should be a last resort.

- **gRPC** - A compact, fast way for servers to talk to each other internally. Not usable directly from a browser without an extra translation layer (gRPC-Web + a proxy like Envoy).

**What to do with this:** If your site feels slow, the first question is "how many round-trips does a cold page load cost?" - reduce those before anything else (use a CDN, enable TLS 1.3, reuse connections). For any feature that needs live updates (order tracking, notifications), prefer SSE for one-way push and WebSocket only when you need two-way communication.
