/* Category → single PDF builder.
 *
 * Combines every research .md file inside ONE category folder into a single,
 * print-ready HTML document: cover page + clickable table of contents, then each
 * document as its own chapter. Each chapter opens with a plain-language
 * "In Short" key-takeaways box (from its <name>.takeaways.md sidecar), so the
 * hard research language is summarised simply before the full text.
 *
 * Usage:
 *   node _build_category_pdf.cjs <category-folder> ["Display Title"]
 *     -> writes <category-folder>/<FOLDER>_RESEARCH.html
 *
 * Render to PDF:
 *   google-chrome --headless --print-to-pdf=<out>.pdf --no-pdf-header-footer <out>.html
 */
const fs = require('fs');
const path = require('path');
const MarkdownIt = require(path.join(__dirname, '..', '..', 'node_modules', 'markdown-it'));
const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: false });

const FOLDER = process.argv[2];
if (!FOLDER) {
  console.error('Usage: node _build_category_pdf.cjs <category-folder> ["Display Title"]');
  process.exit(1);
}
const folderAbs = path.resolve(FOLDER);
const folderName = path.basename(folderAbs);
const titleCase = (s) =>
  s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const DISPLAY = process.argv[3] || titleCase(folderName);

// Recursively collect .md files (skip sidecars), sorted by path.
function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (e.isFile() && e.name.endsWith('.md') && !e.name.endsWith('.takeaways.md')) out.push(p);
  }
  return out;
}
const files = walk(folderAbs).sort((a, b) => a.localeCompare(b));
if (!files.length) {
  console.error('No .md files in', folderAbs);
  process.exit(1);
}

