# 09 — Commonly confused words

*What this fixes for you: the small word mix-ups that make a clean PR or commit look careless — its/it's, your/you're, login vs log in, and friends. Get these right and your writing instantly reads as more senior.*

## The rule in 30 seconds

- If you can expand it to two words (**it is**, **you are**, **they are**), use the apostrophe version (**it's, you're, they're**). If not, use the plain one (**its, your, their**).
- **then** = time/sequence; **than** = comparison.
- **affect** = the verb (to change something); **effect** = the noun (the result).
- Many of these are one word as a *noun* (**login, setup, backup**) but two words as a *verb* (**log in, set up, back up**).

## Why this trips you up

You write fast, all day, in commits and Slack — and texting habits leak in ("u", "ur", no capitals), so the apostrophe and the missing letter slip past. You also tend to drop the small grammar signals (the plural **-s**, the article **a/the**), and these confusable pairs hide in exactly that same blind spot. None of this means you don't know the rule — it means you're moving fast and need a quick self-check.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| `fix: button looses focus on close` | `fix: button loses focus on close` | **lose** = a verb (to misplace). **loose** = not tight. One `o`. |
| `your right, the migration was missing` | `you're right, the migration was missing` | **you're** = you are. |
| `the API returns it's status code` | `the API returns its status code` | **its** = belonging to it. No apostrophe (like *his*, *hers*). |
| `this build is slower then the last one` | `this build is slower than the last one` | Comparison → **than**. |
| `how does this affect the cache?` (meaning the result) | `what's the effect on the cache?` | Result/outcome → **effect** (noun). |
| `please login to the dashboard and retry` | `please log in to the dashboard and retry` | Here it's a verb → two words: **log in**. |
| `i updated the setup steps, see PR` | `I updated the setup steps. See the PR.` | Noun **setup** is fine; but capitalize **I**, end the sentence, add **the**. |
| `there going to revert there changes` | `they're going to revert their changes` | **they're** = they are; **their** = belonging to them. |
| `accept for the timeout, all tests pass` | `except for the timeout, all tests pass` | **except** = leaving out. **accept** = to agree/receive. |
| `we had less errors after the fix` | `we had fewer errors after the fix` | Countable (errors) → **fewer**. Uncountable (downtime) → **less**. |
| `who's branch is this?` | `whose branch is this?` | Ownership → **whose**. **who's** = who is. |
| `use JSON, e.g. the response body` (meaning "that is") | `use JSON, i.e. the response body` | **i.e.** = that is (clarify). **e.g.** = for example. |

## Patterns to remember

**The apostrophe = "two words" test**

| Word | Expands to? | Use when |
|---|---|---|
| it's | it is / it has | "it's failing" = it is failing |
| its | (no expansion) | "its config" = the config belonging to it |
| you're | you are | "you're blocked" |
| your | (no expansion) | "your branch" |
| they're | they are | "they're merging" |
| their | (no expansion) | "their service" |
| there | (no expansion) | "deploy it there" / "there is a bug" |
| who's | who is / who has | "who's on call?" |
| whose | (no expansion) | "whose PR broke main?" |

**One word (noun) vs two words (verb)** — the verb has a space:

| Noun (one word) | Verb (two words) |
|---|---|
| a **login** screen | please **log in** |
| the **setup** is done | **set up** the env |
| run a **backup** | **back up** the DB |

Trick: if you can put a word between the two halves ("set the env **up**", "log quickly **in**"), it's a verb → two words.

**then vs than** — **a** for compare (th**a**n / comp**a**re), **e** for sequence (th**e**n / first th**e**n n**e**xt).

**affect vs effect** — **A**ffect = **A**ction (verb). **E**ffect = **E**nd result (noun).

**fewer vs less** — if you can count them with an **-s** plural (3 errors, 5 retries) → **fewer**. If you can't (less traffic, less memory) → **less**.

**to / too / two** — **too** = also or excessive ("too slow"). **two** = the number 2. **to** = everything else.

**into vs in to** — **into** = movement/result ("merge it into main"). **in to** = the words just land next to each other ("log **in to** the box" = log in + to the box).

**accept vs except** — acc**ept** = take it; **ex**cept = **ex**clude it.

## In your daily writing

- **Commit messages:** the big four to scan for are **its/it's**, **lose/loose**, **then/than**, **login/log in**. Example: `fix: prevent session from being lost on log in` (verb → two words).
- **PR titles:** comparisons sneak in — "smaller bundle **than** before", not "then".
- **Slack standups:** kill the texting leak. Write "your PR is ready", not "ur PR is ready"; "they're reviewing", not "there reviewing". Capitalize **I** and the first word.
- **Code comments & docs:** use **e.g.** for examples and **i.e.** to restate one specific thing — and put a comma after both: `// retry on transient errors, e.g., 502 and 503`.
- Quick self-check before you hit send: any apostrophe word? Expand it in your head. Any "login/setup"? Ask "is it a thing or an action?"

## Drills

Fix or choose. Don't peek at the key.

1. Fix: `your going to want to rebase before you push`
2. Choose: The new query is faster (then / than) the old one.
3. Fix: `the cache keeps it's value after restart`
4. Choose: Please (login / log in) and run the seeder.
5. Fix: `we have less open tickets then last sprint`
6. Choose: This change won't (affect / effect) the public API.
7. Fix: `accept for one flaky test, the suite is green`
8. Fill the blank: `____ branch is this, and ____ reviewing it?` (whose / who's)
9. Fix (rewrite the learner's own line): `can u do reaseach on grammer for me and teach me i already know but as of now i am making so much mistake`
10. Choose: Merge the hotfix (into / in to) main.
11. Fix: `there service is down so there going to fail over`
12. Choose: Use a real client, (e.g. / i.e.) curl or Postman.
13. Fix: `the build looses the env vars during setup` (one error is a word-choice, find it)
14. Choose: The retry count is (to / too / two) high.

---

## Answer key

1. **You're going to want to rebase before you push.** — "you're" = you are; capitalize the first word; end with a full stop.
2. **than** — it's a comparison.
3. **The cache keeps its value after restart.** — "its" = belonging to the cache, no apostrophe.
4. **log in** — it's a verb here, so two words.
5. **We have fewer open tickets than last sprint.** — tickets are countable → "fewer"; comparison → "than".
6. **affect** — it's the verb (to change something).
7. **Except for one flaky test, the suite is green.** — "except" = leaving out; capitalize the first word.
8. **Whose** branch is this, and **who's** reviewing it? — "whose" = ownership; "who's" = who is.
9. **Can you do research on grammar for me and teach me? I already know it, but right now I'm making so many mistakes.** — fixes: "you" not "u", spelling "research"/"grammar", capital "I", a question mark, "many mistakes" (countable plural), and clearer wording.
10. **into** — one word for movement/result (merging X into Y).
11. **Their service is down, so they're going to fail over.** — "their" = belonging to them; "they're" = they are; comma before "so".
12. **e.g.** — you're giving examples, not restating one exact thing.
13. **The build loses the env vars during setup.** — "loses" (verb, one `o`); "setup" as a noun here is correct.
14. **too** — meaning excessive.

---

*Part of the Developer English course — see [00-index.md](./00-index.md).*
