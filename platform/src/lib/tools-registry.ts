// Single source of truth for the writing-tool suite. Every tool page, the tools
// hub, and the RelatedTools component read from here so slugs/titles/icons stay
// in sync. Ported into Penluma; the two app-landing pages (browser extension,
// Obsidian plugin) were dropped and the flagship em-dash cleaner is a first-class
// tool page at /tools/em-dash-remover.

export type ToolCategory = 'clean' | 'analyze';

export interface Tool {
  slug: string;
  href: string;
  icon: string;
  title: string;
  desc: string;
  category: ToolCategory;
}

// Helper so we never desync slug and href.
const t = (
  slug: string,
  icon: string,
  title: string,
  desc: string,
  category: ToolCategory
): Tool => ({ slug, href: '/tools/' + slug, icon, title, desc, category });

export const TOOLS: Tool[] = [
  // Clean & convert
  t('em-dash-remover', '-', 'Em Dash Remover', 'Strip em dashes, smart quotes, invisible characters and AI tells from your text.', 'clean'),
  t('invisible-watermark-character-inspector', '👻', 'Invisible Character Inspector', 'See and strip hidden zero-width, watermark and bidi characters.', 'clean'),
  t('word-reading-time-counter', '🔢', 'Word & Reading-Time Counter', 'Live word, character, sentence counts, reading time and platform limits.', 'clean'),
  t('before-after-diff-viewer', '🔬', 'Before/After Diff Viewer', 'Compare original vs cleaned text with per-change accept/reject.', 'clean'),
  t('readability-grade-level-scorer', '📊', 'Readability Scorer', 'Flesch, Flesch-Kincaid, Gunning Fog grade levels and hard sentences.', 'clean'),
  t('emoji-decorative-symbol-stripper', '🚫', 'Emoji & Symbol Stripper', 'Remove emoji and decorative bullets while keeping meaningful symbols.', 'clean'),
  t('case-converter', '🔠', 'Case Converter', 'UPPER, lower, Sentence, Title (AP/Chicago) and developer cases.', 'clean'),
  t('whitespace-line-break-reflow-fixer', '↹', 'Whitespace & Reflow Fixer', 'Collapse spaces and unwrap hard-wrapped PDF/email text into paragraphs.', 'clean'),
  t('paste-from-word-docs-cleaner', '📋', 'Paste-from-Word Cleaner', 'Strip Word/Docs formatting soup, keep real paragraphs.', 'clean'),
  t('markdown-to-clean-prose', '📝', 'Markdown → Clean Prose', 'Strip ##, **bold**, bullets and tables from ChatGPT output into clean prose.', 'clean'),
  t('straight-to-curly-quotes-converter', '“”', 'Straight-to-Curly Quotes', 'Add correct curly quotes, apostrophes and proper dashes for publishing.', 'clean'),
  t('sentence-splitter', '✂️', 'Sentence Splitter', 'One sentence per line with a cadence chart for auditing rhythm.', 'clean'),

  // Analyze & improve
  t('human-voice-ai-tell-report', '🫀', 'Human-Voice / AI-Tell Report', 'Flag cadence, clichés and patterns that make a draft read like AI.', 'analyze'),
  t('homoglyph-confusables-detector', '🕵️', 'Homoglyph Detector', 'Find Cyrillic/Greek look-alike characters hiding in Latin text.', 'analyze'),
  t('passive-voice-weasel-word-highlighter', '🎯', 'Passive-Voice Highlighter', 'Highlight passive voice, weak adverbs and weasel words.', 'analyze'),
  t('read-aloud-proofreader', '🔊', 'Read-Aloud Proofreader', 'Hear your text read aloud to catch run-ons and missing words.', 'analyze'),
  t('local-voice-style-memory', '🧠', 'Voice / Style Memory', 'Build a private style profile and flag where a draft stops sounding like you.', 'analyze'),
];

// The em-dash cleaner is the hub of the suite, surfaced as a related item for
// (almost) every tool.
export const CORE: Tool = TOOLS[0];

const BY_SLUG: Record<string, Tool> = Object.fromEntries(
  TOOLS.map((tool) => [tool.slug, tool])
);

