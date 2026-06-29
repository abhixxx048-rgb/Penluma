// ---------------------------------------------------------------------------
// import-research.mjs
//
// Walks the research root (../), turns every published topic folder's markdown
// into a blog post in src/content/blog/<topic>/<slug>.md with clean frontmatter.
//
// Re-runnable & idempotent: it wipes and regenerates src/content/blog each run,
// so adding a new .md (or a whole new topic folder) and re-running picks it up.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { TOPICS, IGNORE_DIRS } from '../topics.config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLATFORM_DIR = path.resolve(__dirname, '..');
const RESEARCH_ROOT = path.resolve(PLATFORM_DIR, '..');
const OUT_DIR = path.join(PLATFORM_DIR, 'src/content/blog');

const SKIP_FILE = /(\.takeaways\.md$)|(^README)|(^_)/i;

// --- helpers ---------------------------------------------------------------

function prettify(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function isPublished(folder) {
  const cfg = TOPICS[folder];
  if (cfg && cfg.published === false) return false;
  return true; // default: published (so new folders auto-appear)
}

function topicMeta(folder) {
  const cfg = TOPICS[folder] || {};
  return {
    slug: folder,
    title: cfg.title || prettify(folder),
    description: cfg.description || `Research notes on ${prettify(folder).toLowerCase()}.`,
    category: cfg.category || 'Other',
    icon: cfg.icon || '📚',
    order: cfg.order ?? 99,
    featured: cfg.featured || false,
  };
}

// Pull the first markdown H1 as the title and return the body without it.
function extractTitle(body, fallback) {
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.+?)\s*$/);
    if (m) {
      lines.splice(0, i + 1); // drop everything up to & including the H1
      return { title: m[1].replace(/[*`_]/g, '').trim(), body: lines.join('\n').trim() };
    }
    if (lines[i].trim() && !lines[i].startsWith('>')) break; // real content before any H1
  }
  return { title: fallback, body };
}

// Date: prefer YYYY-MM-DD in filename, then a `> **Date:** ...` line, then mtime.
function extractDate(filename, body, stat) {
  const fromName = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (fromName) return fromName[1];
  const fromBody = body.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  if (fromBody) return fromBody[1];
  return stat.mtime.toISOString().slice(0, 10);
}

// Leading number in filename => intra-topic ordering (01-, 02-, ...).
function extractOrder(filename) {
  const m = filename.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 999;
}

// Turn raw text into a clean ~155-char meta description: strip markdown and any
// leading enumeration, drop a repeated copy of the title, and cut on a sentence
// or word boundary so search snippets read as whole thoughts (no mid-word chops).
const DESC_MAX = 160;
function makeDescription(text, title = '') {
  let s = decodeEntities(String(text || ''))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')   // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> their text
    .replace(/[#>*`_]/g, '')                 // emphasis / heading marks
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\d+[.)]\s+/, '');             // leading "1. " / "1) "

  // Drop a leading copy of the title (posts often open by restating it).
  const t = title.replace(/[*`_]/g, '').trim();
  if (t && s.toLowerCase().startsWith(t.toLowerCase())) {
    s = s.slice(t.length).replace(/^[\s:–—-]+/, '');
  }

  // Strip weak filler openers ("This document teaches you…") that waste the
  // ~155 chars Google shows — lead with the substance instead.
  s = s.replace(
    /^(?:in\s+)?this\s+(?:document|chapter|guide|post|article|section|page|note|piece)\s+(?:is\s+about|covers|explains|teaches\s+you|teaches|describes|shows\s+you|shows|walks\s+you\s+through|will\s+(?:teach|show|explain|cover|help))\s+/i,
    '',
  );
  // Re-capitalise the new first letter if we trimmed anything off the front.
  s = s.charAt(0).toUpperCase() + s.slice(1);

  if (s.length <= DESC_MAX) return s;
  const clip = s.slice(0, DESC_MAX);
  // Prefer ending on a sentence boundary if one sits past the halfway mark.
  const sentence = clip.match(/^[\s\S]*[.!?](?=\s|$)/);
  if (sentence && sentence[0].length >= DESC_MAX * 0.6) return sentence[0].trim();
  return clip.replace(/\s+\S*$/, '').trim() + '…';
}

// Build a short plain-English excerpt, preferring the sibling takeaways file.
function buildExcerpt(srcPath, body, title = '') {
  const takeaways = srcPath.replace(/\.md$/, '.takeaways.md');
  const text = fs.existsSync(takeaways) ? fs.readFileSync(takeaways, 'utf8') : body;
  // first substantial paragraph (skip headings / short stubs)
  const para = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .find((p) => p.replace(/[#>*`_[\]]/g, '').trim().length > 60);
  return makeDescription(para || '', title);
}

