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

// Build a short plain-English excerpt, preferring the sibling takeaways file.
function buildExcerpt(srcPath, body) {
  const takeaways = srcPath.replace(/\.md$/, '.takeaways.md');
  let text = '';
  if (fs.existsSync(takeaways)) {
    text = fs.readFileSync(takeaways, 'utf8');
  } else {
    text = body;
  }
  // first substantial paragraph, stripped of markdown
  const para = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/[#>*`_\[\]]/g, '').replace(/\s+/g, ' ').trim())
    .find((p) => p.length > 60);
  const clean = (para || '').trim();
  return clean.length > 280 ? clean.slice(0, 277).replace(/\s+\S*$/, '') + '…' : clean;
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
      const excerpt = bp.excerpt.length > 280 ? bp.excerpt.slice(0, 277).replace(/\s+\S*$/, '') + '…' : bp.excerpt;
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
    const excerpt = buildExcerpt(srcPath, body);
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

// Emit a topics manifest the site uses for nav & topic pages.
publishedTopics.sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);
fs.writeFileSync(
  path.join(PLATFORM_DIR, 'src/topics.generated.json'),
  JSON.stringify(publishedTopics, null, 2)
);

console.log(`✓ Imported ${postCount} posts across ${publishedTopics.length} topics.`);
for (const t of publishedTopics) console.log(`   ${t.icon}  ${t.title} — ${t.postCount} posts`);
