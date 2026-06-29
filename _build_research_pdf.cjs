/* Research → PDF builder.
 *
 * Converts a single research .md file into a styled, print-ready HTML document.
 * If a sibling "<name>.takeaways.md" exists, its content is rendered as a
 * plain-language "In Short" box at the very top (before the original research),
 * so a non-technical reader gets a simple summary of every module/concept first.
 *
 * Usage:
 *   node _build_research_pdf.cjs <path-to.md>
 *     -> writes <path-to>.html  (then render to PDF with chrome, see below)
 *
 * Render to PDF:
 *   google-chrome --headless --print-to-pdf=<name>.pdf --no-pdf-header-footer <name>.html
 */
const fs = require('fs');
const path = require('path');

// markdown-it lives in the repo root node_modules
const MarkdownIt = require(require('path').join(__dirname, '..', '..', 'node_modules', 'markdown-it'));

const md = new MarkdownIt({ html: true, linkify: true, typographer: true, breaks: false });

const SRC = process.argv[2];
if (!SRC) {
  console.error('Usage: node _build_research_pdf.cjs <path-to.md>');
  process.exit(1);
}

const srcAbs = path.resolve(SRC);
const dir = path.dirname(srcAbs);
const base = path.basename(srcAbs, '.md');

const raw = fs.readFileSync(srcAbs, 'utf8');

// Optional plain-language takeaways sidecar.
const takeawayPath = path.join(dir, base + '.takeaways.md');
let takeawayHtml = '';
if (fs.existsSync(takeawayPath)) {
  const tk = fs.readFileSync(takeawayPath, 'utf8').trim();
  if (tk) takeawayHtml = md.render(tk);
}

// Derive a human title from the first H1, else from the filename.
let title = base.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+\d{4} \d{2} \d{2}$/, '').trim();
const h1 = raw.match(/^#\s+(.+?)\s*$/m);
if (h1) title = h1[1].replace(/[*_`#]/g, '').trim();

// Strip the first H1 from the body — it's already shown in the cover banner.
const body = raw.replace(/^#\s+.+?\r?\n/, '');
const bodyHtml = md.render(body);

const esc = (t) => (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
h1{ font-size:23pt; color:var(--brand); margin:.2em 0 .35em; }
h2{ font-size:17pt; color:var(--brand); margin:1.4em 0 .5em; padding-bottom:.22em; border-bottom:2px solid var(--brand-soft); }
h3{ font-size:13pt; margin:1.3em 0 .45em; color:#0b4f49; }
h4{ font-size:11.5pt; margin:1.1em 0 .35em; color:#2a3a50; }
h5{ font-size:10.8pt; margin:1em 0 .3em; color:#2a3a50; }
p{ margin:.55em 0; } ul,ol{ margin:.45em 0 .75em; padding-left:1.4em; } li{ margin:.25em 0; }
strong{ color:#10203a; }
em{ color:#2c3a4d; }
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

.cover{ border-bottom:4px solid var(--brand); padding:0 0 8px; margin-bottom:6px; }
.cover .kicker{ letter-spacing:2px; text-transform:uppercase; color:var(--muted); font-size:9pt; margin:0 0 4px; }
.cover .meta{ font-size:9pt; color:var(--muted); margin-top:4px; }

.takeaways{ background:var(--tk-bg); border:1px solid var(--tk-line); border-left:5px solid var(--tk);
  border-radius:10px; padding:14px 18px 6px; margin:14px 0 22px; break-inside:avoid; }
.takeaways .tk-head{ display:flex; align-items:center; gap:8px; margin-bottom:2px; }
.takeaways .tk-badge{ background:var(--tk); color:#fff; font-size:8pt; font-weight:700; letter-spacing:1px;
  text-transform:uppercase; padding:3px 9px; border-radius:20px; }
.takeaways h2,.takeaways h3{ border:none; color:var(--tk); margin:.8em 0 .3em; padding:0; }
.takeaways h2{ font-size:14pt; } .takeaways h3{ font-size:11.5pt; }
.takeaways p{ font-size:10.4pt; } .takeaways li{ font-size:10.4pt; margin:.3em 0; }
.takeaways strong{ color:#0b5e3f; }
`;

const cover = `
<div class="cover">
  <p class="kicker">Print-Flow-360 · Research Library</p>
  <h1>${esc(title)}</h1>
  <p class="meta">Source: ${esc(path.relative(path.join(__dirname, '..', '..'), srcAbs))}</p>
</div>`;

const takeawayBlock = takeawayHtml
  ? `<div class="takeaways">
       <div class="tk-head"><span class="tk-badge">In Short — Plain-Language Takeaways</span></div>
       ${takeawayHtml}
     </div>`
  : '';

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<style>${CSS}</style></head><body>
${cover}
${takeawayBlock}
${bodyHtml}
</body></html>`;

const htmlPath = path.join(dir, base + '.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log(htmlPath);