function cleanSlug(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/_\d{4}-\d{2}-\d{2}$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// Recursively find the first array that looks like a list of content sections
// (objects that carry an `html` string). Handles all the build-JSON shapes.
function findSections(node, depth = 0) {
  if (depth > 6 || node == null || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    const objs = node.filter((x) => x && typeof x === 'object');
    const withHtml = objs.filter((x) => typeof x.html === 'string' && x.html.trim().length > 40);
    if (objs.length && withHtml.length >= Math.max(1, Math.floor(objs.length * 0.5))) {
      return withHtml;
    }
    for (const item of node) {
      const found = findSections(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  for (const key of Object.keys(node)) {
    if (key === 'logs') continue; // skip workflow logs
    const found = findSections(node[key], depth + 1);
    if (found) return found;
  }
  return null;
}

function titleFromSection(sec, idx) {
  let t = sec.title || sec.name || sec.heading || '';
  if (!t) {
    const m = (sec.html || '').match(/<h[12][^>]*>(.*?)<\/h[12]>/is);
    t = m ? m[1] : `Part ${idx + 1}`;
  }
  return decodeEntities(t.replace(/<[^>]+>/g, '').replace(/^\s*\d+[.)·\s-]+/, '').trim());
}

// Drop a leading <h1>/<h2> (the layout renders the title itself).
function stripLeadingHeading(html) {
  return html.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/is, '');
}

// Last resort: split a built HTML document into posts by <section> blocks.
const HTML_EXCLUDE = /(master|cheat|revision|rebuild|_test|index)/i;
function booksFromHtml(folderPath) {
  const htmlFiles = fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith('.html') && !HTML_EXCLUDE.test(f))
    .sort();
  const posts = [];
  let idx = 0;
  for (const hf of htmlFiles) {
    const raw = fs.readFileSync(path.join(folderPath, hf), 'utf8');
    const blocks = raw.match(/<section class="section"[^>]*>[\s\S]*?<\/section>/gi) || [];
    for (const block of blocks) {
      const inner = block.replace(/^<section[^>]*>/i, '').replace(/<\/section>\s*$/i, '');
      const hm = inner.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
      if (!hm) continue;
      const title = decodeEntities(hm[1].replace(/<[^>]+>/g, '').replace(/^\s*\d+[.)·\s-]+/, '').trim());
      const html = stripLeadingHeading(inner);
      if (stripTags(html).length < 80) continue; // skip nav/toc stubs
      posts.push({ title, html, excerpt: stripTags(inner), order: idx });
      idx++;
    }
  }
  return posts;
}

// Build posts from a folder's build-JSON "book" (chapters/sections of HTML).
function booksFromFolder(folderPath) {
  const jsonFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith('.json'));
  const posts = [];
  let idx = 0;
  for (const jf of jsonFiles) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(folderPath, jf), 'utf8'));
    } catch {
      continue;
    }
    const sections = findSections(data);
    if (!sections) continue;
    for (const sec of sections) {
      const title = titleFromSection(sec, idx);
      const html = stripLeadingHeading(sec.html);
      posts.push({ title, html, excerpt: stripTags(sec.html), order: idx });
      idx++;
    }
  }
  return posts;
}

// --- main ------------------------------------------------------------------

// reset output
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const folders = fs
  .readdirSync(RESEARCH_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !IGNORE_DIRS.has(d.name) && !d.name.startsWith('.'))
  .map((d) => d.name)
  .sort();

let postCount = 0;
const publishedTopics = [];

for (const folder of folders) {
  if (!isPublished(folder)) continue;
  const topic = topicMeta(folder);
  const folderPath = path.join(RESEARCH_ROOT, folder);

  const mdFiles = fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith('.md') && !SKIP_FILE.test(f));

  let topicPosts = 0;
  const outTopicDir = path.join(OUT_DIR, topic.slug);

  // --- Book folders: no markdown, content lives in build-JSON ---
  if (mdFiles.length === 0) {
    const stat = fs.statSync(folderPath);
    let bookPosts = booksFromFolder(folderPath);
    if (bookPosts.length === 0) bookPosts = booksFromHtml(folderPath);
    if (bookPosts.length === 0) {
      console.warn(`   ⚠ ${folder}: no markdown, JSON, or HTML content found — skipped.`);
      continue;
    }
    fs.mkdirSync(outTopicDir, { recursive: true });
    const date = stat.mtime.toISOString().slice(0, 10);
    for (const bp of bookPosts) {
      const excerpt = makeDescription(bp.excerpt, bp.title);
      const frontmatter = {
        title: bp.title,
        description: excerpt || topic.description,
        topic: topic.slug,
        topicTitle: topic.title,
        category: topic.category,
        date,
        order: bp.order,
        icon: topic.icon,
      };
      const slug = cleanSlug(`${String(bp.order + 1).padStart(2, '0')}-${bp.title}`) || `part-${bp.order + 1}`;
      const outFile = path.join(outTopicDir, `${slug}.md`);
      // Raw HTML is valid markdown body; wrapped so our prose styles apply.
      fs.writeFileSync(outFile, matter.stringify(`\n${bp.html}\n`, frontmatter));
      postCount++;
      topicPosts++;
    }
    publishedTopics.push({ ...topic, postCount: topicPosts });
    continue;
  }

  for (const file of mdFiles) {
    const srcPath = path.join(folderPath, file);
    const raw = fs.readFileSync(srcPath, 'utf8');
    const stat = fs.statSync(srcPath);

    // strip any pre-existing frontmatter from the source, keep the body
    const parsed = matter(raw);
    const fallbackTitle = prettify(file.replace(/\.md$/, '').replace(/^\d+[-_]/, '').replace(/_\d{4}-\d{2}-\d{2}$/, ''));
    const { title, body } = extractTitle(parsed.content, fallbackTitle);
    const date = extractDate(file, parsed.content, stat);
    const order = extractOrder(file);
    // Curated `description:` in the source frontmatter wins; else auto-excerpt.
    const sourceDesc = parsed.data.description && String(parsed.data.description).trim();
    const excerpt = sourceDesc || buildExcerpt(srcPath, body, title);
    const slug = cleanSlug(file);

    const frontmatter = {
      title,
      description: excerpt || topic.description,
      topic: topic.slug,
      topicTitle: topic.title,
      category: topic.category,
      date,
      order,
      icon: topic.icon,
    };

    fs.mkdirSync(outTopicDir, { recursive: true });
    const outFile = path.join(outTopicDir, `${slug}.md`);
    fs.writeFileSync(outFile, matter.stringify('\n' + body, frontmatter));
    postCount++;
    topicPosts++;
  }

  publishedTopics.push({ ...topic, postCount: topicPosts });
}

