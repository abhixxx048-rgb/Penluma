// ---------------------------------------------------------------------------
// Topic registry for the blog platform.
//
// Each key is a folder name in the research root (../). For each topic you can
// set: title, description, category (for nav grouping), icon (emoji), order,
// and `published`.
//
// DEFAULTS: any folder NOT listed here is auto-published with a prettified
// title — so when you add a brand-new research folder later, it appears on the
// blog automatically. List a folder with `published: false` to keep it private
// (used here for the internal PrintFlow360 business/strategy research).
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  'Engineering',
  'AI & LLMs',
  'Money & Business',
  'Thinking & Decisions',
  'Communication',
  'Certifications',
];

export const TOPICS = {
  // ---- Engineering ----
  'system-design': {
    title: 'System Design',
    description:
      'A 20-module, staff-level curriculum: from back-of-the-envelope estimation to consensus, consistency models, and real-world case studies.',
    category: 'Engineering',
    icon: '🏗️',
    order: 1,
    featured: true,
  },
  'distributed-systems': {
    title: 'Distributed Systems',
    description: 'The hard middle of modern engineering — replication, partitioning, and failure.',
    category: 'Engineering',
    icon: '🌐',
    order: 2,
  },
  'systems-fundamentals': {
    title: 'Systems Fundamentals',
    description: 'How computers actually work underneath the abstractions.',
    category: 'Engineering',
    icon: '⚙️',
    order: 3,
  },
  'security-privacy-engineering': {
    title: 'Security & Privacy Engineering',
    description: 'Building software that protects its users and their data.',
    category: 'Engineering',
    icon: '🔒',
    order: 4,
  },
  'computer-graphics-print': {
    title: 'Computer Graphics for Print',
    description: 'Color, raster, vector, and the craft of getting pixels onto paper.',
    category: 'Engineering',
    icon: '🖨️',
    order: 5,
  },
  'print-production-craft': {
    title: 'Print Production Craft',
    description: 'The practical craft behind professional print production.',
    category: 'Engineering',
    icon: '📐',
    order: 6,
  },

  // ---- AI & LLMs ----
  'agent-orchestration': {
    title: 'Multi-Agent LLM Systems',
    description: 'Foundations, patterns, protocols (MCP/A2A), memory, reliability, and cost of agentic systems.',
    category: 'AI & LLMs',
    icon: '🤖',
    order: 1,
    featured: true,
  },
  'ai-llm-engineering': {
    title: 'AI & LLM Engineering',
    description: 'Building, evaluating, and shipping with large language models.',
    category: 'AI & LLMs',
    icon: '🧠',
    order: 2,
  },
  'ai-learning-platform': {
    title: 'AI Learning Platform',
    description: 'Notes on building AI-powered learning experiences.',
    category: 'AI & LLMs',
    icon: '🎓',
    order: 3,
  },

  // ---- Money & Business ----
  'economics-from-first-principles': {
    title: 'Economics from First Principles',
    description: 'Rebuilding economic intuition from the ground up.',
    category: 'Money & Business',
    icon: '📈',
    order: 1,
  },
  'business-financial-literacy': {
    title: 'Business & Financial Literacy',
    description: 'Reading the numbers that run a business.',
    category: 'Money & Business',
    icon: '💼',
    order: 2,
  },
  'personal-money-mastery': {
    title: 'Personal Money Mastery',
    description: 'Practical personal finance, explained simply.',
    category: 'Money & Business',
    icon: '💰',
    order: 3,
  },
  'how-to-make-money': {
    title: 'How to Make Money',
    description: 'Ways value gets created and captured.',
    category: 'Money & Business',
    icon: '🪙',
    order: 4,
  },
  'sales-customer-development': {
    title: 'Sales & Customer Development',
    description: 'Talking to customers and selling honestly.',
    category: 'Money & Business',
    icon: '🤝',
    order: 5,
  },

  // ---- Thinking & Decisions ----
  'thinking-skills': {
    title: 'Thinking Skills',
    description: 'Mental models and reasoning tools for clearer thought.',
    category: 'Thinking & Decisions',
    icon: '💡',
    order: 1,
  },
  'systems-thinking': {
    title: 'Systems Thinking',
    description: 'Seeing the loops, stocks, and flows behind complex problems.',
    category: 'Thinking & Decisions',
    icon: '🔄',
    order: 2,
  },
  'psychology-of-decisions': {
    title: 'Psychology of Decisions',
    description: 'How we actually decide — biases, heuristics, and how to do better.',
    category: 'Thinking & Decisions',
    icon: '🎯',
    order: 3,
  },
  'clear-thinking-and-expression': {
    title: 'Clear Thinking & Expression',
    description: 'Thinking clearly and saying it plainly.',
    category: 'Thinking & Decisions',
    icon: '✍️',
    order: 4,
  },
  'product-sense-empathy': {
    title: 'Product Sense & Empathy',
    description: 'Building the right thing for real people.',
    category: 'Thinking & Decisions',
    icon: '❤️',
    order: 5,
  },
  'ten-disciplines': {
    title: 'Ten Disciplines',
    description: 'A cross-disciplinary toolkit for a well-rounded mind.',
    category: 'Thinking & Decisions',
    icon: '🧭',
    order: 6,
  },
  'life-money-and-relationships': {
    title: 'Life, Money & Relationships',
    description: 'The non-technical things that matter most.',
    category: 'Thinking & Decisions',
    icon: '🌱',
    order: 7,
  },

  // ---- Communication ----
  english: {
    title: 'English for Developers',
    description: 'A 12-part course on grammar, clarity, and professional writing.',
    category: 'Communication',
    icon: '📝',
    order: 1,
  },

  // ---- Certifications ----
  'aws-cloud-practitioner-mcq': {
    title: 'AWS Cloud Practitioner',
    description: 'Practice questions and notes for the AWS CCP exam.',
    category: 'Certifications',
    icon: '☁️',
    order: 1,
  },

  // ------------------------------------------------------------------
  // Internal PrintFlow360 business/strategy research — kept PRIVATE.
  // Flip `published: true` on any of these if you decide to share it.
  // ------------------------------------------------------------------
  'gtm-strategy': { published: false },
  marketing: { published: false },
  'marketing-growth': { published: false },
  'metrics-analytics': { published: false },
  'retention-lifecycle': { published: false },
  'engineering-ops': { published: false },
  'feature-rd': { published: false },
  'qa-launch': { published: false },
  'product-design': { published: false },
};

// Folders that are never topics (build output, this app, etc.)
export const IGNORE_DIRS = new Set(['platform', 'research', 'node_modules', '.git', 'dist']);
