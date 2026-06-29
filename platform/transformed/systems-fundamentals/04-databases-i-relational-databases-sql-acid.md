---
title: 'Relational Databases, SQL & ACID Explained Simply'
metaTitle: 'Relational Databases, SQL & ACID Explained'
description: >-
  Learn how relational databases, SQL, and ACID transactions keep your data
  correct under load — with clear examples, common mistakes, and practical tips.
keywords:
  - relational databases
  - SQL basics
  - ACID transactions
  - primary key vs foreign key
  - database normalization
  - isolation levels
  - lost update problem
  - SELECT FOR UPDATE
  - NUMERIC vs FLOAT money
  - SQL JOIN types
  - REPEATABLE READ
  - PostgreSQL READ COMMITTED
  - database transactions explained
  - what is a database
faq:
  - q: What does ACID stand for in databases?
    a: >-
      ACID stands for Atomicity, Consistency, Isolation, and Durability. Together
      these four guarantees let a database run a group of changes as one
      all-or-nothing unit that stays correct even during crashes and heavy
      concurrent use.
  - q: What is the difference between a primary key and a foreign key?
    a: >-
      A primary key uniquely identifies each row in its own table and can never be
      empty. A foreign key is a column whose value must match a primary key in
      another table, which is how the database links records and blocks orphan data.
  - q: Why should I never store money in a FLOAT column?
    a: >-
      FLOAT stores numbers in binary and cannot hold values like 0.10 exactly, so
      tiny rounding errors pile up across many rows. Use NUMERIC or DECIMAL, which
      store exact decimal values, for any money column.
  - q: What is the lost update problem and how do I prevent it?
    a: >-
      A lost update happens when two transactions read the same value, both change
      it, and the second write silently overwrites the first. Prevent it with
      SELECT ... FOR UPDATE, an atomic increment, or an optimistic version column —
      a plain transaction alone will not save you.
  - q: Should I always normalize my database to third normal form?
    a: >-
      Normalize to 3NF by default to remove harmful duplication. Denormalize only
      with a clear reason, like a read-heavy query that needs to be faster, and
      remember that snapshotting a price at purchase time is a real fact, not a
      normalization violation.
  - q: What isolation level do PostgreSQL and MySQL use by default?
    a: >-
      PostgreSQL defaults to READ COMMITTED, while MySQL's InnoDB engine defaults
      to REPEATABLE READ. The same level name can behave differently across
      engines, so never assume two databases match just because the level shares a name.
topic: systems-fundamentals
topicTitle: Systems Fundamentals
category: Engineering
date: '2026-06-21'
order: 3
icon: ⚙️
transformed: true
author: Pritesh Yadav
sources: []
---

A bank moves your money from one account to another thousands of times a second, and it never loses a cent — even when a server dies mid-transfer. That reliability isn't magic or luck. It comes from a set of guarantees baked into the relational database, the most boring-sounding and most important tool in software.

If you've ever wondered why "just save it to a file" falls apart the moment real users show up, this is the answer. By the end you'll understand tables, SQL, and the four-letter promise (**ACID**) that keeps data correct under pressure.

## Why this matters

Almost every serious application stores data: orders, users, payments, messages. And it has to give that data back later — correctly — even when thousands of people touch it at the same instant.

Get this wrong and the failures are quiet and expensive. Money debited but never credited. An order placed for the last unit you already sold to someone else. A report that silently drops every customer who hasn't bought yet. None of these throw an error. They just produce wrong answers that you discover weeks later.

Understanding databases isn't about memorizing syntax. It's about knowing where data goes wrong and which built-in tools stop it. That knowledge pays off whether you're building a side project or designing a system for millions of users.

## What a database actually buys you

A **database** is a structured system for storing, searching, and safely changing data — especially when many users touch it at once. The software that runs it is a **DBMS** (Database Management System). The popular ones are PostgreSQL, MySQL (and its cousin MariaDB), SQLite, SQL Server, and Oracle.

