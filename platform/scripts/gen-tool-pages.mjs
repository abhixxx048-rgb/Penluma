// One-shot generator for the /tools/<slug> pages. Each page is a thin, native
// Penluma wrapper (ToolLayout) around a ported interactive component. Re-runnable:
// it overwrites the generated pages. Content (ledes, FAQs, steps) lives here so
// the 20 pages stay consistent. Run: `node scripts/gen-tool-pages.mjs`.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'pages', 'tools');
mkdirSync(OUT, { recursive: true });

// slug → PascalCase component name under components/tools/. em-dash-remover is
// special (the flagship Cleaner lives at components/Cleaner.astro).
const pascal = (slug) =>
  slug.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());

const PRIVACY_FAQ = {
  q: 'Is my text uploaded or stored anywhere?',
  a: 'No. Everything runs in your browser with plain JavaScript - your text is never uploaded, stored, or logged. Open your browser’s DevTools Network tab while you use it and you’ll see zero requests. The tool also works offline.',
};

// Per-tool content. `steps` becomes a "How to use" list; `body` is an optional
// extra paragraph; `featureList` feeds WebApplication schema.
const CONTENT = {
  'em-dash-remover': {
    component: '../../components/Cleaner.astro',
    eyebrow: 'AI text cleanup · Free · In your browser',
    title: 'Em Dash Remover - Clean AI Text, Smart Quotes & Invisible Characters',
    description:
      'Free, grammar-aware em dash remover. Strip em dashes, smart quotes, invisible characters and AI tells from your text - 100% in your browser. Your text never leaves your device.',
    keywords: ['em dash remover', 'remove em dashes', 'clean ai text', 'strip smart quotes', 'ai text cleaner'],
    lede:
      'Paste text and strip <strong>em dashes, smart quotes, and invisible watermark characters</strong> in one pass - grammar-aware, so it swaps dashes for the right punctuation instead of blindly deleting them.',
    definition:
      'An em dash remover is a free tool that replaces or deletes em dashes (-) and other AI-tell punctuation, turning machine-formatted text back into clean, natural prose.',
    steps: [
      'Type or paste your text into the box (or try an example).',
      'Choose how dashes are replaced and which marks to clean.',
      'Copy the cleaned result, or open the diff to review each change.',
    ],
    faqs: [
      { q: 'Does removing em dashes bypass AI detection?', a: 'No - and that isn’t the point. Swapping punctuation doesn’t reliably fool detectors, and chasing that is a losing game. This tool is for editing quality: it removes the mechanical em-dash habit so your writing reads like a person wrote it.' },
      { q: 'What does it do besides em dashes?', a: 'It also normalizes smart/curly quotes to straight ones (or vice versa), strips zero-width and other invisible characters, and flags common AI tells so you can fix cadence and clichés by hand.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Grammar-aware em dash replacement', 'Smart-quote normalization', 'Invisible-character stripping', 'AI-tell flagging', 'Before/after diff'],
  },

  'invisible-watermark-character-inspector': {
    eyebrow: 'Hidden characters · Free · In your browser',
    title: 'Invisible Character Inspector - Find & Strip Zero-Width & Watermark Characters',
    description:
      'Reveal and remove hidden zero-width, watermark and bidirectional characters that sneak into copied or AI-generated text. Free, in-browser, nothing uploaded.',
    keywords: ['invisible character remover', 'zero width character', 'watermark character', 'strip hidden characters'],
    lede:
      'Reveal the <strong>zero-width, watermark, and bidirectional characters</strong> hiding inside pasted or AI-generated text - then strip them in one click.',
    definition:
      'Invisible characters are code points with no visible glyph (zero-width spaces, joiners, bidi controls) that can watermark text, break search, or corrupt code.',
    steps: [
      'Paste the suspect text into the inspector.',
      'See every hidden character highlighted and named.',
      'Strip them and copy the clean version.',
    ],
    faqs: [
      { q: 'What is a zero-width character?', a: 'A code point that takes up no visual space, such as the zero-width space (U+200B) or zero-width joiner (U+200D). They’re invisible on screen but still present in the text, which is how they end up watermarking or corrupting a paste.' },
      { q: 'Why would text contain watermark characters?', a: 'Some AI tools and documents insert invisible characters to track or fingerprint text. They’re harmless to read but can flag a paste as machine-generated or break code and spreadsheets.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Detects zero-width, bidi and watermark characters', 'Per-character naming and highlighting', 'One-click strip', 'Works offline'],
  },

  'word-reading-time-counter': {
    eyebrow: 'Counts & limits · Free · In your browser',
    title: 'Word & Reading-Time Counter - Live Word, Character & Read-Time Stats',
    description:
      'Count words, characters, sentences and reading time as you type, with platform limits for tweets, titles and meta descriptions. Free and fully in-browser.',
    keywords: ['word counter', 'character counter', 'reading time calculator', 'words to minutes'],
    lede:
      'Live <strong>word, character, sentence, and reading-time</strong> counts as you type - plus at-a-glance limits for tweets, SEO titles, and meta descriptions.',
    definition:
      'A word and reading-time counter tallies your text in real time and estimates how long it takes to read at an average pace.',
    steps: [
      'Type or paste your text.',
      'Watch words, characters, sentences and read time update live.',
      'Check the platform limit chips before you publish.',
    ],
    faqs: [
      { q: 'How is reading time calculated?', a: 'By dividing the word count by an average silent reading speed (about 200–250 words per minute). It’s an estimate - dense or technical prose reads slower.' },
      { q: 'How many words is a 5-minute read?', a: 'Roughly 1,000–1,250 words at a typical reading pace. The counter shows the exact estimate for your text as you type.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Live word/character/sentence counts', 'Reading-time estimate', 'Platform limit indicators', 'No signup'],
  },

  'before-after-diff-viewer': {
    eyebrow: 'Compare text · Free · In your browser',
    title: 'Before/After Diff Viewer - Compare Two Versions of Text',
    description:
      'Paste an original and an edited version to see every change highlighted, then accept or reject each one. Word- and character-level diff, free and in-browser.',
    keywords: ['text diff', 'compare two texts', 'before after diff', 'diff checker'],
    lede:
      'Paste two versions of a passage and see <strong>every insertion and deletion highlighted</strong> - then accept or reject each change individually.',
    definition:
      'A diff viewer compares two blocks of text and marks exactly what was added, removed, or changed between them.',
    steps: [
      'Paste the original text on one side and the edited text on the other.',
      'Review the highlighted additions and deletions.',
      'Accept or reject changes and copy the merged result.',
    ],
    faqs: [
      { q: 'What is the difference between a word and character diff?', a: 'A word diff highlights whole changed words, which is easier to read for prose. A character diff marks the exact letters that changed, which is useful for small edits like a single typo or punctuation fix.' },
      { q: 'Can I compare two versions of a document?', a: 'Yes - paste the old version and the new version into the two panes. Every difference is highlighted so you can spot exactly what an edit or an AI rewrite changed.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Word- and character-level diff', 'Per-change accept/reject', 'Merged output', 'Runs offline'],
  },

  'readability-grade-level-scorer': {
    eyebrow: 'Readability · Free · In your browser',
    title: 'Readability Scorer - Flesch, Flesch-Kincaid & Gunning Fog Grade Levels',
    description:
      'Score your writing with Flesch Reading Ease, Flesch-Kincaid and Gunning Fog, and see which sentences are too hard. Free readability checker, fully in-browser.',
    keywords: ['readability checker', 'flesch reading ease', 'flesch kincaid grade level', 'gunning fog'],
    lede:
      'Score your writing with <strong>Flesch Reading Ease, Flesch-Kincaid, and Gunning Fog</strong> - and see exactly which sentences are dragging the grade level up.',
    definition:
      'A readability scorer estimates how hard your text is to read using formulas based on word and sentence length, reported as a school grade level.',
    steps: [
      'Paste your draft into the scorer.',
      'Read the reading-ease score and grade-level estimates.',
      'Rewrite the hardest highlighted sentences and re-check.',
    ],
    faqs: [
      { q: 'What is a good readability score?', a: 'For general audiences, aim for a Flesch Reading Ease of 60–70 (roughly an 8th–9th grade level). Marketing and web copy often target an even easier score; technical writing can go higher, but shorter sentences almost always help.' },
      { q: 'What is the difference between Flesch Reading Ease and Flesch-Kincaid?', a: 'Reading Ease returns a 0–100 score where higher is easier. Flesch-Kincaid converts the same inputs into a U.S. school grade level, so a result of 8.0 means an average 8th grader could read it.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Flesch Reading Ease', 'Flesch-Kincaid grade level', 'Gunning Fog index', 'Hard-sentence highlighting'],
  },

  'emoji-decorative-symbol-stripper': {
    eyebrow: 'Cleanup · Free · In your browser',
    title: 'Emoji & Symbol Stripper - Remove Emoji and Decorative Bullets',
    description:
      'Remove emoji, decorative bullets and ornamental symbols from text while keeping meaningful ones like currency and math. Free, in-browser emoji remover.',
    keywords: ['remove emoji', 'emoji remover', 'strip symbols', 'remove decorative bullets'],
    lede:
      'Strip <strong>emoji and decorative bullets</strong> from a paste while keeping the symbols that actually carry meaning - currency, math, and the like.',
    definition:
      'An emoji and symbol stripper removes pictographic and ornamental characters from text, leaving clean, plain prose.',
    steps: [
      'Paste text that’s peppered with emoji or bullet symbols.',
      'Choose whether to keep meaningful symbols.',
      'Copy the stripped, plain-text result.',
    ],
    faqs: [
      { q: 'How do I remove emojis from text?', a: 'Paste the text and the stripper removes every emoji in one pass. You can keep meaningful symbols (like €, %, or +) while clearing the decorative ones.' },
      { q: 'Will it remove bullet points and arrows?', a: 'Yes. Ornamental bullets, arrows and other decorative glyphs that AI output loves are removed, so you’re left with clean sentences you can reformat yourself.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Removes emoji and pictographs', 'Strips decorative bullets/arrows', 'Keeps meaningful symbols', 'No upload'],
  },

  'case-converter': {
    eyebrow: 'Capitalization · Free · In your browser',
    title: 'Case Converter - UPPER, lower, Title & Sentence Case Online',
    description:
      'Convert text to UPPER CASE, lower case, Sentence case and Title Case (AP, Chicago, APA, MLA), plus camelCase and snake_case. No signup, fully in-browser.',
    keywords: ['case converter', 'title case', 'sentence case', 'uppercase to lowercase', 'camelcase converter'],
    lede:
      'Convert any text to <strong>UPPER CASE, lower case, Sentence case, or Title Case</strong> - with real, style-guide-accurate capitalization for AP, Chicago, APA and MLA, plus developer cases like camelCase and snake_case.',
    definition:
      'A case converter changes the letter case of your text - switching uppercase to lowercase, capitalizing each word, or applying proper Title Case - in one click.',
    steps: [
      'Type or paste your text.',
      'Click the case you want, and pick a style guide for Title Case.',
      'Copy the converted result.',
    ],
    faqs: [
      { q: 'What is the difference between title case and sentence case?', a: 'Title Case capitalizes the major words of a heading (and lowercases small words like “the”, “of” and “and”). Sentence case capitalizes only the first word of each sentence plus proper nouns - the way normal prose is written.' },
      { q: 'What is the difference between AP and Chicago title case?', a: 'Mostly prepositions. AP capitalizes prepositions of four or more letters (From, With, Into) and lowercases short ones. Chicago lowercases all prepositions regardless of length. This converter applies each guide’s real small-word rules.' },
      PRIVACY_FAQ,
    ],
    featureList: ['UPPER and lower case', 'Sentence case', 'Title Case for AP/Chicago/APA/MLA', 'camelCase, snake_case, kebab-case and more'],
  },

  'whitespace-line-break-reflow-fixer': {
    eyebrow: 'Cleanup · Free · In your browser',
    title: 'Whitespace & Reflow Fixer - Fix Hard-Wrapped PDF and Email Text',
    description:
      'Collapse double spaces and unwrap hard-wrapped lines from PDFs and emails back into clean paragraphs. Free whitespace and line-break fixer, in-browser.',
    keywords: ['fix line breaks', 'remove double spaces', 'unwrap text', 'fix pdf line breaks'],
    lede:
      'Collapse stray spaces and <strong>unwrap hard-wrapped lines</strong> from PDFs and email quotes back into clean, flowing paragraphs.',
    definition:
      'A whitespace and reflow fixer removes extra spaces and joins mid-sentence line breaks so copied text reads as proper paragraphs again.',
    steps: [
      'Paste text copied from a PDF, email, or terminal.',
      'Let the fixer collapse spaces and rejoin broken lines.',
      'Copy the reflowed paragraphs.',
    ],
    faqs: [
      { q: 'How do I fix text copied from a PDF?', a: 'Paste it here. PDFs insert a hard line break at the end of every visual line; the fixer detects mid-sentence breaks and rejoins them into real paragraphs while preserving intentional breaks.' },
      { q: 'Will it remove double spaces?', a: 'Yes - it collapses runs of spaces and tabs to a single space and trims trailing whitespace, without touching the words themselves.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Collapses extra spaces', 'Unwraps hard-wrapped lines', 'Preserves real paragraph breaks', 'Runs offline'],
  },

  'paste-from-word-docs-cleaner': {
    eyebrow: 'Cleanup · Free · In your browser',
    title: 'Paste-from-Word Cleaner - Strip Word & Google Docs Formatting',
    description:
      'Strip the messy formatting, styles and hidden markup that come from pasting out of Word or Google Docs, keeping only clean paragraphs. Free and in-browser.',
    keywords: ['clean word formatting', 'paste from word', 'remove google docs formatting', 'clean pasted text'],
    lede:
      'Strip the <strong>formatting soup</strong> that rides along when you paste out of Word or Google Docs, keeping only real paragraphs and clean text.',
    definition:
      'A paste-from-Word cleaner removes the styles, spans and hidden markup that word processors attach to copied text, leaving plain, portable prose.',
    steps: [
      'Paste content copied from Word or Google Docs.',
      'Let the cleaner drop styling and hidden markup.',
      'Copy clean paragraphs ready for anywhere.',
    ],
    faqs: [
      { q: 'Why does text pasted from Word look weird?', a: 'Word and Google Docs attach hidden styling, smart quotes, non-breaking spaces and markup to whatever you copy. Pasted elsewhere, that baggage shows up as odd spacing and characters. This cleaner strips it back to plain text.' },
      { q: 'Does it keep paragraph breaks?', a: 'Yes - real paragraph breaks are preserved while the styling, extra whitespace and hidden characters around them are removed.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Removes Word/Docs styling', 'Normalizes smart quotes and spaces', 'Keeps real paragraphs', 'No signup'],
  },

  'markdown-to-clean-prose': {
    eyebrow: 'Cleanup · Free · In your browser',
    title: 'Markdown → Clean Prose - Strip Headings, Bold & Bullets from ChatGPT Output',
    description:
      'Strip Markdown headings, **bold**, bullet lists and tables from ChatGPT or AI output and get clean, publishable prose. Free Markdown-to-text tool, in-browser.',
    keywords: ['markdown to text', 'strip markdown', 'clean chatgpt output', 'remove markdown formatting'],
    lede:
      'Strip <strong>##&nbsp;headings, **bold**, bullet lists, and tables</strong> from ChatGPT output and get back clean, flowing prose you can publish.',
    definition:
      'A Markdown-to-prose converter removes Markdown syntax and list scaffolding, turning formatted AI output into plain, readable paragraphs.',
    steps: [
      'Paste Markdown-formatted AI output.',
      'Let the tool remove syntax and flatten lists.',
      'Copy the clean prose.',
    ],
    faqs: [
      { q: 'Why does ChatGPT output so much Markdown?', a: 'Chat models are trained to structure answers with headings, bold and bullet lists. It reads well in chat but looks cluttered pasted into a doc or CMS. This tool strips the syntax so you’re left with clean sentences.' },
      { q: 'Will it keep my links?', a: 'The converter flattens Markdown formatting into readable prose; you choose how aggressively to strip. Review the output and re-add any links you want to keep.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Strips headings, bold and italics', 'Flattens bullet and numbered lists', 'Removes tables and code fences', 'Runs offline'],
  },

  'straight-to-curly-quotes-converter': {
    eyebrow: 'Typography · Free · In your browser',
    title: 'Straight-to-Curly Quotes Converter - Smart Quotes & Proper Dashes',
    description:
      'Convert straight quotes to correct curly quotes and apostrophes, and hyphens to proper en/em dashes, for polished publishing. Free typography tool, in-browser.',
    keywords: ['curly quotes converter', 'smart quotes', 'straight to curly quotes', 'typographic quotes'],
    lede:
      'Turn straight quotes into <strong>correct curly quotes and apostrophes</strong>, and hyphens into proper en/em dashes - the typography publishing expects.',
    definition:
      'A curly-quotes converter replaces typewriter quotes with directional typographic quotes and fixes dash and apostrophe usage.',
    steps: [
      'Paste text with straight quotes.',
      'Convert to curly quotes, smart apostrophes and proper dashes.',
      'Copy the polished result.',
    ],
    faqs: [
      { q: 'What is the difference between straight and curly quotes?', a: 'Straight quotes are the typewriter marks that point straight down. Curly (“smart”) quotes curve toward the text they enclose and are the correct form for published prose. This converter picks the right opening or closing mark for each position.' },
      { q: 'Does it fix apostrophes too?', a: 'Yes - contractions and possessives get a proper curly apostrophe (’), including tricky leading apostrophes like ‘97.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Directional curly quotes', 'Smart apostrophes', 'Hyphen-to-dash conversion', 'No upload'],
  },

  'sentence-splitter': {
    eyebrow: 'Cadence · Free · In your browser',
    title: 'Sentence Splitter - One Sentence Per Line with a Cadence Chart',
    description:
      'Split a paragraph into one sentence per line and see a cadence chart of sentence lengths to audit rhythm. Free sentence splitter, fully in-browser.',
    keywords: ['sentence splitter', 'split text into sentences', 'sentence per line', 'sentence length checker'],
    lede:
      'Break a paragraph into <strong>one sentence per line</strong> and see a cadence chart of sentence lengths - the fastest way to spot monotonous rhythm.',
    definition:
      'A sentence splitter separates prose into individual sentences, one per line, so you can audit length and rhythm.',
    steps: [
      'Paste a paragraph or full draft.',
      'See each sentence on its own line with a length chart.',
      'Vary the sentences that all cluster at the same length.',
    ],
    faqs: [
      { q: 'How do I audit sentence rhythm?', a: 'Split the text so each sentence sits on its own line, then look at the cadence chart. If most bars are the same height, your sentences are all a similar length - a classic AI tell. Mix short and long sentences to fix it.' },
      { q: 'Does it handle abbreviations like "Dr." correctly?', a: 'Yes - the splitter is aware of common abbreviations and decimals, so it won’t break a sentence at “Dr.” or “3.14”.' },
      PRIVACY_FAQ,
    ],
    featureList: ['One sentence per line', 'Sentence-length cadence chart', 'Abbreviation-aware splitting', 'Works offline'],
  },

  'human-voice-ai-tell-report': {
    eyebrow: 'AI tells · Free · In your browser',
    title: 'Human-Voice / AI-Tell Report - Find What Makes Writing Read Like AI',
    description:
      'Get a report of the cadence, clichés and patterns that make a draft read like AI, so you can fix them for quality. Free AI-tell checker, fully in-browser.',
    keywords: ['ai tells', 'signs of ai writing', 'human voice checker', 'ai writing patterns'],
    lede:
      'Get a plain-English report of the <strong>cadence, clichés, and patterns</strong> that make a draft read like AI - so you can fix them for quality, not detector-bypass.',
    definition:
      'An AI-tell report flags the stylistic habits (uniform sentence length, stock phrases, over-hedging) that make writing feel machine-generated.',
    steps: [
      'Paste your draft.',
      'Read the flagged tells and where they cluster.',
      'Rewrite by hand to restore your own voice.',
    ],
    faqs: [
      { q: 'What are the signs of AI writing?', a: 'Uniform sentence length, stock transitions (“in today’s fast-paced world”), over-hedging, tidy three-item lists, and a relentlessly even tone. The report flags these so you can vary rhythm and cut clichés.' },
      { q: 'Is this an AI detector?', a: 'No. It doesn’t score a probability or try to beat detectors - it points at concrete writing habits so you can edit for quality. Better writing is the goal, not evasion.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Cadence analysis', 'Cliché and stock-phrase flags', 'Hedging and filler detection', 'Actionable, per-passage notes'],
  },

  'homoglyph-confusables-detector': {
    eyebrow: 'Security · Free · In your browser',
    title: 'Homoglyph Detector - Find Cyrillic & Greek Look-Alike Characters',
    description:
      'Detect Cyrillic, Greek and other look-alike characters disguised as Latin letters in your text - a common phishing and spoofing trick. Free, in-browser.',
    keywords: ['homoglyph detector', 'confusable characters', 'lookalike characters', 'unicode spoofing'],
    lede:
      'Find <strong>Cyrillic, Greek, and other look-alike characters</strong> disguised as ordinary Latin letters - the trick behind spoofed domains and phishing.',
    definition:
      'Homoglyphs are characters from different scripts that look identical to Latin letters (like Cyrillic “а” vs Latin “a”) and are used to disguise text.',
    steps: [
      'Paste the text or string you want to check.',
      'See every confusable character flagged with its real identity.',
      'Replace or remove the imposters.',
    ],
    faqs: [
      { q: 'What is a homoglyph attack?', a: 'Swapping a normal Latin letter for an identical-looking character from another script - for example a Cyrillic “а” in place of “a”. It’s used to spoof domain names and slip past filters. The detector reveals exactly which characters aren’t what they seem.' },
      { q: 'Why would text contain confusable characters?', a: 'Sometimes by accident (copying from another language), sometimes deliberately to evade detection or impersonate a brand. Either way, this tool shows which characters are mixed-script imposters.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Detects mixed-script confusables', 'Names each imposter character', 'Highlights spoofed spans', 'Runs offline'],
  },

  'passive-voice-weasel-word-highlighter': {
    eyebrow: 'Editing · Free · In your browser',
    title: 'Passive-Voice & Weasel-Word Highlighter - Tighten Your Prose',
    description:
      'Highlight passive voice, weak adverbs and weasel words so you can rewrite for direct, confident prose. Free writing-style highlighter, fully in-browser.',
    keywords: ['passive voice checker', 'weasel words', 'adverb highlighter', 'writing style checker'],
    lede:
      'Highlight <strong>passive voice, weak adverbs, and weasel words</strong> so you can rewrite flabby sentences into direct, confident prose.',
    definition:
      'This highlighter marks passive constructions and vague qualifiers (“very”, “basically”, “it is believed”) that weaken writing.',
    steps: [
      'Paste your draft.',
      'See passive voice and weasel words highlighted in place.',
      'Rewrite the flagged phrases in the active voice.',
    ],
    faqs: [
      { q: 'Why is passive voice an AI tell?', a: 'Models lean on passive constructions and hedges (“it could be argued”) that blur who did what. Human editors cut them for directness. The highlighter shows where they cluster so you can switch to the active voice.' },
      { q: 'What are weasel words?', a: 'Vague qualifiers that dodge commitment - “some say”, “basically”, “virtually”, “it is believed”. They pad a sentence without adding meaning; the tool flags them so you can cut or make them specific.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Passive-voice detection', 'Weasel-word flags', 'Adverb highlighting', 'No upload'],
  },

  'read-aloud-proofreader': {
    eyebrow: 'Proofreading · Free · In your browser',
    title: 'Read-Aloud Proofreader - Hear Your Text to Catch Errors',
    description:
      'Have your text read aloud in the browser to catch run-ons, missing words and awkward phrasing your eyes skip over. Free read-aloud proofreader, in-browser.',
    keywords: ['read aloud', 'text to speech proofreading', 'proofreading tool', 'hear text read'],
    lede:
      'Have your draft <strong>read aloud in your browser</strong> to catch the run-ons, missing words, and clumsy phrasing your eyes glide right past.',
    definition:
      'A read-aloud proofreader uses your browser’s speech synthesis to voice your text so you can hear errors instead of only seeing them.',
    steps: [
      'Paste the text you want to proof.',
      'Press play and follow the highlighted word.',
      'Fix anything that sounds wrong when spoken.',
    ],
    faqs: [
      { q: 'Why does reading aloud catch more errors?', a: 'Your eyes autocorrect familiar text, so you read what you meant to write. Hearing it forces every word to register, which surfaces missing words, doubled words, and sentences that run on too long.' },
      { q: 'Does it work offline?', a: 'It uses your browser’s built-in speech synthesis, which runs on your device. Availability of voices depends on your browser and OS, but no text is sent anywhere.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Browser speech synthesis', 'Word-follow highlighting', 'Adjustable rate', 'Nothing uploaded'],
  },

  'local-voice-style-memory': {
    eyebrow: 'Voice · Free · In your browser',
    title: 'Voice / Style Memory - Flag Where a Draft Stops Sounding Like You',
    description:
      'Build a private style profile from your own writing and flag where a new draft drifts from your voice. Stored locally, nothing uploaded. Free, in-browser.',
    keywords: ['writing voice', 'style profile', 'voice fingerprint', 'consistent writing voice'],
    lede:
      'Build a <strong>private style profile</strong> from your own writing, then flag where a new draft stops sounding like you - all stored locally on your device.',
    definition:
      'A voice/style memory learns the measurable habits of your writing (sentence length, favorite words, punctuation) and compares new drafts against them.',
    steps: [
      'Paste samples of your own writing to build a profile.',
      'Paste a new draft to compare against it.',
      'See where the draft drifts from your usual voice.',
    ],
    faqs: [
      { q: 'What is a writing voice fingerprint?', a: 'A profile of the measurable habits that make your writing yours - typical sentence length, vocabulary, punctuation rhythm. Comparing a draft to it shows where the text drifts, which is handy for spotting AI-inserted or ghost-edited passages.' },
      { q: 'Where is my style profile stored?', a: 'Entirely in your browser’s local storage on this device. Nothing is uploaded, and you can clear it at any time.' },
      PRIVACY_FAQ,
    ],
    featureList: ['Builds a local style profile', 'Flags voice drift in new drafts', 'Local-only storage', 'Works offline'],
  },
};

// Curated "Related reading" - links each tool page out to genuinely relevant
// blog posts (the tool -> blog half of the internal-linking pass). URLs are
// verified to exist. Keeps the tool suite woven into the content, not orphaned.
const P = {
  englishIndex: { url: '/blog/english/00-index', title: 'English for developers: the 7 mistakes to fix' },
  apostrophes: { url: '/blog/english/05-plurals-and-possessives', title: "Its vs it's: the apostrophe rules devs get wrong" },
  punctuation: { url: '/blog/english/07-punctuation-and-capitalization', title: 'Punctuation & capitalization that make you look senior' },
  runOns: { url: '/blog/english/08-sentence-structure-run-ons', title: 'Run-on sentences: why your PRs get skimmed' },
  devWriting: { url: '/blog/english/10-professional-dev-writing', title: 'Write like a senior dev: commits, PRs & reviews' },
  spelling: { url: '/blog/english/11-spelling-typos', title: 'Spelling mistakes developers make (and how to fix them)' },
  clearWriting: { url: '/blog/clear-thinking-and-expression/04-clear-writing-is-clear-thinking', title: 'Why clear writing is really just clear thinking' },
  clearSentence: { url: '/blog/clear-thinking-and-expression/05-from-fuzzy-idea-to-clear-sentence-the-smallest-unit', title: 'How to write one clear sentence' },
  editing: { url: '/blog/clear-thinking-and-expression/07-editing-turning-a-messy-draft-into-something-clear', title: 'How to edit your own writing' },
  newsletter: { url: '/blog/make-money-with-ai/09-newsletter-business', title: 'How to build a newsletter business' },
  blogging: { url: '/blog/make-money-with-ai/10-blogging-seo-ai-search', title: 'Niche blogging & SEO after AI overviews' },
  digitalProducts: { url: '/blog/make-money-with-ai/11-selling-digital-products', title: 'Selling digital products: templates & prompt packs' },
  contextEng: { url: '/blog/ai-llm-engineering/03-context-engineering-retrieval', title: 'Context engineering: feeding an LLM the right facts' },
  aiJudgment: { url: '/blog/ai-llm-engineering/05-ai-product-judgment', title: 'When to use AI (and when plain code wins)' },
};
const RELATED_READING = {
  'em-dash-remover': [P.blogging, P.aiJudgment, P.punctuation],
  'invisible-watermark-character-inspector': [P.aiJudgment, P.blogging],
  'word-reading-time-counter': [P.newsletter, P.blogging],
  'before-after-diff-viewer': [P.editing, P.aiJudgment],
  'readability-grade-level-scorer': [P.clearWriting, P.blogging, P.runOns],
  'emoji-decorative-symbol-stripper': [P.blogging, P.newsletter],
  'case-converter': [P.punctuation, P.devWriting],
  'whitespace-line-break-reflow-fixer': [P.devWriting, P.editing],
  'paste-from-word-docs-cleaner': [P.devWriting, P.blogging],
  'markdown-to-clean-prose': [P.blogging, P.aiJudgment],
  'straight-to-curly-quotes-converter': [P.punctuation, P.apostrophes],
  'sentence-splitter': [P.runOns, P.clearSentence, P.editing],
  'human-voice-ai-tell-report': [P.blogging, P.aiJudgment, P.digitalProducts],
  'homoglyph-confusables-detector': [P.aiJudgment, P.contextEng],
  'passive-voice-weasel-word-highlighter': [P.editing, P.clearSentence, P.devWriting],
  'read-aloud-proofreader': [P.editing, P.spelling],
  'local-voice-style-memory': [P.clearWriting, P.editing, P.blogging],
};

const page = (slug, c) => {
  const comp = c.component || `../../components/tools/${pascal(slug)}.astro`;
  const compName = /\/([A-Za-z0-9]+)\.astro$/.exec(comp)[1];
  const stepsHtml = c.steps.map((s) => `        <li>${s}</li>`).join('\n');
  const kw = JSON.stringify(c.keywords);
  const features = JSON.stringify(c.featureList);
  const related = RELATED_READING[slug] || [];
  const relatedHtml = related.length
    ? `
    <h2 class="text-2xl font-bold">Related reading</h2>
    <ul class="list-disc space-y-2 pl-6 muted">
${related.map((r) => `      <li><a href="${r.url}">${r.title}</a></li>`).join('\n')}
    </ul>`
    : '';
  const faqs = JSON.stringify(c.faqs, null, 2)
    .split('\n')
    .map((l, i) => (i === 0 ? l : '  ' + l))
    .join('\n');
  return `---
// AUTO-GENERATED by scripts/gen-tool-pages.mjs - edit content there, not here.
import ToolLayout from '../../layouts/ToolLayout.astro';
import ${compName} from '${comp}';
import TrustStrip from '../../components/TrustStrip.astro';

const faqs = ${faqs};
---

<ToolLayout
  slug="${slug}"
  title=${JSON.stringify(c.title)}
  description=${JSON.stringify(c.description)}
  keywords={${kw}}
  eyebrow=${JSON.stringify(c.eyebrow)}
  h1=${JSON.stringify(c.h1 || c.title.split(/\s+[--]\s+/)[0])}
  lede=${JSON.stringify(c.lede)}
  definition=${JSON.stringify(c.definition)}
  faqs={faqs}
  featureList={${features}}
>
  <${compName} />

  <TrustStrip />

  <div class="mx-auto mt-16 max-w-5xl px-4 sm:px-6">
    <article class="seo max-w-3xl space-y-5 leading-relaxed">
    <p class="eyebrow text-mark">The short version</p>
    <hr class="rule-dash" />
    <h2 class="text-2xl font-bold">How to use it</h2>
    <ol class="list-decimal space-y-2 pl-6 muted">
${stepsHtml}
    </ol>
    <h2 class="text-2xl font-bold">Private by design</h2>
    <p class="muted">
      There is no server and no upload. Everything runs with plain JavaScript on
      your device, so you can safely work with confidential or unpublished text.
      Open your browser's DevTools Network tab while you use it and you'll see
      zero requests - and it keeps working with your connection turned off.
    </p>
${relatedHtml}
    </article>
  </div>
</ToolLayout>
`;
};

let n = 0;
for (const [slug, c] of Object.entries(CONTENT)) {
  writeFileSync(join(OUT, `${slug}.astro`), page(slug, c));
  n++;
}
console.log(`Generated ${n} tool pages into src/pages/tools/`);
