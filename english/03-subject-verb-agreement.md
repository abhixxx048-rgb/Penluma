# 03 — Subject–verb agreement

*What this fixes for you: the verb matching the subject, so your PRs and standups stop saying "the tests passes" or "the users is" — small slips that make solid work read as sloppy.*

## The rule in 30 seconds

- One thing → singular verb. Many things → plural verb. "The test **passes**" / "The tests **pass**".
- The verb agrees with the **real subject**, not the noun nearest to it: "The list of files **is** ready" (the *list* is ready, not the files).
- "each", "every", "everyone", "one of …" are all **singular**: "Each endpoint **returns** JSON", "One of the tests **fails**".
- "There is" for one, "There are" for many: "There **is** one failing test", "There **are** two open PRs".

## Why this trips you up

In your first language the verb may not change with the subject the way it does in English, so you reach for one form and stick with it. You also tend to drop the plural **-s** on nouns ("so much mistake" instead of "so many mistakes"), which then knocks the verb out of agreement too. And when a long phrase sits between the subject and the verb ("the list of failing files"), you match the verb to whatever word is closest instead of the true subject.

## See it / fix it

| ❌ What you tend to write | ✅ Correct | Why |
|---|---|---|
| the tests passes now | the tests **pass** now | Plural subject ("tests") → plural verb (no -s). |
| the test pass after my fix | the test **passes** after my fix | Singular subject ("test") → verb takes -s. |
| the list of files are uploaded | the list of files **is** uploaded | The subject is "list" (singular), not "files". |
| each of the services need restart | each of the services **needs** a restart | "each" is singular → "needs"; also add the article "a". |
| there is two failing checks | there **are** two failing checks | Two checks → plural → "there are". |
| one of the migrations fail on prod | one of the migrations **fails** on prod | "one" is the subject → singular → "fails". |
| the API return 500 sometimes | the API **returns** 500 sometimes | Singular subject "API" → "returns". |
| the users is logged out randomly | the users **are** logged out randomly | Plural subject "users" → "are". |
| everyone have access to the repo | everyone **has** access to the repo | "everyone" is singular → "has". |
| the data are missing in the response | the data **is** missing in the response | In dev/everyday writing, treat "data" as singular: "data is". |
| so much mistake in this PR | so **many mistakes** in this PR | "mistakes" is countable → use "many" + plural -s. |
| none of the endpoints is documented | none of the endpoints **are** documented | With a plural "of" phrase, "none … are" reads naturally. |

## Patterns to remember

**Find the real subject first.** Cross out the "of …" phrase, then pick the verb.

| Subject phrase | Real subject | Verb |
|---|---|---|
| the list of files | list | is / was |
| a set of rules | set | applies |
| one of the tests | one | fails |
| each of the configs | each | needs |
| the array of users | array | contains |

**Singular crew (always a singular verb):** each, every, everyone, everybody, someone, nobody, anything, one of, neither (alone).
> Each / every / -one / -body → **verb + s**. "Everybody **is** here", "Each field **is** required".

**There is vs there are:** match the verb to what comes *after* it.
> "There **is** a bug." / "There **are** bugs." When listing mixed items, match the first: "There **is** one error and three warnings."

**Collective nouns (team, group, staff, list):** in American English, treat them as **singular** by default. "The team **is** shipping today", "The QA team **owns** this." (British writing allows "the team are", but stay singular to be safe.)

**Countable test — many vs much:**
> Can you count it? → plural -s + **many** (many mistakes, many bugs, many requests).
> Can't count it (a mass)? → **much** (much progress, much memory, much traffic).

## In your daily writing

- **Commit messages:** "Fix race condition where the worker **drops** events" — singular "worker" → "drops". Quick scan: is the doer one or many?
- **PR titles:** "These changes **make** the build **pass**" — plural "changes" → "make"; "build" is one → "pass" (because the helper "make" already carries the agreement, the next verb stays base form).
- **Standups (Slack):** "All the tests **pass** locally" not "passes". "One of my branches **is** still red" not "are".
- **Code comments:** "// This function **returns** null when the cache **is** empty" — both subjects singular → both verbs take -s/"is".
- **Bug reports:** "The API **returns** 200 but the body **is** empty" — describe each singular subject with a singular verb; it reads precise and credible.

## Drills

Fix the agreement (and any dropped plural / article you spot).

1. the list of failing tests are getting longer.
2. each of the services run in its own container.
3. one of the env variables are missing on staging.
4. there is three open pull request on this repo.
5. the API endpoints returns different shapes — fix this.
6. everyone on the team have merge rights now.
7. the data from the webhook are not validated.
8. Choose A or B: "Neither of the builds (A) pass / (B) passes the lint step."
9. Fill the blank: "The set of rules ___ (apply) only to admin users."
10. so much edge case is not covered by the test.
11. Choose A or B: "There (A) is / (B) are a memory leak and two slow queries."
12. the team are responsible for this incident, and i will write the postmortem.

---

## Answer key

1. **The list of failing tests is getting longer.** Subject is "list" (singular) → "is"; also capitalize the first word.
2. **Each of the services runs in its own container.** "each" is singular → "runs".
3. **One of the env variables is missing on staging.** "one" is the subject → "is".
4. **There are three open pull requests on this repo.** Three → "are"; "requests" needs the plural -s.
5. **The API endpoints return different shapes — fix this.** Plural "endpoints" → "return" (no -s).
6. **Everyone on the team has merge rights now.** "everyone" is singular → "has".
7. **The data from the webhook is not validated.** Treat "data" as singular in dev writing → "is".
8. **B — passes.** "Neither" alone is singular → "passes".
9. **applies.** "The set … applies"; subject is "set" (singular), not "rules".
10. **So many edge cases are not covered by the test.** Countable → "many" + plural "cases" → "are"; capitalize "So".
11. **A — is.** "There is" matches the first item ("a memory leak", singular).
12. **The team is responsible for this incident, and I will write the postmortem.** American English: collective "team" is singular → "is"; capitalize "I".

---

*Part of the Developer English course — see [00-index.md](./00-index.md).*
