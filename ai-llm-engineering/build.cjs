// Assembles content.json into a print-ready, self-contained HTML study guide.
// Usage: node build.js   ->  writes index.html  (then headless Chrome -> PDF)
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));

const CSS = `
:root{
  --ink:#1a1a2e; --muted:#555; --line:#e3e3ee;
  --brand:#4338ca; --brand2:#7c3aed; --brand-soft:#eef2ff;
  --tip:#047857; --tip-bg:#ecfdf5; --tip-line:#a7f3d0;
  --warn:#b45309; --warn-bg:#fffbeb; --warn-line:#fcd34d;
  --key:#1d4ed8; --key-bg:#eff6ff; --key-line:#bfdbfe;
}
*{box-sizing:border-box;}
html{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
body{
  font-family:"Helvetica Neue",Arial,"Segoe UI",sans-serif;
  color:var(--ink); line-height:1.62; font-size:11.2pt; margin:0;
}
h1,h2,h3,h4{ line-height:1.25; color:var(--ink); }
p{ margin:0 0 .7em; }
ul,ol{ margin:.2em 0 .9em; padding-left:1.25em; }
li{ margin:.25em 0; }
strong{ color:#111; }
code{ font-family:"SF Mono",Menlo,Consolas,monospace; font-size:.86em; background:#f4f4fb; padding:1px 4px; border-radius:4px; color:#3730a3; }
a{ color:var(--brand); text-decoration:none; }

/* ---- Cover ---- */
.cover{
  height:100vh; display:flex; flex-direction:column; justify-content:center;
  padding:0 60px; page-break-after:always;
  background:linear-gradient(135deg,#4338ca 0%,#7c3aed 55%,#2563eb 100%); color:#fff;
}
.cover .kicker{ font-size:12pt; letter-spacing:3px; text-transform:uppercase; opacity:.85; margin-bottom:18px;}
.cover h1{ font-size:40pt; margin:0 0 14px; color:#fff; line-height:1.1; }
.cover .sub{ font-size:15pt; opacity:.95; max-width:640px; }
.cover .pillars{ margin-top:34px; display:flex; flex-direction:column; gap:8px; font-size:12.5pt; }
.cover .pillars span{ opacity:.95; }
.cover .meta{ margin-top:auto; padding-bottom:8px; font-size:10pt; opacity:.8; }

/* ---- TOC ---- */
.toc{ page-break-after:always; padding-top:10px; }
.toc h2{ border:none; }
.toc ol{ list-style:none; padding:0; counter-reset:toc; }
.toc li{ counter-increment:toc; padding:9px 0; border-bottom:1px solid var(--line); font-size:12pt; }
.toc li::before{ content:counter(toc) ".  "; color:var(--brand); font-weight:700; }

/* ---- Chapters ---- */
.chapter{ page-break-before:always; }
h2{
  font-size:21pt; margin:6px 0 14px; padding-bottom:10px;
  border-bottom:3px solid var(--brand); color:var(--brand);
}
h3{ font-size:14.5pt; margin:22px 0 8px; color:#312e81; }
h4{ font-size:12pt; margin:16px 0 4px; color:#3730a3; }

table{ width:100%; border-collapse:collapse; margin:12px 0; font-size:10pt; }
th,td{ border:1px solid var(--line); padding:7px 9px; text-align:left; vertical-align:top; }
th{ background:var(--brand-soft); color:#312e81; font-weight:700; }
tr:nth-child(even) td{ background:#fafaff; }

pre{ border-radius:8px; margin:12px 0; overflow:hidden; white-space:pre-wrap; word-wrap:break-word; }
pre.diagram{
  background:#0f172a; color:#cbd5e1; padding:14px 16px; font-size:8.7pt; line-height:1.35;
  font-family:"SF Mono",Menlo,Consolas,monospace; border:1px solid #1e293b;
}
pre.code{ background:#f6f6fb; border:1px solid var(--line); padding:12px 14px; }
pre.code code{ background:none; color:#1e293b; padding:0; font-size:9pt; }

blockquote.analogy{
  margin:12px 0; padding:10px 16px; border-left:4px solid var(--brand2);
  background:#faf5ff; color:#4c1d95; border-radius:0 6px 6px 0; font-style:italic;
}
.callout{ margin:12px 0; padding:10px 14px; border-radius:8px; border:1px solid; font-size:10.4pt; page-break-inside:avoid; }
.callout strong{ color:inherit; }
.callout.tip{ background:var(--tip-bg); border-color:var(--tip-line); color:#065f46; }
.callout.warn{ background:var(--warn-bg); border-color:var(--warn-line); color:#92400e; }
.callout.key{ background:var(--key-bg); border-color:var(--key-line); color:#1e3a8a; }

/* glossary */
.glossary-table td:first-child{ font-weight:700; color:#312e81; width:30%; white-space:nowrap; }

/* cheat sheet */
.cheat h3{ background:var(--brand-soft); padding:6px 10px; border-radius:6px; }

@page{ size:A4; margin:16mm 15mm; }
@media print{ .chapter{ page-break-before:always; } }
`;

function toc(chapters){
  const items = chapters.map(c=>`<li><a href="#${c.id}">${c.title.replace(/<[^>]+>/g,'')}</a></li>`).join('\n');
  return `<section class="toc"><h2>Contents</h2><ol>${items}</ol></section>`;
}

function chapterHtml(c){
  // c.html already contains its own <h2>...; just wrap + anchor
  return `<section class="chapter ${c.cls||''}" id="${c.id}">${c.html}</section>`;
}

function glossaryChapter(glossary){
  if(!glossary || !glossary.length) return '';
  const rows = glossary
    .sort((a,b)=>a.term.toLowerCase().localeCompare(b.term.toLowerCase()))
    .map(g=>`<tr><td>${g.term}</td><td>${g.definition}</td></tr>`).join('\n');
  return `<section class="chapter" id="glossary"><h2>Glossary - Plain-English Definitions</h2>
  <p>Quick reference for every key term used in this guide.</p>
  <table class="glossary-table"><thead><tr><th>Term</th><th>What it means</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

const chaptersHtml = data.chapters.map(chapterHtml).join('\n');
const glossHtml = glossaryChapter(data.glossary);

const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>${data.title}</title><style>${CSS}</style></head><body>
<section class="cover">
  <div class="kicker">A Beginner → Advanced Study Guide</div>
  <h1>${data.title}</h1>
  <div class="sub">${data.subtitle}</div>
  <div class="pillars">
    <span>① Evaluation &amp; Measurement</span>
    <span>② Context Engineering &amp; Retrieval</span>
    <span>③ Agent Architecture &amp; Orchestration</span>
    <span>④ AI Product Judgment</span>
  </div>
  <div class="meta">${data.date} · The durable skills that survive model churn</div>
</section>
${toc([...data.chapters, {id:'glossary', title:'Glossary'}])}
${chaptersHtml}
${glossHtml}
</body></html>`;

fs.writeFileSync(path.join(__dirname,'index.html'), html, 'utf8');
console.log('Wrote index.html ('+(html.length/1024).toFixed(1)+' KB, '+data.chapters.length+' chapters, '+(data.glossary?data.glossary.length:0)+' glossary terms)');
