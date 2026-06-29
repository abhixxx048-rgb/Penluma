/* Merge two CG/print study guides into one master content.json.
 * Backbone = my 14-section workflow output (full 7-pillar scope).
 * Spliced in = the pre-existing guide's dedicated Gamut, Trapping, Typography sections.
 * Glossaries merged (deduped). FAQ + cheat sheet taken from the full-scope guide.
 * Output: merged-content.json  ->  { result: { sections, wrapper } }
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const MINE_SRC = process.argv[2]; // task.output (workflow result)
const OTHER_HTML = path.join(DIR, 'Computer-Graphics-For-Print.html');

// ---- load my content -------------------------------------------------------
const outer = JSON.parse(fs.readFileSync(MINE_SRC, 'utf8'));
let mine = outer.result;
if (typeof mine === 'string') mine = JSON.parse(mine);
const mineSecs = mine.sections.slice().sort((a, b) => a.num - b.num);
const byNum = (n) => mineSecs.find((s) => s.num === n);

// ---- extract sections from the other guide's built HTML --------------------
const otherHtml = fs.readFileSync(OTHER_HTML, 'utf8');
const chunks = otherHtml.split('<section class="section">').slice(1).map((c) => {
  const end = c.lastIndexOf('</section>');
  return (end >= 0 ? c.slice(0, end) : c).trim();
});
function findChunk(needle) {
  const hit = chunks.find((c) => {
    const m = c.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
    return m && m[1].includes(needle);
  });
  if (!hit) throw new Error('could not find other-guide section: ' + needle);
  return hit;
}
const otherGamut = findChunk('Gamut &amp; Out-of-Gamut');
const otherTrapping = findChunk('Trapping');
const otherTypography = findChunk('Typography');

// ---- set the first <h2> of a fragment to "N. Title" ------------------------
const esc = (s) => s.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');
function setH2(html, num, title) {
  return html.replace(/<h2[^>]*>[\s\S]*?<\/h2>/, `<h2>${num}. ${esc(title)}</h2>`);
}

// ---- unified, deduplicated curriculum order --------------------------------
const ORDER = [
  { src: 'mine', n: 1,  title: 'How Color Works: Light & Human Perception' },
  { src: 'mine', n: 2,  title: 'Color Spaces & Additive vs Subtractive Color' },
  { src: 'mine', n: 3,  title: 'Color Management: ICC Profiles & the Pipeline' },
  { src: 'mine', n: 4,  title: 'Rendering Intents & Gamut Mapping' },
  { src: 'gamut', title: 'Gamut & Out-of-Gamut Handling (Deep Dive)' },
  { src: 'mine', n: 5,  title: 'Ink on the Page: Spot Colors, Overprint & Black Generation' },
  { src: 'mine', n: 6,  title: 'Raster vs Vector, Resolution & Image Quality' },
  { src: 'mine', n: 7,  title: 'Halftoning & Screening: Turning Tone into Dots' },
  { src: 'trapping', title: 'Trapping (Deep Dive)' },
  { src: 'mine', n: 8,  title: 'Inside a PDF: Structure, Graphics & Fonts' },
  { src: 'typography', title: 'Typography & Text Rendering' },
  { src: 'mine', n: 9,  title: 'PDF/X, Output Intent & Page Boxes — The Print-Ready Target' },
  { src: 'mine', n: 10, title: 'Preflight: Validating a File Before It Prints' },
  { src: 'mine', n: 11, title: 'Imposition & Binding: Arranging Pages on the Sheet' },
  { src: 'mine', n: 12, title: 'Finishing & Document Geometry: Bleed, Trim & Safe Area' },
  { src: 'mine', n: 13, title: 'Print Methods & Substrates: How Ink Meets Paper' },
  { src: 'mine', n: 14, title: 'The RIP, Press Operation & Color Measurement' },
];
const OTHER = { gamut: otherGamut, trapping: otherTrapping, typography: otherTypography };

const sections = ORDER.map((item, i) => {
  const num = i + 1;
  const rawHtml = item.src === 'mine' ? byNum(item.n).html : OTHER[item.src];
  return { num, title: item.title, html: setH2(rawHtml, num, item.title) };
});

// ---- merge glossaries ------------------------------------------------------
function glossaryDl(html) {
  const dl = html.match(/<dl>([\s\S]*?)<\/dl>/);
  return dl ? dl[1] : '';
}
function pairs(dlInner) {
  const out = [];
  const re = /<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g;
  let m;
  while ((m = re.exec(dlInner))) out.push({ dt: m[1].trim(), dd: m[2].trim() });
  return out;
}
const keyOf = (dt) =>
  dt.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').toLowerCase()
    .replace(/[\s.,;:()]+$/g, '').trim();

const otherGloss = chunks.find((c) => /<h2[^>]*>Glossary/.test(c)) || '';
const map = new Map();
// other first, then mine overwrites (mine = tailored to this guide)
for (const p of pairs(glossaryDl(otherGloss))) map.set(keyOf(p.dt), p);
for (const p of pairs(glossaryDl(mine.wrapper.glossary_html))) map.set(keyOf(p.dt), p);

const merged = [...map.values()].sort((a, b) => keyOf(a.dt).localeCompare(keyOf(b.dt)));
const mergedDl = '<dl>\n' + merged.map((p) => `  <dt>${p.dt}</dt><dd>${p.dd}</dd>`).join('\n') + '\n</dl>';
const glossary_html = mine.wrapper.glossary_html.replace(/<dl>[\s\S]*?<\/dl>/, mergedDl);

// ---- assemble wrapper (intro patched for new count, faq+cheatsheet = mine) --
let intro_html = mine.wrapper.intro_html
  .replace(/\b14 sections\b/g, `${sections.length} sections`)
  .replace(/\bfourteen sections\b/gi, `${sections.length} sections`);

const wrapper = {
  intro_html,
  glossary_html,
  faq_html: mine.wrapper.faq_html,
  cheatsheet_html: mine.wrapper.cheatsheet_html,
};

const out = { result: { sections, wrapper } };
const outPath = path.join(DIR, 'merged-content.json');
fs.writeFileSync(outPath, JSON.stringify(out), 'utf8');
console.log('Merged:', sections.length, 'sections,', merged.length, 'glossary terms');
console.log('Wrote', outPath);
console.log('Order:', sections.map((s) => `${s.num}.${s.title.split(':')[0].split(' (')[0]}`).join(' | '));