// Hand-authored workflow neighbours: ordered by how naturally a user moves from
// one tool to the next. The em-dash cleaner is appended for other tools when
// there's room.
const RELATED: Record<string, string[]> = {
  'em-dash-remover': [
    'before-after-diff-viewer',
    'invisible-watermark-character-inspector',
    'human-voice-ai-tell-report',
    'straight-to-curly-quotes-converter',
  ],

  // Clean & convert
  'invisible-watermark-character-inspector': [
    'homoglyph-confusables-detector',
    'paste-from-word-docs-cleaner',
    'emoji-decorative-symbol-stripper',
  ],
  'word-reading-time-counter': [
    'readability-grade-level-scorer',
    'sentence-splitter',
    'human-voice-ai-tell-report',
  ],
  'before-after-diff-viewer': [
    'paste-from-word-docs-cleaner',
    'whitespace-line-break-reflow-fixer',
    'straight-to-curly-quotes-converter',
  ],
  'readability-grade-level-scorer': [
    'word-reading-time-counter',
    'sentence-splitter',
    'passive-voice-weasel-word-highlighter',
  ],
  'emoji-decorative-symbol-stripper': [
    'invisible-watermark-character-inspector',
    'paste-from-word-docs-cleaner',
    'human-voice-ai-tell-report',
  ],
  'case-converter': [
    'straight-to-curly-quotes-converter',
    'whitespace-line-break-reflow-fixer',
    'paste-from-word-docs-cleaner',
  ],
  'whitespace-line-break-reflow-fixer': [
    'paste-from-word-docs-cleaner',
    'before-after-diff-viewer',
    'sentence-splitter',
  ],
  'paste-from-word-docs-cleaner': [
    'markdown-to-clean-prose',
    'invisible-watermark-character-inspector',
    'whitespace-line-break-reflow-fixer',
  ],
  'markdown-to-clean-prose': [
    'emoji-decorative-symbol-stripper',
    'paste-from-word-docs-cleaner',
    'human-voice-ai-tell-report',
  ],
  'straight-to-curly-quotes-converter': [
    'case-converter',
    'paste-from-word-docs-cleaner',
    'before-after-diff-viewer',
  ],
  'sentence-splitter': [
    'readability-grade-level-scorer',
    'human-voice-ai-tell-report',
    'word-reading-time-counter',
  ],

  // Analyze & improve
  'human-voice-ai-tell-report': [
    'passive-voice-weasel-word-highlighter',
    'sentence-splitter',
    'local-voice-style-memory',
  ],
  'homoglyph-confusables-detector': [
    'invisible-watermark-character-inspector',
    'paste-from-word-docs-cleaner',
    'emoji-decorative-symbol-stripper',
  ],
  'passive-voice-weasel-word-highlighter': [
    'human-voice-ai-tell-report',
    'readability-grade-level-scorer',
    'read-aloud-proofreader',
  ],
  'read-aloud-proofreader': [
    'sentence-splitter',
    'passive-voice-weasel-word-highlighter',
    'readability-grade-level-scorer',
  ],
  'local-voice-style-memory': [
    'human-voice-ai-tell-report',
    'passive-voice-weasel-word-highlighter',
    'read-aloud-proofreader',
  ],
};

/**
 * Curated, intent-sensible related tools for a given slug.
 * Order: hand-authored neighbours → the em-dash cleaner (for other tools) →
 * same-category fallbacks. Never includes the tool itself; deduped; capped at n.
 */
export function relatedFor(slug: string, n = 4): Tool[] {
  const self = BY_SLUG[slug];
  const out: Tool[] = [];
  const seen = new Set<string>([slug]);

  const push = (s: string) => {
    if (out.length >= n || seen.has(s)) return;
    const tool = BY_SLUG[s];
    if (!tool) return;
    seen.add(s);
    out.push(tool);
  };

  // 1. Hand-authored neighbours.
  for (const s of RELATED[slug] ?? []) push(s);

  // 2. Always surface the em-dash cleaner for other tools when there's room.
  if (slug !== 'em-dash-remover') push('em-dash-remover');

  // 3. Fall back to same-category tools to fill any remaining slots.
  if (out.length < n && self) {
    for (const tool of TOOLS) {
      if (tool.category === self.category) push(tool.slug);
    }
  }

  return out.slice(0, n);
}
