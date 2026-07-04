/* Learn How to Learn book builder.
 *
 * Assembles all chapter markdown files in ./chapters into one styled,
 * print-ready HTML book with a cover page and table of contents.
 *
 * Usage:
 *   node _build_book.cjs
 *     -> writes ./Learn-How-to-Learn-Complete-Guide.html
 *   google-chrome --headless --print-to-pdf=Learn-How-to-Learn-Complete-Guide.pdf \
 *     --no-pdf-header-footer Learn-How-to-Learn-Complete-Guide.html
 */
const fs = require('fs');
const path = require('path');

const MarkdownIt = require(path.join(__dirname, '..', 'node_modules', 'markdown-it'));
const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: false });

const CHAPTER_DIR = path.join(__dirname, 'chapters');
const OUT = path.join(__dirname, 'Learn-How-to-Learn-Complete-Guide.html');

const files = fs.readdirSync(CHAPTER_DIR)
  .filter(f => /^\d{2}-.*\.md$/.test(f))
  .sort();

if (!files.length) { console.error('No chapter files found in ' + CHAPTER_DIR); process.exit(1); }

const esc = (t) => (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const stripMd = (t) => t.replace(/[*_`#]/g, '').trim();

const chapters = files.map((f, i) => {
  const raw = fs.readFileSync(path.join(CHAPTER_DIR, f), 'utf8');
  const h1 = raw.match(/^#\s+(.+?)\s*$/m);
  const title = h1 ? stripMd(h1[1]) : f.replace(/\.md$/, '');
  const sections = [...raw.matchAll(/^##\s+(.+?)\s*$/gm)].map(m => stripMd(m[1]));
  const body = raw.replace(/^#\s+.+?\r?\n/, ''); // H1 re-rendered with anchor below
  return { id: 'ch' + (i + 1), file: f, title, sections, html: md.render(body) };
});

const CSS = `
:root{
  --ink:#1c2333; --muted:#5c6675; --line:#e4e7ee; --bg:#ffffff;
  --brand:#2f5c9e; --brand-deep:#1e3f74; --brand-soft:#e8eff8; --accent:#b3541e;
}
@page{ size:A4; margin:16mm 15mm 18mm 15mm; }
*{ box-sizing:border-box; }
body{ font-family:"Segoe UI",-apple-system,Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink); line-height:1.6; font-size:10.8pt; margin:0; background:var(--bg);
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
h1,h2,h3,h4,h5{ line-height:1.25; color:var(--ink); break-after:avoid; }
h1.chapter{ font-size:22pt; color:var(--brand-deep); margin:.1em 0 .5em; padding-bottom:.25em; border-bottom:3px solid var(--brand); }
h2{ font-size:16pt; color:var(--brand-deep); margin:1.5em 0 .5em; padding-bottom:.2em; border-bottom:2px solid var(--brand-soft); }
h3{ font-size:12.5pt; margin:1.3em 0 .45em; color:#254c86; }
h4{ font-size:11.5pt; margin:1.1em 0 .35em; color:#2a3a50; }
p{ margin:.55em 0; } ul,ol{ margin:.45em 0 .75em; padding-left:1.4em; } li{ margin:.25em 0; }
strong{ color:#10203a; } em{ color:#2c3a4d; }
code{ font-family:Consolas,"Liberation Mono",monospace; font-size:.85em;
  background:#eef1f6; padding:.08em .4em; border-radius:4px; color:#1e3f74; word-break:break-word; }
pre{ background:#101c2e; color:#dce7f5; padding:12px 14px; border-radius:8px; overflow:hidden;
  white-space:pre-wrap; word-break:break-word; break-inside:avoid; margin:1em 0;
  font-family:Consolas,"Liberation Mono",monospace; font-size:8.8pt; line-height:1.45; }
pre code{ background:none; color:inherit; padding:0; }
a{ color:var(--brand); text-decoration:none; word-break:break-word; }
blockquote{ margin:1em 0; padding:.5em 1em; border-left:4px solid var(--brand); color:#2c3a4d; background:#f2f6fb; border-radius:0 8px 8px 0; }
table{ border-collapse:collapse; width:100%; margin:1em 0; font-size:9.5pt; }
th,td{ border:1px solid var(--line); padding:.45em .6em; text-align:left; vertical-align:top; }
thead th{ background:var(--brand-deep); color:#fff; font-weight:600; }
tbody tr:nth-child(even){ background:#f5f8fc; }
hr{ border:none; border-top:1px solid var(--line); margin:1.6em 0; }
img{ max-width:100%; height:auto; }
input[type=checkbox]{ margin-right:.4em; }

.cover{ min-height:250mm; display:flex; flex-direction:column; justify-content:center; page-break-after:always; }
.cover .kicker{ letter-spacing:3px; text-transform:uppercase; color:var(--accent); font-size:10pt; font-weight:700; margin:0 0 10px; }
.cover h1{ font-size:34pt; color:var(--brand-deep); margin:0 0 8px; line-height:1.15; border:none; }
.cover .subtitle{ font-size:14pt; color:var(--muted); margin:0 0 26px; line-height:1.45; }
.cover .rule{ width:70px; height:5px; background:var(--brand); border-radius:3px; margin-bottom:26px; }
.cover .meta{ font-size:10pt; color:var(--muted); }
.cover .scope{ margin-top:34px; font-size:9.5pt; color:var(--muted); line-height:1.7; }

.toc{ page-break-after:always; }
.toc h1{ font-size:20pt; color:var(--brand-deep); border-bottom:3px solid var(--brand); padding-bottom:.25em; }
.toc ol.toc-list{ list-style:none; padding:0; margin:1em 0; }
.toc ol.toc-list>li{ margin:.7em 0; }
.toc .toc-ch{ font-weight:600; font-size:11.5pt; color:var(--ink); }
.toc .toc-num{ display:inline-block; min-width:2em; color:var(--brand); font-weight:700; }
.toc ul.toc-sec{ list-style:none; margin:.15em 0 0 2em; padding:0; font-size:9.3pt; color:var(--muted); }
.toc ul.toc-sec li{ display:inline; margin:0; }
.toc ul.toc-sec li:not(:last-child)::after{ content:"  ·  "; color:#c2c8d4; }

.chapter-block{ page-break-before:always; }
`;

const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const cover = `
<div class="cover">
  <p class="kicker">Complete Study Guide · Beginner to Advanced</p>
  <h1>Learn How to Learn</h1>
  <p class="subtitle">The science of learning itself - how memory really works, why we forget,
  and the evidence-based techniques (spaced repetition, active recall, interleaving, deliberate
  practice) that let you learn faster, remember longer, and understand more deeply. Plus the
  study systems, habits, sleep, and mindset that hold it all together.</p>
  <div class="rule"></div>
  <p class="meta">${chapters.length} chapters · Compiled ${today}</p>
  <p class="scope">Built from research in cognitive science and memory (Ebbinghaus, Baddeley,
  Roediger &amp; Karpicke, Bjork &amp; Bjork, Cepeda, Dunlosky), expertise and skill acquisition
  (Ericsson, Sweller's cognitive load theory), metacognition and self-regulated learning (Flavell,
  Zimmerman), sleep and memory consolidation (Walker, Stickgold), motivation and mindset (Deci &amp;
  Ryan, Dweck), and modern practitioner syntheses (Oakley, Brown/Roediger/McDaniel's <em>Make It
  Stick</em>).</p>
</div>`;

const toc = `
<div class="toc">
  <h1>Table of Contents</h1>
  <ol class="toc-list">
    ${chapters.map((c, i) => `
    <li>
      <span class="toc-ch"><span class="toc-num">${i + 1}.</span> <a href="#${c.id}">${esc(c.title.replace(/^Chapter\s*\d+:\s*/i, ''))}</a></span>
      <ul class="toc-sec">${c.sections.slice(0, 12).map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    </li>`).join('')}
  </ol>
</div>`;

const bodyHtml = chapters.map(c => `
<div class="chapter-block" id="${c.id}">
  <h1 class="chapter">${esc(c.title)}</h1>
  ${c.html}
</div>`).join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Learn How to Learn - Complete Study Guide</title>
<style>${CSS}</style></head><body>
${cover}
${toc}
${bodyHtml}
</body></html>`;

fs.writeFileSync(OUT, html, 'utf8');
console.log(OUT);
