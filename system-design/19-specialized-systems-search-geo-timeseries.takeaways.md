**This document explains why a standard database like PostgreSQL cannot handle every type of question efficiently, and which specialist tool to use instead. It covers the four most common "hard" workloads — searching text, finding nearby places, recording measurements over time, and totaling huge amounts of data — and shows how each specialist tool is built to be dramatically faster.**

**The main parts explained simply:**

- **Match the tool to the question** — A regular database works well for fetching rows by ID. But text search, proximity, time-series tracking, and billion-row analytics each need a different purpose-built store. The key skill is recognizing which category your problem falls into, then choosing the right tool rather than forcing one tool to do everything.

- **Text search (inverted index)** — Search engines like Elasticsearch build an index like the one at the back of a textbook: word → list of documents that contain it. Searching is a fast lookup, not a scan of every document. Results are ranked by how often the word appears and how rare it is across all documents (the BM25 formula handles this automatically, and it is the default in Elasticsearch).

- **Finding nearby places (geospatial indexes)** — "Find the 50 nearest print shops" is a two-direction problem — latitude and longitude together. Tools like PostGIS and Redis GEO flatten two dimensions into a single sortable key so nearby places always cluster together. They also fix the "border seam" trap: always search the target cell plus all surrounding cells, then measure real distance, so shops right on a boundary are never missed.

- **Tracking measurements over time (time-series databases)** — Tools like Prometheus and TimescaleDB store metrics (error rates, order counts, server load) with extreme compression — about 1–2 bytes per data point instead of 16. Old fine-grained data is automatically rolled up into hourly summaries and the detail is dropped to save space. One critical rule: never add a unique per-user or per-request identifier as a label — it creates millions of separate data streams and crashes the system.

- **Summing billions of rows (columnar analytics)** — Databases like ClickHouse or BigQuery store each column separately on disk. A "total sales by region" query reads only the two relevant columns out of two hundred — 10–100× less data than a regular database which must read every column of every row to reach the two it needs. Data is typically arranged in a "star" layout: one large events table in the center, surrounded by small descriptor tables (products, dates, customers).

- **Data lakehouse** — The modern approach: keep data as cheap files on cloud storage, but add a layer on top that gives you reliable saves, rollbacks, and SQL queries. One copy of the data can serve both spreadsheet-style reports and machine-learning workloads without expensive copying between separate systems.

- **Polyglot persistence (using multiple stores together)** — The mature approach is to keep your main database as the reliable source of truth and feed a derived copy into specialist stores for fast reads. Orders live in PostgreSQL; a search index is built from them for text queries; a columnar store gets a copy for analytics. Each read goes to the right tool; all writes start at the source.

**What to do with this:** When a feature needs text search, map proximity, time-based charts, or big-data reporting, reach for the specialist tool — do not try to squeeze it into a general-purpose database query. Keep your main database as the single reliable source and treat specialist stores as fast, rebuildable copies.
