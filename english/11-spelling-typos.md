# 11 — Spelling & typos developers get wrong

*What this fixes for you: the small misspellings that slip into commits, PRs, and Slack — "grammer", "reaseach", dropped or doubled letters — plus the texting habits ("u", "ur", "plz") that make professional writing look rushed.*

## The rule in 30 seconds

- A few words get misspelled by almost everyone: **separate**, **definitely**, **recommend**, **occurred**, **necessary**, **receive**, **environment**, **parameter**, **maintenance**. Learn these as fixed shapes — don't sound them out.
- **i before e, except after c** (recieve → **receive**, beleive → **believe**).
- Doubling rule: short stressed words double the final consonant before **-ing/-ed** (run → run**n**ing, occur → occur**r**ed) — but **open → opening** (not stressed on the last part).
- Spell-check is not cheating. Turn it on in your editor and your PR/Slack box; let the machine catch what your eyes skim past.

## Why this trips you up

You write fast all day — commits, standups, review comments — and the same slips repeat: "grammer" for **grammar**, "reaseach" for **research**, plus texting shortcuts ("u", "ur") leaking from your phone into work. Typing speed is good; the fix is a 2-second re-read and spell-check, not slowing down. None of these mean you don't know the word — they're muscle-memory typos, and muscle memory is easy to retrain.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| can u do reaseach on grammer for me | can you do **research** on **grammar** for me | "grammar" ends in **-ar**; "research" is re-**search**; spell out **you** |
| ur branch is out of date | **your** branch is out of date | "ur" is texting; write **your** |
| plz review thx | **please** review, **thanks** | "plz/thx" are chat shortcuts, not PR English |
| this seperate module | this **separate** module | there's **a rat** in sep-**a-ra**-te |
| definately a bug | **definitely** a bug | it's **finite** inside: de-**finite**-ly |
| recieve the webhook payload | **receive** the webhook payload | i before e **except after c** |
| the error occured on retry | the error **occurred** on retry | double the **r**: oc-**curr**-ed |
| recomend merging | **recommend** merging | one **c**, two **m**: re-**comm**-end |
| set the enviroment variable | set the **environment** variable | don't drop the **n**: enviro**n**-ment |
| missing paramter in the call | missing **parameter** in the call | para-**meter**, like a measuring meter |
| this is depricated, dont use it | this is **deprecated**, don't use it | **depre**-cated (not "depri"); add the apostrophe in **don't** |
| async call is asyncronous | the call is **asynchronous** | a-**syn-chro**-nous (has "chron", like chronology) |
| db dependancy needs updating | db **dependency** needs updating | ends in **-ency**: depend-**ency** |

## Patterns to remember

**The dev-writing "always misspelled" wall.** Pin these where you can see them:

| Word | Hook to remember it |
|---|---|
| sep**a**r**a**te | "there's **a rat** in separate" |
| defin**ite**ly | hidden word **finite** |
| recomm**end** | one c, **two m** |
| occu**rr**ed / occu**rr**ing | double c, double r |
| necess**a**ry | one c, **two s** — "one collar, two sleeves" |
| environ**m**ent | keep the **n** before -ment |
| param**eter** | a "meter" measures a parameter |
| l**e**ngth / str**e**ngth | -ength, not -enght |
| succ**eed** | two c, two e (but "succe**ss**", "su**cc**essful") |
| begin**ning** | double the **n** before -ing |
| unt**il** | one **l** at the end (not "untill") |
| maint**enance** | **-enance**, not "-ainance" |

**i before e:**
- Yes: bel**ie**ve, ach**ie**ve, retr**ie**ve, f**ie**ld.
- After c, flip: rec**ei**ve, dec**ei**ve, c**ei**ling.
- (Real-world exceptions exist — "weird", "seize" — but the rule covers the words you type most.)

**Doubling before -ing / -ed** (one short stressed syllable → double):
- run → ru**nn**ing, set → se**tt**ing, commit → commi**tt**ed, refer → refe**rr**ed.
- But NOT when stress isn't on that syllable: **open → opening**, **offer → offered**, **enter → entered**.

**Words that sound alike — don't swap them:**

| Word | Means | Dev example |
|---|---|---|
| **which** | the relational one | "the branch **which** broke CI" |
| witch | Halloween | (never in a PR) |
| **parameter** | a function input | "pass the timeout **parameter**" |
| perimeter | a boundary length | (geometry, not your API) |
| **a lot** | two words, "many" | "fixed **a lot** of typos" |
| ~~alot~~ | not a word | ✗ |

## In your daily writing

- **Commits:** "fix: handle null **parameter** in webhook **receive** handler" — re-read the subject line once; a typo there is permanent in history.
- **PR titles/descriptions:** turn on your editor's spell-check for Markdown. "**Separate** the **environment** config" reads as careful; "Seperate the enviroment config" reads as rushed.
- **Slack standups:** write **you**, **your**, **please**, **thanks** in full. "plz check ur PR thx" is fine with a friend, not in a team channel.
- **Code comments:** `// receive the response, then retry if it occurred to fail` — comments live in the codebase forever; spell them like docs.
- **Tickets/bug reports:** "**Definitely** reproducible — the error **occurred** after the **asynchronous** call." Clear spelling makes the report trustworthy.

## Drills

Fix the spelling/word issue in each (some have more than one). Don't peek at the key.

1. Fix this Slack message: "can u do reaseach on grammer for me"
2. Fix: "this needs a seperate enviroment for testing"
3. Fill the blank: "I before E except after ___" — and spell the verb for "to get a payload": re____.
4. Choose A or B: The error (A) occured (B) occurred during the async retry.
5. Fix: "I definately recomend we merge this"
6. Fill the blank: commit → commi____ (add the -ed form).
7. Choose A or B: We need to pass the (A) parameter (B) perimeter to the function.
8. Fix the texting style: "plz review ur branch thx"
9. Fill the blank: open → ____ing; run → ____ing (mind the doubling rule).
10. Fix: "this api is depricated and the dependancy is old"
11. Choose A or B: The branch (A) witch (B) which broke CI.
12. Fix all the typos: "the maintainance window will continue untill the migration succeds"

---

## Answer key

1. **"Can you do research on grammar for me?"** — spell out **you**; **research** (re-search); **grammar** ends in -ar; capitalize the first word and add a question mark.
2. **"this needs a separate environment for testing"** — **separate** ("a rat"); **environment** keeps the **n**.
3. **except after C**; **receive** — i before e, but flip after c.
4. **B — occurred** — double the c and r before -ed.
5. **"I definitely recommend we merge this"** — **definitely** (hidden "finite"); **recommend** (one c, two m).
6. **committed** — short stressed syllable doubles the **t** before -ed.
7. **A — parameter** — a function input; "perimeter" is a boundary length.
8. **"Please review your branch. Thanks!"** — full words, capital first letter, full stop.
9. **opening; running** — "open" isn't stressed on the last part, so no doubling; "run" is, so double the **n**.
10. **"this API is deprecated and the dependency is old"** — **deprecated** (not "depri-"); **dependency** ends in -ency; "API" is uppercase.
11. **B — which** — relational word; "witch" is Halloween.
12. **"the maintenance window will continue until the migration succeeds"** — **maintenance** (-enance); **until** (one l); **succeeds** (two c, two e, plus the -s).

---

*Part of the Developer English course — see [00-index.md](./00-index.md).*
