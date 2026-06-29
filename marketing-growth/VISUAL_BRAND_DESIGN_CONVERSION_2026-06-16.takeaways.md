**This document is about how the look and feel of your online store affects whether shoppers trust you and buy from you. It maps out what is already built, what is broken, and what needs to be fixed so that every store looks like itself — and no one else's — every time a customer visits.**

**The main parts explained simply:**

- **Brand color system (design tokens)** — The platform has a built-in system where changing one "primary color" is supposed to update buttons, links, and highlights everywhere on the store automatically. The foundation works, but two of the three store themes do not use it properly.

- **Cross-tenant brand bleed (highest urgency)** — A serious technical flaw means that when two different stores load at the same time, one store's colors and logo could accidentally appear on the other store's page. A customer might see a competitor's branding while they are about to buy. This is the most urgent thing to fix.

- **Fake and broken trust signals** — Some stores currently show "4.9/5 from 12,000+ customers" even when the store has zero real reviews. The newsletter sign-up form looks like it works but does nothing. Links to /faq and /terms pages go nowhere (404 errors). These make shoppers doubt the store and abandon their purchase.

- **Platform name leaking into store copy** — The words "Print Flow 360" are showing up inside store content that customers read. Customers should only see the store owner's brand name, not the name of the software behind it.

- **Missing building blocks (primitives)** — The platform is missing standard reusable pieces like a shared button, input field, and pop-up (modal). Without these, each page section is styled by hand and inconsistencies pile up across the whole storefront. Building these is the key step that makes everything else easier to fix.

- **Aurora theme cannot be rebranded** — One of the three available store themes (Aurora) was built with thousands of hardcoded color rules and does not support the one-color rebrand feature that the platform advertises. Store owners who choose Aurora get none of the branding engine.

- **Loading, empty, and error states** — When a page is fetching data, is empty, or hits an error, users need to see something helpful — not a blank screen. Many pages are still missing one or more of these states, which makes the store look broken.

- **SEO and social sharing meta** — The text that appears in Google search results and when someone shares a link on social media is inconsistent or shows placeholder text. This is the first impression before a customer even visits, and it needs to match the real store.

- **Six-phase improvement plan** — The document lays out a step-by-step plan (from quick day-long fixes to multi-week architectural work) for making all of the above right.

**What to do with this:** Fix the fake review numbers, broken newsletter form, and dead links first — these are hurting buyer trust right now and can be done in a day or two. Then prioritize the technical fix that stops one store's brand from leaking into another store's page, as that is a serious trust and reputation risk.
