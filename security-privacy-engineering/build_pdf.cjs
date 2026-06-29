/* Build the Security & Privacy Engineering study guide HTML from the workflow JSON output.
   Usage: node build_pdf.cjs <workflow-result.json>
   Then render to PDF with headless Chrome (see README / shell step). */
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;
const SRC = process.argv[2] || path.join(OUT_DIR, 'content.json');

let outer = JSON.parse(fs.readFileSync(SRC, 'utf8'));
// Accept either the raw {wrapper,sections} object or a {result: ...} envelope.
let data = outer.result !== undefined ? outer.result : outer;
if (typeof data === 'string') data = JSON.parse(data);

// Strip any author preamble before the first real <h2>.
function clean(html) {
  if (!html) return '';
  const i = html.indexOf('<h2');
  return (i > 0 ? html.slice(i) : html).trim();
}

const sections = data.sections
  .filter(Boolean)
  .sort((a, b) => a.num - b.num)
  .map((s) => ({ num: s.num, title: s.title, html: clean(s.html) }));

// Give each section's first <h2> a stable id for the table of contents.
const sectionHtml = sections
  .map((s) => `<section class="section">${s.html.replace('<h2', `<h2 id="sec-${s.num}"`)}</section>`)
  .join('\n');

const w = data.wrapper || {};
const intro = clean(w.intro_html).replace('<h2', '<h2 id="how-to-use"');
const glossary = clean(w.glossary_html).replace('<h2', '<h2 id="glossary"');
const faq = clean(w.faq_html).replace('<h2', '<h2 id="faq"');
const cheatsheet = clean(w.cheatsheet_html).replace('<h2', '<h2 id="cheatsheet"');

const toc = sections
  .map((s) => `<li><a href="#sec-${s.num}">${s.num}. ${s.title.replace(/&(?!amp;)/g, '&amp;')}</a></li>`)
  .join('\n');