const esc = (t) => (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function docTitle(raw, file) {
  const h1 = raw.match(/^#\s+(.+?)\s*$/m);
  if (h1) return h1[1].replace(/[*_`#]/g, '').trim();
  return path.basename(file, '.md').replace(/[-_]+/g, ' ').replace(/\s+\d{4} \d{2} \d{2}$/, '').trim();
}

const chapters = files.map((file, i) => {
  const raw = fs.readFileSync(file, 'utf8');
  const title = docTitle(raw, file);
  const id = 'doc-' + i;

  const sidecar = file.replace(/\.md$/, '.takeaways.md');
  let tkHtml = '';
  if (fs.existsSync(sidecar)) {
    const tk = fs.readFileSync(sidecar, 'utf8').trim();
    if (tk) tkHtml = md.render(tk);
  }
  const tkBlock = tkHtml
    ? `<div class="takeaways">
         <div class="tk-head"><span class="tk-badge">In Short - Key Takeaways</span></div>
         ${tkHtml}
       </div>`
    : '';

  const body = raw.replace(/^#\s+.+?\r?\n/, '');
  const bodyHtml = md.render(body);

  return { id, title, file, html: `
<section class="chapter">
  <h1 id="${id}" class="chapter-title">${esc(title)}</h1>
  <p class="chapter-src">Source: ${esc(path.relative(path.join(__dirname, '..', '..'), file))}</p>
  ${tkBlock}
  ${bodyHtml}
</section>` };
});

const toc = chapters
  .map((c, i) => `<li><a href="#${c.id}"><span class="toc-num">${i + 1}.</span> ${esc(c.title)}</a></li>`)
  .join('\n');

const CSS = `
:root{
  --ink:#1a2230; --muted:#5b6675; --line:#e3e8ef; --bg:#ffffff;
  --brand:#0d6b63; --brand-soft:#e6f4f1;
  --tk:#0f7b51; --tk-bg:#f0fbf6; --tk-line:#bce7d2;
}
@page{ size:A4; margin:16mm 15mm 18mm 15mm; }
*{ box-sizing:border-box; }
body{ font-family:"Segoe UI",-apple-system,Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink); line-height:1.6; font-size:10.8pt; margin:0; background:var(--bg);
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
h1,h2,h3,h4,h5{ line-height:1.25; color:var(--ink); break-after:avoid; }
h2{ font-size:16pt; color:var(--brand); margin:1.3em 0 .5em; padding-bottom:.22em; border-bottom:2px solid var(--brand-soft); }
h3{ font-size:12.5pt; margin:1.2em 0 .45em; color:#0b4f49; }
h4{ font-size:11pt; margin:1.1em 0 .35em; color:#2a3a50; }
h5{ font-size:10.6pt; margin:1em 0 .3em; color:#2a3a50; }
p{ margin:.55em 0; } ul,ol{ margin:.45em 0 .75em; padding-left:1.4em; } li{ margin:.25em 0; }
strong{ color:#10203a; } em{ color:#2c3a4d; }
code{ font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; font-size:.85em;
  background:#eef1f5; padding:.08em .4em; border-radius:4px; color:#9a3412; word-break:break-word; }
pre{ background:#0f1b2d; color:#dbe7f5; padding:12px 14px; border-radius:8px; overflow:hidden;
  white-space:pre-wrap; word-break:break-word; break-inside:avoid; margin:1em 0; border:1px solid #1d3050;
  font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; font-size:8.8pt; line-height:1.4; }
pre code{ background:none; color:inherit; padding:0; }
a{ color:var(--brand); text-decoration:none; word-break:break-word; }
blockquote{ margin:1em 0; padding:.4em 1em; border-left:4px solid var(--brand-soft); color:#2c3a4d; background:#f8fafb; }
table{ border-collapse:collapse; width:100%; margin:1em 0; font-size:9.5pt; break-inside:avoid; }
th,td{ border:1px solid var(--line); padding:.45em .6em; text-align:left; vertical-align:top; }
thead th{ background:var(--brand); color:#fff; font-weight:600; }
tbody tr:nth-child(even){ background:#f6f8fb; }
hr{ border:none; border-top:1px solid var(--line); margin:1.6em 0; }
img{ max-width:100%; height:auto; }

.cover{ break-after:page; text-align:center; padding-top:60mm; }
.cover .kicker{ letter-spacing:3px; text-transform:uppercase; color:var(--muted); font-size:10pt; margin-bottom:10mm; }
.cover h1{ font-size:32pt; color:var(--brand); margin:0 0 6mm; }
.cover .rule{ width:60mm; height:4px; background:var(--brand); margin:8mm auto; border-radius:3px; }
.cover .sub{ font-size:13pt; color:var(--muted); margin:0 0 24mm; font-weight:400; }
.cover .meta{ font-size:10pt; color:var(--muted); }

.toc{ break-after:page; }
.toc h2{ color:var(--brand); border:none; }
.toc ol{ list-style:none; padding-left:0; font-size:11.5pt; }
.toc li{ padding:.4em 0; border-bottom:1px dashed var(--line); }
.toc a{ color:var(--ink); } .toc .toc-num{ color:var(--brand); font-weight:700; margin-right:.4em; }

.chapter{ break-before:page; }
.chapter-title{ font-size:21pt; color:var(--brand); margin:.1em 0 .15em; }
.chapter-src{ font-size:8.5pt; color:var(--muted); margin:0 0 .6em; }

.takeaways{ background:var(--tk-bg); border:1px solid var(--tk-line); border-left:5px solid var(--tk);
  border-radius:10px; padding:14px 18px 6px; margin:12px 0 22px; break-inside:avoid; }
.takeaways .tk-head{ margin-bottom:2px; }
.takeaways .tk-badge{ background:var(--tk); color:#fff; font-size:8pt; font-weight:700; letter-spacing:1px;
  text-transform:uppercase; padding:3px 9px; border-radius:20px; }
.takeaways h2,.takeaways h3{ border:none; color:var(--tk); margin:.8em 0 .3em; padding:0; }
.takeaways h2{ font-size:13pt; } .takeaways h3{ font-size:11pt; }
.takeaways p{ font-size:10.4pt; } .takeaways li{ font-size:10.4pt; margin:.3em 0; }
.takeaways strong{ color:#0b5e3f; }
`;

const today = '2026-06-26';
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(DISPLAY)} - Research Compendium</title>
<style>${CSS}</style></head><body>

<section class="cover">
  <div class="kicker">Print-Flow-360 · Research Library</div>
  <h1>${esc(DISPLAY)}</h1>
  <div class="rule"></div>
  <p class="sub">${chapters.length} research document${chapters.length === 1 ? '' : 's'} · each with plain-language key takeaways</p>
  <p class="meta">Compiled ${today}</p>
</section>

<nav class="toc">
  <h2>Table of Contents</h2>
  <ol>
    ${toc}
  </ol>
</nav>

${chapters.map((c) => c.html).join('\n')}

</body></html>`;

const outBase = folderName.replace(/[-_]+/g, '_').toUpperCase() + '_RESEARCH';
const htmlPath = path.join(folderAbs, outBase + '.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(htmlPath);
