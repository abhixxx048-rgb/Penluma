/* Generalized builder: assembles a study-guide HTML from a workflow output JSON.
 * Usage: node build_guide.cjs <output.json> <out-basename> <title|with|newlines> <subtitle> <kicker>
 * Example:
 *   node build_guide.cjs /tmp/.../task.output Consensus-Raft-Paxos \
 *     "Distributed Systems:|Consensus" "Raft & Paxos - A Beginner-to-Advanced Study Guide" \
 *     "Study Guide · Series 2 of the Distributed Systems track"
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;
const [SRC, BASENAME, TITLE_RAW, SUBTITLE, KICKER] = process.argv.slice(2);
if (!SRC || !BASENAME) {
  console.error('Usage: node build_guide.cjs <output.json> <out-basename> <title> <subtitle> <kicker>');
  process.exit(1);
}

const outer = JSON.parse(fs.readFileSync(SRC, 'utf8'));
let data = outer.result;
if (typeof data === 'string') data = JSON.parse(data);

function clean(html) {
  const i = html.indexOf('<h2');
  return (i > 0 ? html.slice(i) : html).trim();
}

const sections = data.sections
  .sort((a, b) => a.num - b.num)
  .map((s) => ({ num: s.num, title: s.title, part: s.part, html: clean(s.html) }));

const sectionHtml = sections
  .map((s) => `<section class="section">${s.html.replace('<h2', `<h2 id="sec-${s.num}"`)}</section>`)
  .join('\n');

const w = data.wrapper;
const intro = clean(w.intro_html).replace('<h2', '<h2 id="how-to-use"');
const glossary = clean(w.glossary_html).replace('<h2', '<h2 id="glossary"');
const faq = clean(w.faq_html).replace('<h2', '<h2 id="faq"');
const cheatsheet = clean(w.cheatsheet_html).replace('<h2', '<h2 id="cheatsheet"');

let lastPart = null;
const toc = sections
  .map((s) => {
    const esc = s.title.replace(/&(?!amp;)/g, '&amp;');
    let prefix = '';
    if (s.part && s.part !== lastPart) {
      lastPart = s.part;
      prefix = `<div class="group">${s.part.replace(/&(?!amp;)/g, '&amp;')}</div>\n`;
    }
    return `${prefix}<li><a href="#sec-${s.num}">${s.num}. ${esc}</a></li>`;
  })
  .join('\n');

const titleHtml = (TITLE_RAW || 'Study Guide').split('|').join('<br>');
const subtitle = SUBTITLE || '';
const kicker = KICKER || 'Study Guide';

const CSS = `
:root{
  --ink:#1a2230; --muted:#5b6675; --line:#e3e8ef; --bg:#ffffff;
  --brand:#1f4e8c; --brand-soft:#eef3fb;
  --key:#0f7b51; --key-bg:#eafaf1; --key-line:#bce7d2;
  --warn:#9a3412; --warn-bg:#fff4ed; --warn-line:#fcd9c2;
  --tip:#1e5fae; --tip-bg:#eef5ff; --tip-line:#c8defb;
  --analogy:#6b3fa0; --analogy-bg:#f6f0fc; --analogy-line:#e2d3f4;
  --example:#334155; --example-bg:#f4f6f9; --example-line:#dde3ec;
}
@page{ size:A4; margin:18mm 16mm 20mm 16mm; }
*{ box-sizing:border-box; }
body{ font-family:"Segoe UI",-apple-system,Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink); line-height:1.62; font-size:11pt; margin:0; background:var(--bg);
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
h1,h2,h3,h4{ line-height:1.25; color:var(--ink); }
h2{ font-size:20pt; color:var(--brand); margin:0 0 .5em; padding-bottom:.28em; border-bottom:3px solid var(--brand-soft); }
h3{ font-size:14pt; margin:1.5em 0 .5em; color:#173a63; }
h4{ font-size:12pt; margin:1.2em 0 .4em; color:#2a3a50; }
p{ margin:.6em 0; } ul,ol{ margin:.5em 0 .8em; padding-left:1.4em; } li{ margin:.28em 0; }
strong{ color:#10203a; }
code{ font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; font-size:.86em;
  background:#eef1f5; padding:.08em .4em; border-radius:4px; color:#9a3412; }
a{ color:var(--brand); text-decoration:none; }
.section{ break-before:page; } .section:first-of-type{ break-before:auto; }
pre.diagram{ font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; font-size:9pt; line-height:1.35;
  background:#0f1b2d; color:#dbe7f5; padding:14px 16px; border-radius:8px; overflow:hidden;
  white-space:pre; break-inside:avoid; margin:1em 0; border:1px solid #1d3050; }
.key,.warn,.tip,.analogy,.example{ margin:1em 0; padding:.7em .95em .7em 1em; border-radius:8px;
  border:1px solid; break-inside:avoid; font-size:10.4pt; }
.key{ background:var(--key-bg); border-color:var(--key-line); } .key strong{ color:var(--key); }
.warn{ background:var(--warn-bg); border-color:var(--warn-line); } .warn strong{ color:var(--warn); }
.tip{ background:var(--tip-bg); border-color:var(--tip-line); } .tip strong{ color:var(--tip); }
.analogy{ background:var(--analogy-bg); border-color:var(--analogy-line); } .analogy strong{ color:var(--analogy); }
.example{ background:var(--example-bg); border-color:var(--example-line); } .example strong{ color:var(--example); }
table{ border-collapse:collapse; width:100%; margin:1em 0; font-size:10pt; break-inside:avoid; }
th,td{ border:1px solid var(--line); padding:.5em .65em; text-align:left; vertical-align:top; }
thead th{ background:var(--brand); color:#fff; font-weight:600; }
tbody tr:nth-child(even){ background:#f6f8fb; }
dl{ margin:1em 0; } dt{ font-weight:700; color:#173a63; margin-top:.7em; }
dd{ margin:.15em 0 .15em 0; padding-left:1em; border-left:3px solid var(--brand-soft); color:#2c3a4d; }
.cover{ break-after:page; text-align:center; padding-top:55mm; }
.cover .kicker{ letter-spacing:3px; text-transform:uppercase; color:var(--muted); font-size:11pt; margin-bottom:10mm; }
.cover h1{ font-size:34pt; color:var(--brand); margin:0 0 6mm; }
.cover .sub{ font-size:15pt; color:var(--muted); margin:0 0 28mm; font-weight:400; }
.cover .meta{ font-size:10.5pt; color:var(--muted); }
.cover .rule{ width:60mm; height:4px; background:var(--brand); margin:8mm auto; border-radius:3px; }
.toc{ break-after:page; } .toc h2{ color:var(--brand); }
.toc ol{ list-style:none; padding-left:0; font-size:12pt; }
.toc li{ padding:.45em 0; border-bottom:1px dashed var(--line); } .toc a{ color:var(--ink); }
.toc .group{ margin-top:1.2em; font-weight:700; color:var(--brand); text-transform:uppercase; letter-spacing:1px; font-size:10pt; }
`;

const today = '2026-06-23';

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>${titleHtml.replace(/<br>/g, ' ')} - Study Guide</title>
<style>${CSS}</style></head><body>

<section class="cover">
  <div class="kicker">${kicker}</div>
  <h1>${titleHtml}</h1>
  <div class="rule"></div>
  <p class="sub">${subtitle}</p>
  <p class="meta">Prepared ${today} · Read the sections in order</p>
</section>

<nav class="toc">
  <h2>Table of Contents</h2>
  <ol>
    <li><a href="#how-to-use">How to Use This Guide</a></li>
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

</body></html>`;

const htmlPath = path.join(OUT_DIR, BASENAME + '.html');
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('HTML written:', htmlPath, '(' + html.length + ' chars,', sections.length, 'sections)');
