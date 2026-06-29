# 06 - Prepositions (in, on, at, to, for, with)

*What this fixes for you: prepositions are the small words you keep guessing - "depend on" or "depend to"? This doc gives you a cheat table so you stop guessing and just know.*

## The rule in 30 seconds

- **Time/place** follow a zoom rule: **in** = big/inside (in June, in the repo), **on** = surface/day (on Monday, on the branch), **at** = exact point (at 9am, at line 42).
- Most dev prepositions are **fixed pairings** (collocations) - `depend on`, `based on`, `responsible for`. You **memorize** these; you do not work them out from logic.
- Direction uses **to**: `push to`, `deploy to`, `merge to`. Being inside something uses **in/on**: `in the repo`, `on the branch`.
- When in doubt, check the cheat table at the bottom. Real English speakers also just memorized these.

## Why this trips you up

In your native language one preposition often covers several English ones, so you translate word-for-word and get "depend to" or "responsible of." You also mix the zoom levels - writing "on the repo" when it's "in the repo." The fix is not grammar logic; it's pairing the verb and its preposition together as one chunk and reusing it.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| this fix depend to the cache layer | This fix **depends on** the cache layer. | The verb is `depend on`, always. Also capitalize the first word and add the full stop. |
| i merged the branch to main | I merged the branch **into** main. (or **to** main) | You merge code **into** a target. Capitalize `I`. |
| pushed my changes in the remote | Pushed my changes **to** the remote. | Pushing is direction → **to**, not `in`. |
| the price is based of the tier | The price is **based on** the tier. | Fixed pair `based on`. Never `based of` / `based off` in formal writing. |
| who is responsible of this module | Who is **responsible for** this module? | `responsible for`. And it's a question → add `?`. |
| she is good in debugging | She is **good at** debugging. | `good at` a skill. `in` is wrong here. |
| i am interested on the new ticket | I'm **interested in** the new ticket. | `interested in`, always. Capitalize `I`. |
| the server listen in port 4000 | The server **listens on** port 4000. | A service listens **on** a port. Add the `-s` (it listens). |
| we will deploy in production tonight | We'll **deploy to** production tonight. | Deploy is direction → **to** an environment. |
| can u comment in my PR | Can **you comment on** my PR? | You comment **on** something. Spell out `you`. |
| working in a ticket about grammer | Working **on** a ticket about grammar. | You work **on** a task. Fix the spelling: `grammar`. |
| the file is on the repo on branch dev | The file is **in** the repo **on** branch dev. | You're **in** a repo (container) but **on** a branch. |

## Patterns to remember

**Time & place - the zoom rule (big → small):**

| Word | Time | Place |
|---|---|---|
| **in** | in 2026, in June, in an hour | in the repo, in the file, in production |
| **on** | on Monday, on June 16, on the weekend | on the branch, on line 42, on a server |
| **at** | at 9am, at noon, at deploy time | at the endpoint, at the office |

**Dev collocation cheat table (memorize the pairing, not the logic):**

| Phrase | Preposition | Example |
|---|---|---|
| depend ___ | **on** | The job depends **on** Redis. |
| based ___ | **on** | Pricing is based **on** quantity. |
| responsible ___ | **for** | I'm responsible **for** the queue worker. |
| good ___ (a skill) | **at** | He's good **at** writing tests. |
| interested ___ | **in** | I'm interested **in** the caching task. |
| listen ___ (a port) | **on** | The service listens **on** port 8000. |
| deploy ___ (an env) | **to** | We deploy **to** staging first. |
| push ___ (a remote) | **to** | Push **to** origin. |
| merge ___ (a target) | **into** / **to** | Merge **into** main. |
| work ___ (a task) | **on** | I'm working **on** the bug. |
| comment ___ (a thing) | **on** | Please comment **on** the PR. |
| reply ___ | **to** | Reply **to** the review thread. |
| connect ___ | **to** | Connect **to** the database. |
| migrate ___ | **to** | Migrate **to** PostgreSQL. |
| consist ___ | **of** | The pipeline consists **of** three stages. |

**Quick mnemonic:** *Moving somewhere → `to` (push to, deploy to, reply to). Sitting inside → `in` (in the repo, in production). On a surface or a list → `on` (on the branch, on a port, on the PR).*

## In your daily writing

- **Commits:** "Fix crash that **depends on** a null tenant" - not "depend to."
- **PR titles:** "Deploy worker **to** staging" / "Merge feature **into** main."
- **Slack standups:** "Today I'm **working on** the cache ticket and will **comment on** Pravin's PR." - not "working in" / "comment in."
- **Code comments:** `// Service listens on port 4000` - not "listens in port."
- **Bug reports:** "The error happens **in** production **at** the checkout endpoint **on** the release branch." Notice each zoom level gets its own word.

## Drills

Fix the preposition (and any spelling/capital/punctuation slips you notice).

1. the build depend to a env variable that is not set
2. i am interested on picking up the payment ticket
3. we deploy in production every friday
4. can u comment in my pull request when u get time
5. the price calculation is based of the product size
6. who is responsible of the queue worker
7. our api listen in port 8000 by default
8. she is really good in writing clean tests
9. Choose A or B: I'll push my changes (A) **to** / (B) **in** the remote tonight.
10. Choose A or B: The config file is (A) **on** / (B) **in** the repo, (A) **on** / (B) **in** the dev branch.
11. Fill the blank: This migration consists ___ two reversible steps.
12. Fix the run-on: i fixed so much bug today and i will merge to main and then i deploy in staging

---

## Answer key

1. **The build depends on an env variable that is not set.** - `depend on`; add `-s`, capitalize, use `an env`, add full stop.
2. **I'm interested in picking up the payment ticket.** - `interested in`; capitalize `I`.
3. **We deploy to production every Friday.** - Direction → `to`; capitalize the day `Friday`.
4. **Can you comment on my pull request when you get time?** - `comment on`; spell out `you`; it's a question → `?`.
5. **The price calculation is based on the product size.** - Fixed pair `based on`, not `based of`.
6. **Who is responsible for the queue worker?** - `responsible for`; add the question mark.
7. **Our API listens on port 8000 by default.** - A service listens **on** a port; add `-s`.
8. **She is really good at writing clean tests.** - `good at` a skill, not `good in`.
9. **A - `to`.** - Pushing is direction, so `push to the remote`.
10. **B (`in` the repo), A (`on` the dev branch).** - You're inside the repo but on a branch.
11. **of** - `consist of`. (The migration consists **of** two reversible steps.)
12. **I fixed so many bugs today. I'll merge into main and then deploy to staging.** - `so many bugs` (countable, plural); split the run-on into sentences; `merge into`; `deploy to`; capitalize `I`.

*Part of the Developer English course - see [00-index.md](./00-index.md).*
