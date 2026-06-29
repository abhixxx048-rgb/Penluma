/* MCQ study-guide builder: assembles an HTML exam-prep guide from a workflow output JSON.
 * The input file is a Workflow `.output` file (top-level `result`) OR any JSON with a `result`
 * (or top-level) object shaped { sections:[{num,title,part,html}], wrapper:{intro_html,...} }.
 *
 * Usage: node build_mcq.cjs <input.json> <out-basename>
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = __dirname;
const [SRC, BASENAME] = process.argv.slice(2);
if (!SRC || !BASENAME) {
  console.error('Usage: node build_mcq.cjs <input.json> <out-basename>');
  process.exit(1);
}

const outer = JSON.parse(fs.readFileSync(SRC, 'utf8'));
let data = outer.result !== undefined ? outer.result : outer;
if (typeof data === 'string') data = JSON.parse(data);

function clean(html) {
  if (!html) return '';
  // strip accidental markdown code fences
  html = html.replace(/```html\s*/gi, '').replace(/```\s*$/g, '').trim();
  const i = html.indexOf('<h2');
  return (i >= 0 ? html.slice(i) : html).trim();
}

const sections = data.sections
  .slice()
  .sort((a, b) => a.num - b.num)
  .map((s) => ({ num: s.num, title: s.title, part: s.part, html: clean(s.html) }));

// count questions for the cover
const qCount = sections.reduce(
  (n, s) => n + (s.html.match(/class="q"/g) || []).length,
  0
);

const sectionHtml = sections
  .map((s) => `<section class="section">${s.html.replace('<h2', `<h2 id="sec-${s.num}"`)}</section>`)
  .join('\n');

const w = data.wrapper || {};
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

const CSS = `
:root{
  --ink:#16202e; --muted:#5b6675; --line:#e3e8ef; --bg:#ffffff;
  --brand:#d6730a; --brand-deep:#9a4f06; --brand-soft:#fff3e6;
  --navy:#232f3e; --navy-soft:#eef1f6;
  --key:#0f7b51; --key-bg:#eafaf1; --key-line:#bce7d2;
  --warn:#9a3412; --warn-bg:#fff4ed; --warn-line:#fcd9c2;
  --tip:#1e5fae; --tip-bg:#eef5ff; --tip-line:#c8defb;
  --ans:#0f7b51; --ans-bg:#eafaf1; --ans-line:#9fdcbe;
}
@page{ size:A4; margin:18mm 15mm 18mm 15mm; }
*{ box-sizing:border-box; }
body{ font-family:"Segoe UI",-apple-system,Roboto,Helvetica,Arial,sans-serif;
  color:var(--ink); line-height:1.58; font-size:10.6pt; margin:0; background:var(--bg);
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }
h1,h2,h3,h4{ line-height:1.25; }
h2{ font-size:19pt; color:var(--navy); margin:0 0 .5em; padding-bottom:.28em; border-bottom:3px solid var(--brand); }
h3{ font-size:13.5pt; margin:1.4em 0 .5em; color:var(--brand-deep); }
h4{ font-size:11.5pt; margin:1.1em 0 .4em; color:#2a3a50; }
p{ margin:.55em 0; } ul,ol{ margin:.4em 0 .7em; padding-left:1.35em; } li{ margin:.22em 0; }
strong{ color:#0e1a2c; }
code{ font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; font-size:.86em;
  background:#eef1f5; padding:.06em .38em; border-radius:4px; color:#9a4f06; }
a{ color:var(--brand-deep); text-decoration:none; }
.section{ break-before:page; } .section:first-of-type{ break-before:auto; }
p.lead{ font-size:11pt; color:#33404f; background:var(--navy-soft); border-left:4px solid var(--navy);
  padding:.6em .9em; border-radius:0 8px 8px 0; margin:.2em 0 1.1em; }
.key,.warn,.tip{ margin:.9em 0; padding:.6em .9em; border-radius:8px; border:1px solid; break-inside:avoid; font-size:10pt; }
.key{ background:var(--key-bg); border-color:var(--key-line); } .key strong{ color:var(--key); }
.warn{ background:var(--warn-bg); border-color:var(--warn-line); } .warn strong{ color:var(--warn); }
.tip{ background:var(--tip-bg); border-color:var(--tip-line); } .tip strong{ color:var(--tip); }
table{ border-collapse:collapse; width:100%; margin:.9em 0; font-size:9.6pt; break-inside:avoid; }
th,td{ border:1px solid var(--line); padding:.45em .6em; text-align:left; vertical-align:top; }
thead th{ background:var(--navy); color:#fff; font-weight:600; }
tbody tr:nth-child(even){ background:#f6f8fb; }

/* ---- MCQ blocks ---- */
.mcq{ break-inside:avoid; margin:0 0 1.15em; padding:.85em 1em .9em; border:1px solid var(--line);
  border-radius:10px; background:#fcfdff; box-shadow:0 1px 0 #eef1f5; }
.mcq .q{ font-weight:600; color:#15202f; margin:.1em 0 .6em; font-size:10.8pt; }
.mcq .qn{ display:inline-block; background:var(--navy); color:#fff; font-weight:700; font-size:8.6pt;
  letter-spacing:.5px; padding:.18em .5em; border-radius:5px; margin-right:.55em; vertical-align:middle; }
.mcq ol.opts{ list-style:upper-alpha; margin:.2em 0 .7em; padding-left:1.7em; }
.mcq ol.opts li{ margin:.2em 0; padding-left:.2em; }
.mcq .ans{ margin:.5em 0 .35em; }
.mcq .badge{ display:inline-block; background:var(--ans-bg); color:var(--ans); border:1px solid var(--ans-line);
  font-weight:700; font-size:9.4pt; padding:.2em .6em; border-radius:6px; }
.mcq .exp{ margin:.35em 0; font-size:9.9pt; }
.mcq .exp strong{ color:var(--ans); }
.mcq .wrong{ margin:.35em 0; font-size:9.7pt; }
.mcq .wrong > strong{ color:var(--warn); }
.mcq .wrong ul{ margin:.25em 0 .2em; }
.mcq .trap{ margin:.45em 0 .1em; font-size:9.7pt; background:var(--warn-bg); border:1px solid var(--warn-line);
  border-radius:7px; padding:.45em .7em; }
.mcq .trap strong{ color:var(--warn); }

.cover{ break-after:page; text-align:center; padding-top:48mm; }
.cover .kicker{ letter-spacing:3px; text-transform:uppercase; color:var(--muted); font-size:11pt; margin-bottom:9mm; }
.cover h1{ font-size:31pt; color:var(--navy); margin:0 0 5mm; }
.cover .sub{ font-size:14pt; color:var(--muted); margin:0 0 6mm; font-weight:400; }
.cover .count{ display:inline-block; background:var(--brand-soft); color:var(--brand-deep); border:1px solid #f3c995;
  font-weight:700; font-size:13pt; padding:.5em 1.1em; border-radius:30px; margin:2mm 0 24mm; }
.cover .meta{ font-size:10.5pt; color:var(--muted); }
.cover .rule{ width:58mm; height:4px; background:var(--brand); margin:7mm auto; border-radius:3px; }
.toc{ break-after:page; } .toc h2{ color:var(--navy); }
.toc ol{ list-style:none; padding-left:0; font-size:11.5pt; }
.toc li{ padding:.4em 0; border-bottom:1px dashed var(--line); } .toc a{ color:var(--ink); }
.toc .group{ margin-top:1.1em; font-weight:700; color:var(--brand-deep); text-transform:uppercase; letter-spacing:1px; font-size:9.5pt; }
`;

const today = '2026-06-28';
const titleHtml = 'AWS Certified Cloud Practitioner<br>(CLF-C02)';
const subtitle = 'Scenario-Based MCQ Workbook - Master the Confusing Topics & Common Traps';
const kicker = 'Exam-Prep Question Bank';

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>AWS Cloud Practitioner (CLF-C02) - MCQ Workbook</title>
<style>${CSS}</style></head><body>

<section class="cover">
  <div class="kicker">${kicker}</div>
  <h1>${titleHtml}</h1>
  <div class="rule"></div>
  <p class="sub">${subtitle}</p>
  <div class="count">${qCount}+ practice questions · full explanations · trap alerts</div>
  <p class="meta">Prepared ${today} · 16 topic sets across 6 exam domains</p>
</section>

<nav class="toc">
  <h2>Table of Contents</h2>
  <ol>
    <li><a href="#how-to-use">How to Use This Workbook</a></li>
    ${toc}
    <div class="group">Reference</div>
    <li><a href="#glossary">Glossary of Confused Terms</a></li>
    <li><a href="#faq">Exam FAQs</a></li>
    <li><a href="#cheatsheet">Final Revision Cheat Sheet</a></li>
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
console.log('HTML written:', htmlPath, '(' + html.length + ' chars,', sections.length, 'sections,', qCount, 'questions)');