// ---------------------------------------------------------------------------
// Standalone, hand-written posts (independent of the research folders).
// Drop a markdown file with frontmatter in platform/posts/ — it survives
// regeneration because it lives here, not in src/content/blog.
//
//   ---
//   title: Why I publish my research
//   topic: essays            # topic slug (its own topic if new)
//   topicTitle: Essays       # optional pretty name for a new topic
//   category: Essays         # optional nav category
//   icon: ✍️                 # optional
//   date: 2026-06-29
//   featured: true           # optional → eligible for the homepage spotlight
//   ---
//   ...markdown body...
// ---------------------------------------------------------------------------
const POSTS_DIR = path.join(PLATFORM_DIR, 'posts');
const topicBySlug = new Map(publishedTopics.map((t) => [t.slug, t]));
const featuredPosts = [];

if (fs.existsSync(POSTS_DIR)) {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md') && !SKIP_FILE.test(f));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data: fm, content } = matter(raw);
    const topicSlug = fm.topic || 'essays';

    // ensure a topic exists for this standalone post
    let topic = topicBySlug.get(topicSlug);
    if (!topic) {
      const cfg = TOPICS[topicSlug] || {};
      topic = {
        slug: topicSlug,
        title: fm.topicTitle || cfg.title || prettify(topicSlug),
        description: cfg.description || `Independent posts on ${prettify(topicSlug).toLowerCase()}.`,
        category: fm.category || cfg.category || 'Essays',
        icon: fm.icon || cfg.icon || '✍️',
        order: cfg.order ?? 0,
        featured: cfg.featured || false,
        postCount: 0,
      };
      topicBySlug.set(topicSlug, topic);
      publishedTopics.push(topic);
    }

    const { title, body } = extractTitle(content, prettify(file.replace(/\.md$/, '')));
    const finalTitle = fm.title || title;
    const slug = cleanSlug(file);
    const excerpt =
      (fm.description && String(fm.description).trim()) ||
      buildExcerpt(path.join(POSTS_DIR, file), body, finalTitle);
    const frontmatter = {
      title: finalTitle,
      description: excerpt || topic.description,
      topic: topic.slug,
      topicTitle: topic.title,
      category: topic.category,
      date: fm.date ? new Date(fm.date).toISOString().slice(0, 10) : statSafe(POSTS_DIR, file),
      order: fm.order ?? 0,
      icon: fm.icon || topic.icon,
    };
    const outTopicDir = path.join(OUT_DIR, topic.slug);
    fs.mkdirSync(outTopicDir, { recursive: true });
    fs.writeFileSync(path.join(outTopicDir, `${slug}.md`), matter.stringify('\n' + body, frontmatter));
    topic.postCount++;
    postCount++;
    if (fm.featured) featuredPosts.push({ ...frontmatter, id: `${topic.slug}/${slug}` });
  }
}

function statSafe(dir, file) {
  try {
    return fs.statSync(path.join(dir, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date(0).toISOString().slice(0, 10);
  }
}

// homepage spotlight manifest (featured standalone posts)
fs.writeFileSync(
  path.join(PLATFORM_DIR, 'src/featured.generated.json'),
  JSON.stringify(featuredPosts, null, 2)
);

// Emit a topics manifest the site uses for nav & topic pages.
publishedTopics.sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);
fs.writeFileSync(
  path.join(PLATFORM_DIR, 'src/topics.generated.json'),
  JSON.stringify(publishedTopics, null, 2)
);

console.log(`✓ Imported ${postCount} posts across ${publishedTopics.length} topics.`);
for (const t of publishedTopics) console.log(`   ${t.icon}  ${t.title} — ${t.postCount} posts`);
