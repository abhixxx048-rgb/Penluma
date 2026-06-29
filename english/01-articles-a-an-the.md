# 01 — Articles: a, an, the (and no article)

*What this fixes for you: the dropped "a/an/the" in your commits and PRs ("open pull request" → "open **a** pull request"), and the "the" you add where English wants nothing.*

## The rule in 30 seconds

- **a / an** = one of many, or the first time you mention it. Use **an** before a *vowel sound*, **a** before a *consonant sound* — it's about how the word sounds, not how it's spelled.
- **the** = a specific thing both you and the reader already know about (the one we just mentioned, or the only one there is).
- **no article** = general plurals ("tests fail"), uncountable stuff ("data", "code", "feedback"), and most names (Redis, GitHub, `main`).
- Quick flow: **specific & known → the. First mention / one of many → a/an. General plural or uncountable → no article.**

## Why this trips you up

In code and chat you drop short words to go fast — "open pull request", "merge to main branch", "fix bug in service" — so the articles fall off and the sentence reads like a log line, not English. The same habit makes you write "the data" or "the feedback" when English wants no article at all. Sound vs. letter is the other snag: it's "an SQL query" (sounds like *ess*) but "a URL" (sounds like *you-arr-ell*).

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| open pull request for this fix | open **a** pull request for this fix | First mention, one of many PRs → `a`. |
| merge to main branch after review | merge to **the** main branch after review | There is only one `main` → specific & known → `the`. |
| i opened PR, can u review | I opened **a** PR. Can **you** review **it**? | `a PR` (first mention), capital `I`, full word `you`, and `it` refers back. |
| fix bug in payment service | fix **the** bug in **the** payment service | A specific known bug and one known service → `the` both times. |
| this throws error when token is empty | this throws **an** error when **the** token is empty | "error" = first mention `an`; sounds like *err*. The token is the specific one in context → `the`. |
| we need write unit test for this | we need **to** write **a** unit test for this | One of many tests → `a` (and "to write"). |
| restart server, then run migration | restart **the** server, then run **the** migration | Both are the specific known ones in this task → `the`. |
| i am making so much mistake with article | I am making so **many mistakes** with **articles** | "mistake" is countable → **many** + plural `-s`; general plural "articles" → no article. |
| send the feedback in the slack | send **feedback** in **Slack** | "feedback" is uncountable → no article; "Slack" is a proper name → no article. |
| it returns a 401 unauthorized error | it returns **a** 401 Unauthorized error | "401" sounds like *four-oh-one* (consonant sound) → `a`. ✓ already fine — keep it. |
| this is honest mistake in reaseach | this is **an honest mistake** in **research** | "honest" — the *h* is silent, sounds like *onnest* → `an`; spelling: research. |

## Patterns to remember

**a vs an — listen, don't spell:**

| Word | Sound starts with | Article |
|---|---|---|
| URL | *you* (consonant sound) | **a** URL |
| SQL query | *ess* (vowel sound) | **an** SQL query |
| HTTP request | *aitch* (vowel sound) | **an** HTTP request |
| hour | *our* (silent h) | **an** hour |
| user | *you* (consonant sound) | **a** user |
| API | *ay* (vowel sound) | **an** API |
| 8-character token | *eight* (vowel sound) | **an** 8-character token |

**When NOT to use "the":**
- Uncountable things in general: ~~the~~ code, ~~the~~ data, ~~the~~ feedback, ~~the~~ documentation, ~~the~~ information.
- General plurals: "~~the~~ tests pass", "we ship ~~the~~ features weekly".
- Most proper names: ~~the~~ GitHub, ~~the~~ Redis, ~~the~~ `main`, ~~the~~ Docker.
- But DO use "the" once it's specific: "**the** data **we migrated last night**", "**the** tests **in this PR**".

**The mnemonic:** *Specific & known → the. New / countable & general → a/an. Mass noun or general plural → nothing.*

## In your daily writing

- **Commit messages** are the one place where dropping articles is OK style: `fix null check in cart service` is fine. The imperative-log voice is accepted.
- **PR descriptions, Slack, code comments, docs** are real sentences — put the articles back: "This **PR** adds **a** retry to **the** webhook handler."
- **Code comments:** "// returns **the** cached store, or null on **a** miss" reads better than "returns cached store or null on miss".
- **Standups:** "I opened **a** PR for **the** login bug and started **research** on **the** caching layer." (research = no article; the caching layer = the specific one.)

## Drills

Fix or fill each one. Don't peek — answers are below.

1. Fix: `can u do reaseach on grammer for me i already know but as of now i am making so much mistake`
2. Fill: I opened ___ PR and merged it into ___ main branch.
3. Choose: It throws (a / an) error when (the / a) database is down.
4. Fix: please review pull request before standup
5. Choose: This endpoint returns (a / an) HTTP 500 if (the / a) token expires.
6. Fill: We don't store ___ feedback in ___ database; we send it to ___ Slack.
7. Fix: i fixed bug but tests still failing on main
8. Choose: Reading the config takes (a / an) hour because (the / a) file is huge.
9. Fill: Write ___ unit test for ___ function you just changed.
10. Fix: this is honest mistake, i dropped article again
11. Choose: We use (a / an) SQL query and (a / an) URL helper here.
12. Fix: data is missing so much field after the migration

---

## Answer key

1. **"Can you do research on grammar for me? I already know it, but right now I'm making so many mistakes."** — `you` not `u`, spell *research* and *grammar*, capital `I`, full stop, and "so **many mistakes**" (countable → many + plural).
2. **a / the** — first mention of the PR → `a`; the one `main` everyone knows → `the`.
3. **an / the** — "error" sounds vowel-ish → `an`; the specific database in context → `the`.
4. **"Please review the pull request before standup."** — capital first word, and a known PR being discussed → `the`.
5. **an / the** — "HTTP" sounds like *aitch* (vowel sound) → `an`; the specific token → `the`.
6. **no article / the / no article** — "feedback" uncountable → no article; "the database" = the specific one → `the`; "Slack" is a name → no article.
7. **"I fixed the bug, but tests are still failing on `main`."** — capital `I`, the known bug → `the`, comma before "but", and general "tests" → no article.
8. **an / the** — "hour" has a silent h, sounds like *our* → `an`; the specific config file → `the`.
9. **a / the** — one of many tests → `a`; the specific function you changed → `the`.
10. **"This is an honest mistake; I dropped an article again."** — silent h → `an honest`; capital `I`; "an article" (one of many).
11. **an / a** — "SQL" sounds like *ess* (vowel) → `an`; "URL" sounds like *you* (consonant) → `a`.
12. **"Data is missing so many fields after the migration."** — "data" stays no article; "so **many fields**" (countable → many + plural `-s`); "the migration" = the specific one.

---
*Part of the Developer English course — see [00-index.md](./00-index.md).*
