# Research Notes - Chapter 11: AI and the Future of UI/UX (2026 and Beyond)

Research compiled 2026-07-04 from primary/expert sources: Nielsen Norman Group (State of UX 2026, Generative UI), Jakob Nielsen (UX Tigers / Substack), Figma's 2025 AI Report (2,500 respondents), Microsoft HAX Toolkit, Google PAIR Guidebook, UC Berkeley iSchool research, Gartner, World Economic Forum, plus documented case studies (Klarna, Duolingo, Shopify). These notes are the writer's ONLY source for the chapter - everything needed is here.

---

## 1. The Big Picture: Where AI and Design Stand in 2025–2026

**Plain-English framing:** After the 2023–2024 hype cycle, 2025 was "the year of post-hype AI" and NN/g calls 2026 "the year of AI fatigue." The extreme optimists were wrong (AI didn't replace designers); the extreme pessimists were wrong (no catastrophe). Reality landed in the middle: AI genuinely transformed production work (especially coding and prototyping) but its limitations persist - inconsistency, hallucinations, edge-case failures, and a permanent need for human oversight. (NN/g, State of UX 2026)

**Key NN/g State of UX 2026 findings** (nngroup.com/articles/state-of-ux-2026/):
- The UX job market **stabilized in late 2024–2025** after a sharp 2023–2024 decline, but recovery is uneven: senior and generalist roles recover faster; **entry-level roles remain scarce and highly competitive**.
- Organizations "ask more of each role," compressing responsibilities once spread across specialists. Roles increasingly demand "breadth and judgment, not just artifacts."
- **UI is becoming a commodity**: "UI is cheaper to produce, due to standardization" (design systems + AI generation). Blunt quote: if you just "slap together components from a design system, you're already replaceable by AI."
- The differentiators that resist automation: **curated taste, research-informed understanding, critical thinking, careful judgment**.
- **Trust is named THE major design problem for AI experiences in 2026** - agents ship before they're ready, users burned by bad AI features hesitate to adopt new ones. Building confidence requires transparency, control, consistency, and support when the system fails.
- Both practitioners and users are fatigued: practitioners by replacement threats and pressure to ship untested AI features; users by ubiquitous "lazy AI features" and "AI slop." NN/g: "Winners will treat AI as a tool that recedes into the background."
- UX work shifts **from output-driven to insight-driven**: wireframes and prototypes are now table stakes; teams must show strategic depth, evidence-based reasoning, and measurable business impact. Avoid "shallow UX" and "design theater."

**Hard numbers on adoption (Figma's 2025 AI Report, survey of 2,500 designers/developers, figma.com/blog/figma-2025-ai-report-perspectives/):**
- **86%** of creators use generative AI in their work.
- **78%** agree AI significantly enhances efficiency - but only **32%** say they can rely on AI output. (The efficiency/trust gap is the single most quotable stat of the era.)
- **33%** are launching AI-powered products this year, up 50% from 2024; **51%** of AI builders are building agents (up from 21% in 2024).
- Developer vs designer split: **82%** developer satisfaction with AI tools vs **69%** designer; **59%** of developers use AI for core work (code gen) vs only **31%** of designers for core design work. Interpretation: AI is better at code than at design taste.
- **85%** say learning to work with AI is essential to future success; **73%** see rising demand for AI-tool proficiency; **79%** for skill in designing AI products.
- **95%** agree design is at least as important for AI products as for traditional ones; **52%** say it matters MORE.
- Success factor: **60%** of successful AI-product teams explored multiple design/technical approaches vs **39%** of unsuccessful ones - iteration breadth predicts success. 76% of teams cite vague goals like "experimenting with AI" (a warning sign); only 9% cite revenue growth.
- In the design phase specifically: 33% use AI to generate assets (images/copy), 22% use AI for first-draft interfaces.

**Job outlook anchor:** The World Economic Forum's Future of Jobs projections rank UX/UI design **8th among the fastest-growing jobs through 2030**. The field is transforming, not disappearing.

---

## 2. The AI Design Tool Landscape (what each tool actually does)

**Figma AI + Figma Make.** Figma AI adds prompt-to-design generation, UI copywriting suggestions, auto layer renaming, and semantic search across team files. Figma Make is text-to-design/prototype generation. NN/g's caveat (2025): these speed up chores (renaming, copy, asset search) but "can't replicate the insight of human designers," and broad generative systems "often fail to produce production-ready wireframes." Figma's MCP (Model Context Protocol) server entered beta in early 2026 with bidirectional Claude Code integration - meaning coding agents can read live design files instead of static exports; commentators call MCP "the most meaningful architectural shift in design-to-code in years."

**v0 (Vercel).** Prompt-to-React/Tailwind UI. Strong for aesthetic, production-adjacent web UI; output is real code, biased toward Vercel's stack (Next.js + shadcn/ui).

**Lovable.** Conversational full-stack app builder - the flagship "vibe coding" tool: describe the product in natural language, get a working app (front end + backend + auth + DB). Best for MVPs and validation prototypes; signed a multiyear Google Cloud deal (Claude + Gemini access). Typical designer workflow: Lovable for a working prototype in minutes → validate → rebuild properly.

**Cursor / Claude Code (and GPT/Codex equivalents).** Agentic coding tools. Cursor = AI-native IDE; Claude Code = terminal agent that reads an entire codebase and builds integrated features, honoring existing design systems (especially when paired with Figma MCP / Code Connect). These moved designers from "handoff" to "hands-on": a designer can now prototype in production code.

**Midjourney (and Firefly, etc.) for visuals.** Used for concept exploration, mood boards, style tests, hero imagery - rarely for final UI. Practitioner data point: mood boards that took hours of stock-photo hunting now take ~20 minutes. Midjourney's Moodboards feature lets designers train a personal style from selected reference images. Typical flow: explore direction in Midjourney → bring refs into Figma → custom execution.

**Claude / GPT as general design collaborators.** Used for: UX writing, heuristic critique of screenshots, research-note synthesis, persona/journey drafts, accessibility review, prompt-to-component code. Claude Artifacts / ChatGPT canvas enable instant interactive prototypes from a description.

**Rule of thumb (2026 practice):** most teams run **2–3 AI tools together**, and "integration beats isolation" - the winners live inside Figma, the IDE, or existing workflows rather than as standalone destinations. A common stack: Midjourney (imagery) + Figma/Figma Make (product design) + a coding agent (Cursor/Claude Code) for build.

---

## 3. Generative UI, Adaptive UI, and Outcome-Oriented Design

Source: NN/g, "Generative UI and Outcome-Oriented Design" (Kate Moran & Sarah Gibbons, 2024) - nngroup.com/articles/generative-ui/

- **Generative UI (GenUI) definition:** "A user interface that is dynamically generated in real time by artificial intelligence to provide an experience customized to fit the user's needs and context." The interface assembles itself per user and moment, instead of one fixed screen for everyone.
- **Crucial distinction:** GenUI ≠ AI-assisted design tools (v0, Uizard). AI-assisted design speeds up the TEAM; GenUI customizes the experience for the END USER at runtime.
- **NN/g's flight-booking example:** "Alex" opens a Delta app that renders with a dyslexia-friendly font and contrast, ranks flights by her personal priorities (cost, travel time), surfaces window-seat availability, collapses red-eyes, and weaves in weather alerts - personalization at the scale of Delta's ~190 million yearly flyers, one interface per person.
- **Outcome-oriented design:** designers stop designing discrete screens for the "average user" and instead design **adaptive frameworks and guardrails**: parameters instead of pixels; priority rules ("must show / should show / never show"); constraints the AI must respect; heavier investment in research and testing; balancing personalization against consistency.
- **Known risks NN/g flags:** hallucinations and bias transfer directly into the UI; heavy compute cost; privacy risk (deep personalization needs personal data); user confusion when the interface keeps changing (loss of spatial memory and predictability).

**Related 2026 trend language:** UI moving from "fixed screens" to "intent-driven, generated-on-demand" surfaces - adaptive, agentic, ambient. Treat this as directional, not fully shipped: most production GenUI today is constrained (reordering, theming, module selection), not free-form generation.

---

## 4. Conversational and Agentic Interfaces - the New Design Surface

**Jakob Nielsen's "third paradigm" claim** (jakobnielsenphd.substack.com/p/ai-is-first-new-ui-paradigm-in-60): AI is the first new UI paradigm in ~60 years. Paradigm 1: batch processing. Paradigm 2: command-based interaction (command lines AND GUIs - user specifies each step). Paradigm 3: **intent-based outcome specification** - the user says WHAT they want, the computer decides HOW. This reverses the locus of control.

**The Articulation Barrier** (Nielsen): prompt-first products (one text box does everything) are powerful but hard to use, because most people - especially the roughly half of the population with lower literacy - struggle to articulate their intent in written prose. Empty text boxes are the new "blank page problem."

**Nielsen's six prompt-augmentation UX patterns** to lower the barrier: **Style Galleries** (pick from visual examples), **Prompt Rewrite** (AI improves your prompt), **Targeted Prompt Rewrite**, **Related Prompts** (suggestions), **Prompt Builders** (structured forms that assemble prompts), and **Parametrization** (sliders/toggles for tone, length, style). His prediction: winning AI UX will be **hybrid** - intent-based specification combined with GUI affordances, because "GUIs show people what can be done rather than requiring them to articulate what they want."

**Prompt design IS UX design now:** the system prompt, suggestion chips, example prompts, follow-up questions, and error messages of a chat product are its information architecture. Designers write and test them like they used to test navigation labels.

**Agentic interfaces:** Gartner named agentic AI its top 2025 tech trend and projects **40% of enterprise applications will integrate task-specific AI agents by end of 2026, up from under 5% in 2025** - most needing an interface layer that didn't exist a year earlier. Agent UX = designing for software that ACTS autonomously rather than waiting for commands. Required patterns:
- **Status visibility:** show what the agent is doing right now (streaming steps, activity logs, plan previews).
- **Explainability:** why it chose an action ("I recommended this because it matches your prior searches").
- **Override/interrupt controls:** the user can stop, redirect, or take over at any point.
- **Graceful recovery:** when the agent fails mid-workflow, restore the user to exactly where they were and explain what happened - errors must never cost the user their work.
- **Approval gates:** irreversible or costly actions (sending, paying, deleting) require explicit confirmation.

---

## 5. What AI Does Well vs. Poorly in Design

**AI is genuinely good at:**
- **Volume and speed of generation:** dozens of layout/copy/flow variants in seconds; first drafts of wireframes, components, and production front-end code.
- **Production chores:** layer renaming, asset resizing/search, copy variants, alt-text drafts, design-token consistency checks.
- **Research acceleration:** transcribing and clustering interview notes, summarizing analytics, drafting discussion guides, heuristic first-pass reviews.
- **Code:** the developer numbers (59% core-work usage, 82% satisfaction) show code generation is AI's strongest design-adjacent capability.
- **Inspiration:** highly diverse visual directions for mood boards and concept exploration.

**AI is poor at:**
- **Taste and judgment** - it cannot decide whether a design is actually GOOD for this audience, brand, and moment. UC Berkeley iSchool research ("Aesthetic Taste and Its Limits," 2026) identified **six recurring breakdown types in prompt-mediated design**: Vocabulary Gap (can't name what you want), Execution Gap (AI can't execute what you named), Convergence Trap (outputs drift to the same safe average), Tacit Ceiling (tacit knowledge can't be verbalized), Authorship Disconnect (designers don't feel the work is theirs), and Risk-Reward Freeze. Core structural problem: designers know what they want before they can SAY it, and prompt tools force judgment into language too early.
- **Originality / aesthetic position:** "distributional convergence" - LLMs predict the statistical average of their training data, so unguided output defaults to Inter font, purple/lavender gradients, centered heroes, rounded cards, glassmorphism. An audit of **1,590 Show HN landing pages found more than half share the same AI-generated visual fingerprint** ("generated by a chat interface without an opinion"). "AI slop has no aesthetic position - it is the output of averaging; it resembles everything and argues for nothing."
- **Production-readiness:** frequent misalignment, unreadable text, broken states, inaccessible markup; NN/g notes broad generative tools rarely produce production-ready wireframes.
- **Real user understanding:** NN/g research shows **synthetic users (AI-generated personas) cannot replace real user research** - they reflect training-data averages, not your actual users' behavior.
- **Context, politics, and tradeoffs:** why legal blocked that flow, why the KPI is retention not clicks, what the CEO promised a customer - none of this is in the model.

**The new bottleneck:** when agents generate dozens of plausible variants in seconds, the limiting factor is no longer creativity-as-generation but **creativity-as-selection** - human taste is the bottleneck ("Taste Is the New Bottleneck," designative.info, 2026).

---

## 6. Designing FOR AI Products: Trust, Uncertainty, Hallucinations, Human-in-the-Loop

This is the fastest-growing design specialty (79% of Figma respondents see rising demand for it).

**Canonical frameworks to cite:**
- **Microsoft HAX Toolkit - 18 Guidelines for Human-AI Interaction** (Amershi et al., 2019; microsoft.com/en-us/haxtoolkit/ai-guidelines/). Organized by interaction phase: *Initially* (make clear what the system can do, and how well); *During interaction* (time services on context, show contextually relevant info, match social norms, mitigate biases); *When wrong* (support efficient dismissal/correction, explain why the system did what it did, scope services when in doubt); *Over time* (learn from behavior, update cautiously, encourage feedback, convey consequences, allow global controls). Comes with a Design Library of patterns/examples and a team Workbook.
- **Google PAIR People + AI Guidebook** (pair.withgoogle.com): chapters on user needs ("Determine if AI adds value" - the canonical "should this even be AI?" heuristic), mental models, explainability + trust, feedback + control, errors + graceful failure.

**Core trust/uncertainty patterns (synthesized from HAX, PAIR, NN/g, UXmatters 2025, Institute of Product Management):**
1. **Set expectations up front:** state capabilities AND limits ("I can draft emails; I can't access your calendar"). Calibrated trust beats maximal trust - you want users to trust the system exactly as much as it deserves.
2. **Communicate uncertainty honestly:** confidence indicators ("85% confident"), hedged language, "double-check this" nudges on low-confidence output. Principle: **confident wrong answers destroy trust; honest uncertainty preserves it.**
3. **Ground and cite:** show sources for factual claims so users can verify (the primary hallucination mitigation in UX terms - make verification cheap).
4. **Explain why:** human-readable rationales ("Recommended because you watched X").
5. **Human-in-the-loop (HITL):** AI augments rather than replaces decisions. Always allow review, override, correction, and alternative workflows. For high-stakes outputs, route through a **human review queue** with a fast, unambiguous approve/reject/edit interface showing the AI output plus key decision points.
6. **Draft, don't send:** default AI output to an editable draft state; the user commits. Reversibility (undo) everywhere.
7. **Graceful failure:** on error, restore state, explain what happened, offer a manual path. Never dead-end.
8. **Feedback loops:** thumbs up/down, corrections that visibly improve behavior - and say so ("Thanks - I'll deprioritize red-eyes").
9. **Progressive trust:** start with low-stakes autonomy; expand agent permissions as the user opts in (autonomy sliders / approval thresholds).
10. **Preserve agency and information flow:** don't bury users in AI output; let them control verbosity and frequency; make AI recede into the background (NN/g 2026).

**Case study - Klarna (the definitive over-automation cautionary tale):**
- Feb 2024: Klarna's OpenAI-powered assistant handled **2.3 million conversations in its first month - two-thirds of all customer-service chats - equivalent to ~700 full-time agents**, with CSAT on par with humans, **25% fewer repeat inquiries**, resolution time down from 11 minutes to under 2, projected **$40M profit improvement**; headcount fell from ~5,500 to ~3,400. (openai.com/index/klarna, klarna.com press release)
- 2025: CEO Sebastian Siemiatkowski publicly **walked it back** - service quality and customer satisfaction had declined; cost had become "a too predominant evaluation factor." Klarna began rehiring humans and moved to a hybrid model: AI for tier-1 volume, humans for the complex ~20%.
- Chapter lesson: over-automation is a real, measurable failure mode; design the human escape hatch from day one; efficiency metrics can lie about experience quality.

**Mini cases - AI-first mandates reshaping design orgs:** Shopify CEO Tobi Lütke's published memo made "reflexive AI usage" the baseline - teams must show why agents can't do the work before requesting headcount. Duolingo's Luis von Ahn imposed the same rule. Implication for designers: fluency with AI tooling is now an explicit performance expectation at many product companies, but "AI-first ≠ AI-only" - human judgment stays in the loop for work that requires it.

---

## 7. How Designer Roles Are Shifting

- **The design engineer / designer-engineer hybrid** is the emblematic new role: deep UX principles + front-end craft (accessibility, design tokens, semantic markup, grid systems; tools like Figma, React, Storybook, CSS). AI/vibe coding collapsed the designer-developer wall - one person can now take an idea from concept to working, integrated code. Multiple 2025–2026 industry essays call it "the logical evolution of the product creator."
- **Compression of roles** (NN/g): one person now covers research + design + prototyping-in-code + AI integration. Specialist-only profiles (pure wireframers, pure visual designers) are most exposed.
- **From maker of screens to orchestrator/editor:** designers increasingly direct AI systems (write guardrails, curate outputs, define quality bars) rather than push every pixel. "Outcome-oriented" designers define rules and constraints; AI renders instances.
- **From output to insight:** value shifts to problem framing, research interpretation, tradeoff framing, storytelling, stakeholder alignment, and measurable business impact.
- **New specialties emerging:** AI-product designer (trust/uncertainty UX), conversation designer, prompt/context engineer for design systems, AI-ops for design systems (keeping tokens/components AI-consumable via MCP).
- Estimated task impact: analyses in 2026 suggest AI automates **up to ~40% of entry-level UI production tasks** while amplifying research-focused skills (myuxacademy.com 2026 reality check) - treat as an estimate, not a census figure.

---

## 8. Which Skills Remain Valuable (and Why)

Durable, AI-resistant skills (converging list from NN/g 2026, Figma 2025, UX Collective):
1. **Taste / curation** - choosing the best of many machine-made options; developing a point of view. (Convergence means differentiation is now a human act.)
2. **Judgment & critical thinking** - knowing why a flow should work, what breaks if it doesn't, when AI output is wrong.
3. **Real user research** - synthetic users don't work; observing actual humans is the moat. Research is repeatedly named the #1 durable skill.
4. **Systems thinking** - design systems, token architecture, service design, understanding how a change propagates.
5. **Ethics & responsibility** - 36% of designers surveyed by NN/g (2025) fear AI will spread **dark patterns "under the guise of UX optimization"**; someone must be the human who says no. Includes bias auditing, privacy, accessibility.
6. **Communication & facilitation** - running discovery workshops, aligning stakeholders, presenting rationale persuasively; sharper in relief as production work automates.
7. **AI literacy** - knowing how LLMs behave, where they fail, how users form mental models of AI features; enough technical fluency to design responsibly for AI products (not full engineering).
8. **Business fluency** - tying design decisions to outcomes; NN/g's core 2026 advice: "adaptability, strategy, and discernment."

---

## 9. Realistic Career Guidance (for the chapter's closing)

- **Honest answer to "will AI replace UX designers?": no, but it is redistributing the work.** Production/UI-assembly tasks are automating; framing, research, judgment, and AI-product design are growing. WEF: UX/UI is a top-10 fastest-growing job through 2030.
- **Entry level is the hard part.** Junior roles are scarce (NN/g), because AI does much of what juniors used to do. Counter-strategies: build hybrid skills early (design + code + AI tooling); ship real projects end-to-end with AI tools as proof of judgment, not just artifacts; specialize in AI-product UX. Path Unbound student data (2024–25): juniors who mastered **prompting + UX research + design systems saw 2× more interview callbacks**.
- **Learn the tools without outsourcing the thinking.** 85% say AI fluency is essential - but the 32%-reliability stat means your value is verifying and improving AI output.
- **Portfolio shift:** show process, reasoning, tradeoffs, and measured outcomes - not just polished screens (screens are cheap now). Document where you overrode the AI and why.
- **Positioning ladder:** most exposed → component assembler; safest → researcher-strategist, design engineer, AI-product designer.
- **Practical weekly habit:** use one AI tool per project phase (Midjourney for direction, Figma AI for drafts, a coding agent for prototype), then critique its output against heuristics - this trains both fluency AND taste.

---

## 10. Common Mistakes (chapter checklist)

1. **Shipping AI slop:** accepting the model's default aesthetic (Inter, lavender gradients, glassmorphism, identical card grids). Fix: give deliberate art direction, feed real references, separate creative planning from implementation, keep a design-system doc as source of truth.
2. **Prompt-only UX:** forcing everything through an empty text box (articulation barrier). Fix: hybrid UI - suggestions, galleries, parameters.
3. **Faking certainty:** AI answers presented as fact with no confidence cues, sources, or verify affordances.
4. **No human escape hatch / over-automation:** the Klarna failure; automating the complex 20% that needed humans.
5. **Skipping research because AI is "faster":** synthetic users and AI personas mirror averages, not your users.
6. **Vague AI goals:** 76% of teams "experimenting with AI" without a user problem - build AI features for outcomes, not novelty.
7. **Trust-by-decoration:** sparkle icons and "AI-powered" badges instead of transparency, control, and recovery.
8. **Treating AI output as final:** it's a first draft; only 32% of practitioners find it reliable.
9. **Ignoring accessibility/bias in generated UI:** generated markup is often semantically broken; GenUI inherits model bias.
10. **Dark-pattern drift:** letting "AI optimization" quietly maximize engagement at users' expense (the 36% fear).

---

## Expert Rules of Thumb (pull-quotes for the chapter)

- "AI is the first new UI paradigm in 60 years - from command-based interaction to intent-based outcome specification." - Jakob Nielsen
- "Confident wrong answers damage trust; honest uncertainty preserves it."
- "Generation is cheap; selection is expensive. Taste is the new bottleneck."
- "Design the escape hatch before you design the automation." (Klarna lesson)
- "If you're just assembling design-system components, you're already replaceable by AI." - NN/g, State of UX 2026
- "Winners will treat AI as a tool that recedes into the background." - NN/g
- "AI-first is not AI-only." (Shopify/Duolingo/Klarna synthesis)
- Microsoft HAX G1–G2: "Make clear what the system can do - and how well it can do it."

---

## Sources

- NN/g - State of UX in 2026: https://www.nngroup.com/articles/state-of-ux-2026/
- NN/g - Generative UI and Outcome-Oriented Design (Moran & Gibbons): https://www.nngroup.com/articles/generative-ui/
- NN/g - The Era of AI Design (video): https://www.nngroup.com/videos/the-era-of-ai-design/
- NN/g - The UX Reckoning: Prepare for 2025 and Beyond: https://www.nngroup.com/articles/ux-reset-2025/
- NN/g - AI topic hub: https://www.nngroup.com/topic/ai/
- Figma - 2025 AI Report (perspectives): https://www.figma.com/blog/figma-2025-ai-report-perspectives/ and full report: https://www.figma.com/reports/ai-2025/
- Figma - Top AI Tools for UX Designers 2026: https://www.figma.com/resource-library/ai-tools-for-ux-designers/
- Figma - Design statistics: https://www.figma.com/resource-library/design-statistics/
- Jakob Nielsen - AI Is First New UI Paradigm in 60 Years: https://jakobnielsenphd.substack.com/p/ai-is-first-new-ui-paradigm-in-60
- Jakob Nielsen - The Articulation Barrier: https://jakobnielsenphd.substack.com/p/prompt-driven-ai-ux-hurts-usability
- Jakob Nielsen - Prompt Augmentation patterns: https://jakobnielsenphd.substack.com/p/prompt-augmentation
- Microsoft HAX Toolkit - 18 Guidelines for Human-AI Interaction: https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/
- Google PAIR - People + AI Guidebook: https://pair.withgoogle.com/guidebook/
- UC Berkeley iSchool - Aesthetic Taste and Its Limits (prompt-mediated design breakdowns): https://ischool.berkeley.edu/projects/2026/aesthetic-taste-and-its-limits-breakdowns-prompt-mediated-design-user-interfaces
- OpenAI - Klarna case study: https://openai.com/index/klarna/
- Klarna press - AI assistant first month: https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/
- Klarna walk-back analysis: https://www.twig.so/blog/klarna-ai-customer-support-efficiency and https://blog.promptlayer.com/klarna-customer-service-from-ai-first-to-human-hybrid-balance/
- AI-first strategy (Shopify/Duolingo/Box/Klarna): https://www.anderssorman-nilsson.com/blog/ai-keynote-speaker-think-ai-first-not-ai-only-what-duolingo-shopify-box-and-klarna-teach-us-about-ai-workflow-strategy-in-2026
- Agent UX 2026 (incl. Gartner 40% agent-integration projection): https://fuselabcreative.com/ui-design-for-ai-agents/
- Taste Is the New Bottleneck: https://www.designative.info/2026/02/01/taste-is-the-new-bottleneck-design-strategy-and-judgment-in-the-age-of-agents-and-vibe-coding/
- Why AI Design Looks Generic (distributional convergence): https://superdesign.dev/blog/why-ai-design-looks-generic
- AI slop landing-page audit (1,590 Show HN pages): https://www.925studios.co/blog/ai-slop-web-design-guide
- AI Design Slop patterns: https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- AI UX design patterns (uncertainty, HITL): https://www.institutepm.com/knowledge-hub/ai-ux-design-patterns
- Designing Trust in AI Products: https://standardbeagle.com/designing-trust-in-ai-products/
- UXmatters - Design Psychology of Trust in AI (Nov 2025): https://www.uxmatters.com/mt/archives/2025/11/the-design-psychology-of-trust-in-ai-crafting-experiences-users-believe-in.php
- Rise of the Design Engineer: https://leemunroe.medium.com/the-rise-of-the-design-engineer-d428e7d681fd and https://www.paraform.com/blog/what-is-a-design-engineer-and-how-they-re-different-from-product-engineers
- Will AI Replace UX Designers? (2026 reality check, ~40% entry-task automation estimate): https://myuxacademy.com/blog/will-ai-replace-ux-designers/
- Junior designer outlook + 2× callbacks data: https://pathunbound.com/will-ai-replace-junior-ui-ux-designers-the-hard-truth/
- Midjourney in UX workflows: https://www.uxdesigninstitute.com/blog/midjourney-ai-in-ui-design/ and https://docs.midjourney.com/hc/en-us/articles/39193335040013-Moodboards
- Claude Code + Figma MCP workflows: https://uxdesign.cc/designing-with-claude-code-and-codex-cli-building-ai-driven-workflows-powered-by-code-connect-ui-f10c136ec11f
- Figma Make vs Lovable comparison: https://www.bonanza-studios.com/blog/figma-make-vs-lovable-figma-make-is-the-winner-by-a-long-shot
- AI won't touch taste (UX Collective): https://uxdesign.cc/ai-is-coming-for-our-design-jobs-but-it-cant-touch-taste-afd5c7a48184
