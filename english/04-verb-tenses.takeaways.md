**This document teaches you which verb form to use depending on when something happened — and how to stay consistent within a sentence. If you have ever written "I am fix the bug" or mixed up "I fixed" with "I have fixed", this is the fix. Getting tenses right makes your standups, commit messages, and PR descriptions sound clear and professional.**

**The main parts explained simply:**

- **Present simple** — Use this to describe how code works or a regular habit. Example: "The function returns a UUID." or "We deploy on Fridays." This is your default tense for code comments and documentation.

- **Past simple** — Use this when something is fully finished and you know exactly when. Example: "I fixed the bug yesterday." If your sentence mentions a specific time (yesterday, last Monday, at 3pm), use this tense.

- **Present perfect ("have/has + done")** — Use this when something just finished but it still matters right now. Example: "I have pushed the fix." or "The build has finished." Use words like "already", "just", or "so far" as a signal for this tense.

- **Present continuous ("am/is/are + doing")** — Use this for something happening right now, in progress. Example: "I am working on it." or "The tests are running."

- **The "I am ___" trap** — After "am", "is", or "are", you must add -ing to the next verb. "I am fix" is wrong. "I am fixing" is right. If you do not want -ing, drop the helper word: just say "I fixed it."

- **Perfect vs. past: the time-word test** — Named time (yesterday, last week, on Monday) → use past simple. Vague relevance now (already, just, so far) → use present perfect.

- **Commit and PR titles use the command form** — Write "Fix the bug", not "Fixed the bug" or "Fixing the bug." Git titles complete the sentence: "If applied, this commit will Fix the bug." Always the bare command: Fix, Add, Remove, Update.

- **Different places, different tenses** — Standup past = past simple. Standup today = present continuous. Code comments = present simple. Bug reports = past simple for what happened, present simple for what keeps happening.

**What to do with this:** Work through the 12 drills at the bottom of the document — they cover every trap listed above. Then check your next PR description and standup message against the four-tense cheat sheet before you send them.