const CSS = `
:root{
  --ink:#15212e; --muted:#5b6675; --line:#e1e7ef; --bg:#ffffff;
  --brand:#0b6b5b; --brand2:#0e8a6e; --brand-soft:#e7f5f1;
  --key:#0f7b51; --key-bg:#eafaf1; --key-line:#bce7d2;
  --warn:#9a3412; --warn-bg:#fff4ed; --warn-line:#fcd9c2;
  --tip:#1e5fae; --tip-bg:#eef5ff; --tip-line:#c8defb;
  --analogy:#6b3fa0; --analogy-bg:#f6f0fc; --analogy-line:#e2d3f4;
  --example:#334155; --example-bg:#f4f6f9; --example-line:#dde3ec;
}
@page{ size:A4; margin:18mm 16mm 20mm 16mm; }
*{ box-sizing:border-box; }
body{
  font-family:"Segoe UI",-apple-system,Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink); line-height:1.62; font-size:11pt; margin:0; background:var(--bg);
  -webkit-print-color-adjust:exact; print-color-adjust:exact;
}
h1,h2,h3,h4{ line-height:1.25; color:var(--ink); }
h2{ font-size:20pt; color:var(--brand); margin:0 0 .5em; padding-bottom:.28em; border-bottom:3px solid var(--brand-soft); }
h3{ font-size:14pt; margin:1.5em 0 .5em; color:#0c4f44; }
h4{ font-size:12pt; margin:1.2em 0 .4em; color:#243a40; }
p{ margin:.6em 0; }
ul,ol{ margin:.5em 0 .8em; padding-left:1.4em; }
li{ margin:.28em 0; }
strong{ color:#0c1a26; }
code{ font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; font-size:.86em;
  background:#eef1f5; padding:.08em .4em; border-radius:4px; color:#9a3412; }
a{ color:var(--brand); text-decoration:none; }

.section{ break-before:page; }
.section:first-of-type{ break-before:auto; }

pre.diagram{
  font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; font-size:9pt; line-height:1.35;
  background:#0d2420; color:#cfeee6; padding:14px 16px; border-radius:8px; overflow:hidden;
  white-space:pre; break-inside:avoid; margin:1em 0; border:1px solid #16463c;
}

.key,.warn,.tip,.analogy,.example{
  margin:1em 0; padding:.7em .95em .7em 1em; border-radius:8px; border:1px solid; break-inside:avoid; font-size:10.4pt;
}
.key{ background:var(--key-bg); border-color:var(--key-line); }
.key strong{ color:var(--key); }
.warn{ background:var(--warn-bg); border-color:var(--warn-line); }
.warn strong{ color:var(--warn); }
.tip{ background:var(--tip-bg); border-color:var(--tip-line); }
.tip strong{ color:var(--tip); }
.analogy{ background:var(--analogy-bg); border-color:var(--analogy-line); }
.analogy strong{ color:var(--analogy); }
.example{ background:var(--example-bg); border-color:var(--example-line); }
.example strong{ color:var(--example); }

table{ border-collapse:collapse; width:100%; margin:1em 0; font-size:10pt; break-inside:avoid; }
th,td{ border:1px solid var(--line); padding:.5em .65em; text-align:left; vertical-align:top; }
thead th{ background:var(--brand); color:#fff; font-weight:600; }
tbody tr:nth-child(even){ background:#f5f9f8; }

dl{ margin:1em 0; }
dt{ font-weight:700; color:#0c4f44; margin-top:.7em; }
dd{ margin:.15em 0 .15em 0; padding-left:1em; border-left:3px solid var(--brand-soft); color:#2c3a4d; }

.cover{ break-after:page; text-align:center; padding-top:50mm; }
.cover .kicker{ letter-spacing:3px; text-transform:uppercase; color:var(--muted); font-size:11pt; margin-bottom:10mm; }
.cover h1{ font-size:33pt; color:var(--brand); margin:0 0 6mm; }
.cover .sub{ font-size:15pt; color:var(--muted); margin:0 0 24mm; font-weight:400; }
.cover .meta{ font-size:10.5pt; color:var(--muted); }
.cover .rule{ width:60mm; height:4px; background:var(--brand); margin:8mm auto; border-radius:3px; }

.toc{ break-after:page; }
.toc h2{ color:var(--brand); }
.toc ol{ list-style:none; padding-left:0; font-size:12pt; }
.toc li{ padding:.45em 0; border-bottom:1px dashed var(--line); }
.toc a{ color:var(--ink); }
.toc .group{ margin-top:1.2em; font-weight:700; color:var(--brand); text-transform:uppercase; letter-spacing:1px; font-size:10pt; }
`;

const today = '2026-06-21';

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Security &amp; Privacy Engineering — A Beginner-to-Advanced Study Guide</title>
<style>${CSS}</style>
</head>
<body>

<section class="cover">
  <div class="kicker">Study Guide · A durable 20-year skill</div>
  <h1>Security &amp; Privacy<br>Engineering</h1>
  <div class="rule"></div>
  <p class="sub">A Beginner-to-Advanced Study Guide<br>From the CIA triad to AI/LLM security &amp; modern privacy law</p>
  <p class="meta">Prepared ${today} · Read the sections in order</p>
</section>

<nav class="toc">
  <h2>Table of Contents</h2>
  <ol>
    <li><a href="#how-to-use">How to Use This Guide</a></li>
    <div class="group">Core Curriculum</div>
    ${toc}
    <div class="group">Reference</div>
    <li><a href="#glossary">Glossary of Terms</a></li>
    <li><a href="#faq">Frequently Asked Questions</a></li>
    <li><a href="#cheatsheet">Revision Cheat Sheet</a></li>
  </ol>
</nav>

<section class="section">${intro}</section>
${sectionHtml}
<section class="section">${glossary}</section>
<section class="section">${faq}</section>
<section class="section">${cheatsheet}</section>

</body>
</html>`;

const htmlPath = path.join(OUT_DIR, 'Security-Privacy-Engineering.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('HTML written:', htmlPath, '(' + html.length + ' chars, ' + sections.length + ' sections)');