You *could* store your orders in plain files — a spreadsheet-style CSV, or a folder of JSON files. People try this. It falls apart fast. A real database wins on five fronts:

- **Concurrency control** — if two parts of your program write to the same file at once, they overwrite each other and corrupt it. A database safely interleaves thousands of simultaneous writers.
- **Querying** — with files, answering "all orders over $100 placed last week by customers in Texas" means hand-writing a loop. A database answers it in one line of SQL.
- **Integrity** — a database can refuse to save an order for a customer that doesn't exist. Files happily save garbage.
- **Crash safety** — if the power dies halfway through writing a file, you get a broken half-file. A database guarantees a write either fully happened or didn't happen at all.
- **Indexes** — a lookup structure (like a book's index) that finds one row fast, instead of scanning all 10 million.

**Think of it like a library.** A flat file is a single shared notebook on a desk — fine for one person, chaos when ten people grab it and scribble at once. A DBMS is a well-run library: a librarian checks books in and out, keeps a catalog so you find any book instantly, and never lets two people write on the same page at the same time.

## The relational model: tables, rows, and keys

A **relational database** organizes data into **tables**. Picture a spreadsheet:

- A **column** (or field) is a vertical category, like `email` or `price`. Each has a fixed **data type** — the kind of value it holds (number, text, date).
- A **row** (or record) is one horizontal entry — one customer, one order.

Two special columns hold the whole model together.

A **primary key (PK)** uniquely identifies each row. It must be unique (no two rows share it) and never empty. Most tables use a **surrogate key** — a meaningless-but-stable ID like an auto-incrementing number (1, 2, 3…) or a UUID (a long random string).

A **foreign key (FK)** is a column whose value must match a primary key in *another* table. This enforces **referential integrity**: the database won't let you save an order whose `customer_id` points at a customer that doesn't exist.

> **Watch out:** Don't use a changeable real-world value, like an email address, as your primary key. Emails change. When they do, every row pointing at that key breaks. Use a stable surrogate key and let email be a normal `UNIQUE` column.

### How tables connect

**Cardinality** just means "how many on each side."

- **One-to-one** — one row maps to exactly one row elsewhere (a `user` and their `user_profile`). Build it with a foreign key that's also marked `UNIQUE`.
- **One-to-many** — the common case: one `customer` has many `orders`. Put the FK on the *many* side: `orders.customer_id`.
- **Many-to-many** — an `order` has many `products`, and a `product` appears on many orders. A single foreign key can't represent this.

For many-to-many you need a third table — a **join table** (also called a junction or bridge table). For orders and products, that's `order_items(order_id, product_id, quantity, unit_price)`, holding a FK to each side. Crucially, it also stores facts *about the relationship itself*: the quantity and the price paid.

## SQL basics: asking and changing

**SQL** (Structured Query Language) is how you talk to a relational database. Four core statements do the heavy lifting:

- `SELECT name, total FROM orders WHERE total > 100 ORDER BY total LIMIT 10;` — **read** data.
- `INSERT INTO orders (customer_id, total) VALUES (5, 99.50);` — **create** a row.
- `UPDATE orders SET total = 120 WHERE id = 10;` — **change** rows.
- `DELETE FROM orders WHERE id = 10;` — **remove** rows.

> **The career-ending mistake:** Running `UPDATE` or `DELETE` *without a `WHERE` clause*. `DELETE FROM orders;` deletes **every order in the table**. `UPDATE accounts SET balance = 0;` zeroes out everyone. The `WHERE` says which rows; forget it and the change hits all of them. Write the `WHERE` first, every time.

### JOINs: combining tables

A **JOIN** stitches rows from two tables together using a matching condition (the `ON` clause).

- **INNER JOIN** — only rows with a match on *both* sides.
- **LEFT JOIN** — all rows from the left table, plus matches from the right (NULLs where there's no match).
- **RIGHT JOIN** — the mirror image: all rows from the right table.
- **FULL OUTER JOIN** — all rows from both sides, matched where possible.

A basic inner join — customers and their orders:

```sql
SELECT c.name, o.total
FROM customers c
JOIN orders o ON o.customer_id = c.id;
```

The classic LEFT JOIN trick — find customers who have *never* ordered. Keep all customers, attach orders where they exist, then keep only the rows where no order matched:

```sql
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

> **Watch out:** Using `INNER JOIN` when you needed `LEFT JOIN`. An inner join *drops* unmatched rows — so customers with zero orders silently vanish from your report, and you never notice the gap.

### Aggregation: many rows into one summary

**Aggregate functions** reduce many rows to a single number: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. `GROUP BY` produces one output row per group. Revenue per customer, keeping only the big spenders:

```sql
SELECT customer_id, SUM(total) AS revenue
FROM orders
GROUP BY customer_id
HAVING SUM(total) > 1000;
```

Two filters here look alike but run at different times:

- `WHERE` filters **individual rows before grouping**. It can't mention `SUM` or `COUNT` because the groups don't exist yet.
- `HAVING` filters **groups after grouping**. This is where you say "only groups whose total exceeds 1000."

To exclude refunded orders *and* keep only big spenders, you use both: `WHERE status <> 'refunded' ... GROUP BY ... HAVING SUM(total) > 1000`.

## Picking the right data types

The **schema** is the blueprint of your database — the tables, columns, types, and rules, defined with `CREATE TABLE`. The right **data type** matters for both correctness and storage:

- `INTEGER` / `BIGINT` — whole numbers.
- `NUMERIC(p,s)` / `DECIMAL(p,s)` — exact decimals. **Use this for money.** (`p` = total digits, `s` = digits after the decimal point.)
- `VARCHAR(n)` / `TEXT` — text.
- `BOOLEAN` — true/false.
- `DATE`, `TIMESTAMP`, `TIMESTAMPTZ` — prefer the timezone-aware `TIMESTAMPTZ`.
- `UUID` — a long random unique ID.
- `JSON` / `JSONB` — for flexible, semi-structured data.

> **The money-in-FLOAT trap:** A `FLOAT` stores numbers in binary and *cannot* represent values like 0.10 exactly. In floating point, `0.1 + 0.2` comes out as `0.30000000000000004`. Across thousands of orders these tiny errors accumulate into real, visible discrepancies in totals and payouts. Store money in `NUMERIC(10,2)`, which holds 0.10 + 0.20 = 0.30 exactly.

**Constraints** are rules the database enforces so bad data *can never be saved*: `NOT NULL` (required), `UNIQUE` (no duplicates), `CHECK (total >= 0)` (a custom condition), and `DEFAULT` (a fallback value). Push business rules into constraints, not just app code. A `CHECK (stock >= 0)` guarantees you can never oversell even if a future bug forgets to check. The database is your last line of defense.

## Normalization without the jargon

**Normalization** is the process of organizing columns so data isn't pointlessly duplicated. Duplication causes **update anomalies** — you change a customer's city in one row but forget the other ten, and now the data disagrees with itself.

There are three "normal forms," each building on the last. The whole thing fits in one famous mnemonic: every non-key column must depend on *"the key, the whole key, and nothing but the key."*

- **1NF — the key.** Each cell holds *one* value. No comma-lists like `"red,blue,green"` in a single column, no repeating columns like `phone1, phone2, phone3`. Cram several values into one cell and you can't filter, index, or count them. It quietly destroys your ability to query.
- **2NF — the whole key.** This only matters when the primary key is **composite** (more than one column). Every non-key column must depend on the *whole* key. In a line-items table keyed by `(order_id, product_id)`, `product_name` depends only on `product_id` — half the key. Move it out to a `products` table.
- **3NF — nothing but the key.** No non-key column should depend on *another non-key column*. In `orders(id, customer_id, customer_city)`, `customer_city` really depends on `customer_id`, not the order. Move it to the `customers` table where it belongs.

### When breaking the rules is correct

**Denormalization** means deliberately adding redundancy back to make *reads faster* — for example, storing a precomputed `order_total` instead of summing line items on every page load. The cost: you must keep the copies in sync on every write. Choose it on purpose, only where read speed truly matters.

> **The snapshot exception:** When an order copies a product's name and price *at the moment of purchase*, that is correct, not a bug. The snapshot is a genuinely different fact ("price paid on June 1") than the live catalog price ("price today"). If you didn't snapshot, editing a product's price tomorrow would silently rewrite every past invoice — a serious accounting error.

So: normalize by default, denormalize only with a clear reason, and never confuse a purchase-time snapshot with harmful duplication.

## Transactions and ACID: the four-letter promise

A **transaction** is a group of SQL statements treated as one indivisible unit. You wrap them: `BEGIN;` … your statements … `COMMIT;` to make them permanent, or `ROLLBACK;` to undo everything. **ACID** is the set of four guarantees a good database gives every transaction:

- **A — Atomicity** (all-or-nothing): every statement commits, or none do. A crash or rollback midway leaves the database exactly as if the transaction never started.
- **C — Consistency**: the transaction moves the database from one valid state to another, never violating constraints. If any statement would break a rule, the whole transaction is rejected.
- **I — Isolation**: running transactions don't see each other's half-finished, uncommitted work. The result looks as if they ran one after another.
- **D — Durability**: once `COMMIT` returns "done," the change survives a crash or power loss. This is achieved with a **write-ahead log (WAL)** — the change is written to a log on disk *before* the commit is acknowledged, so it can always be recovered.

### The bank transfer, line by line

Transfer $100 from Alice to Bob:

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 'alice';
  UPDATE accounts SET balance = balance + 100 WHERE id = 'bob';
COMMIT;
```

Watch all four guarantees at work:

- **Atomicity** — if the server dies between the two updates, the debit rolls back. Money is never taken from Alice without reaching Bob; no $100 vanishes.
- **Consistency** — a `CHECK (balance >= 0)` rejects the whole transfer if Alice doesn't have $100.
- **Isolation** — a "total balance" report running concurrently never catches the moment $100 has left Alice but not yet arrived at Bob. It sees the system before or after, never in-between.
- **Durability** — once the bank says "transfer complete," a power failure one second later cannot lose it.

The lesson: any multi-step write — debit plus credit, or order plus stock decrement — belongs in one transaction. Do them as separate statements *outside* a transaction and a failure between them leaves a broken half-state.

## Isolation levels and the anomalies they stop

Perfect isolation — every transaction acting as if it's completely alone — is expensive. It requires lots of locking, which slows everyone down. So SQL defines *weaker* levels that trade some isolation for speed. To choose well, you need to know the three classic **read anomalies**:

- **Dirty read** — T1 reads a row that T2 changed but *hasn't committed*. If T2 rolls back, T1 acted on data that never officially existed.
- **Non-repeatable read** — T1 reads a row, T2 updates and commits that *same row*, T1 reads it again and gets a *different value*.
- **Phantom read** — T1 runs a range query (`WHERE total > 100`), T2 inserts a new matching row and commits, T1 re-runs the query and gets *extra rows*. New "phantoms" appeared.

The four standard isolation levels, weakest to strongest:

| Isolation level | Dirty read | Non-repeatable read | Phantom read |
|---|---|---|---|
| READ UNCOMMITTED | possible | possible | possible |
| READ COMMITTED | prevented | possible | possible |
| REPEATABLE READ | prevented | prevented | possible* |
| SERIALIZABLE | prevented | prevented | prevented |

\* The bare SQL standard allows phantoms at REPEATABLE READ — but real engines are often stricter.

### How real engines actually behave

- **PostgreSQL defaults to READ COMMITTED.** It has no real READ UNCOMMITTED — ask for it and you get READ COMMITTED. Its REPEATABLE READ uses **snapshot isolation** (each transaction sees a frozen snapshot) and, unlike the bare standard, *also prevents phantoms*. Its SERIALIZABLE watches for dangerous read/write dependency cycles and *aborts* one transaction — so your app must be ready to **retry on a serialization failure**.
- **MySQL/InnoDB defaults to REPEATABLE READ**, and its "next-key locking" largely blocks phantoms too.
- The same level name can behave differently across engines. The SQL standard sets *minimums*, not exact behavior. Never assume two databases match just because the level shares a name.

## Common misconceptions

**"The ACID 'C' and the CAP 'C' are the same thing."** They're unrelated concepts that happen to share a letter. ACID consistency means "constraints stay valid." CAP consistency (a networking topic) means "all replicas agree on the latest value."

**"Wrapping writes in a transaction prevents lost updates."** It doesn't — not at READ COMMITTED. A **lost update** happens when two transactions both read the same value, both modify it, and both write it back. The second write silently overwrites the first.

```text
Both shoppers read stock = 1, both sell the last unit:
T1: read stock=1 -> set stock = 1-1 = 0  (sold!)
T2: read stock=1 -> set stock = 1-1 = 0  (sold AGAIN!)
Result: stock=0 but TWO units sold -> oversold.
```

You must defend explicitly with one of three tools:

- **`SELECT … FOR UPDATE`** — locks the row so the second transaction waits until the first commits, then reads the new value.
- **Atomic increment** — `UPDATE products SET stock = stock - 1 WHERE id = 7 AND stock > 0;` does the read-and-write in one indivisible step.
- **Version column** (optimistic concurrency) — update only if a `version` number hasn't changed, and retry if it has.

**"More normalization is always better."** Over-normalizing a reporting query into 12 joins is slow; over-denormalizing and forgetting to sync copies is wrong. Both are real failure modes.

## How to use this

A practical checklist for your next schema:

1. **Use a database for any real data.** If more than one user or process touches it, files won't cut it.
2. **Give every table a stable surrogate primary key.** Auto-increment or UUID — never a changeable real-world value like email.
3. **Add foreign keys and constraints up front.** `NOT NULL`, `UNIQUE`, and `CHECK` are your last line of defense against bad data.
4. **Store money in `NUMERIC`, never `FLOAT`.** Always.
5. **Normalize to 3NF by default**, then denormalize deliberately only where reads demand it. Snapshot purchase-time prices on purpose.
6. **Write the `WHERE` clause first** on every `UPDATE` and `DELETE`.
7. **Wrap related writes in one transaction.** Debit and credit, or order and stock decrement, must succeed or fail together.
8. **Guard hot rows explicitly.** For stock, balances, and counters, reach for `SELECT … FOR UPDATE` or an atomic `WHERE stock > 0` update — and if you use SERIALIZABLE, always code the retry loop it needs.

Bring it all together in an e-commerce checkout. Placing an order is **one transaction** that inserts the order, inserts each line item while snapshotting the price, decrements stock with an atomic `WHERE stock > 0` (backed by `CHECK (stock >= 0)`), and records the payment. A failure anywhere — card declined, out of stock — rolls the whole thing back. No half-created orders, no stock wrongly taken.

## Conclusion

If you remember one thing, make it this: a database's real job isn't storing data — it's keeping data *correct* while the world hammers it from every direction at once. ACID is how it keeps that promise. Tables, keys, and constraints are the shape; transactions and isolation are the safety.

But correctness is only half the story. The other half is *speed* — how a database finds one row among ten million in milliseconds instead of reading them all. That's the job of indexes, and the way they work (B-trees, query planners, and the surprising cost of the wrong index) is where databases get genuinely clever. That's the next thing worth learning.
