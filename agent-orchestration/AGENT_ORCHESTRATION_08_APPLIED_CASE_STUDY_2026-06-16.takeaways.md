**This document explains how the AI features inside Print-Flow-360 actually work right now — and where smarter AI could be added in the future. It matters because AI tools like the product builder and design generator directly save time for store owners, and knowing what is real versus what is just an idea helps set realistic expectations for what to build next.**

**The main parts explained simply:**

- **The 7 AI features that exist today** — The platform has seven AI tools: a product builder (you describe a product in plain words and it creates a draft), an SEO title and description writer, a product description writer, an email template writer, a design layout generator, an image generator, and a background remover. Each works on its own.

- **One shared pipeline for all AI calls** — Every feature sends its request through one central piece of code. Think of it as a shared telephone exchange. Any feature can use it; it handles sending the question to the AI provider, getting the answer back, and recording what the call cost.

- **Per-store API keys** — Each store uses its own AI provider account (Anthropic or OpenAI), stored in that store's settings. No store's credits are shared with another store.

- **Single question, single answer — no memory** — Every AI call today is a one-shot exchange: one question in, one answer out. The AI does not remember earlier questions and does not loop back to check its own work. Simple and reliable, but limited in what it can do.

- **The design generator's safety guardrails** — The design AI is the most advanced existing feature. It is allowed to pick only from a fixed list of templates, colors, and fonts — it cannot invent a free-form layout. This is deliberate: it stops the AI from producing unpredictable or unusable results. This guardrail approach is the right model to copy when adding more AI features.

- **Four things the AI cannot do yet** — It cannot call internal tools (like searching the product catalog), cannot cache large system prompts to save cost, cannot match an existing catalog product (it only creates new ones), and all AI runs live inside the web request — meaning multi-step AI would slow the page down.

- **Future ideas mapped out (none built yet)** — The document outlines four realistic upgrades: a smarter product matcher that finds an existing product instead of always creating a new one; a writing chain that generates a description, then SEO text, then a launch email in one flow; an automatic customer support sorter; and a design quality checker that regenerates a design if it fails basic checks. All are research only.

**What to do with this:** The single most important step before any multi-step AI idea can work is enabling background job processing (switching from `sync` queue to Redis). Without it, any AI flow that needs more than one step will freeze the page for the user while it waits. Fix that first, then any of the future opportunities become buildable.
