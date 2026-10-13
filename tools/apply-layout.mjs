// Codemod — 8 purono page theke inline header/footer sorie #site-header/#site-footer + layout.js bosano.
// Chalano: node tools/apply-layout.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const dir = 'frontend';
const files = readdirSync(dir).filter((f) => f.endsWith('.html'));
let changed = 0;

for (const f of files) {
  const p = `${dir}/${f}`;
  let s = readFileSync(p, 'utf8');
  const orig = s;

  // inline header block: topbar -> marquee close (first <section> er age)
  const t = s.indexOf('<div class="topbar">');
  if (t !== -1) {
    const sec = s.indexOf('<section', t);
    if (sec === -1) { console.log('SKIP (no section):', f); continue; }
    s = s.slice(0, t) + '<div id="site-header"></div>\n    ' + s.slice(sec);
  }

  // inline footer block: <footer> ... </footer> + whatsapp anchor
  const fstart = s.indexOf('<footer>');
  if (fstart !== -1) {
    const fend = s.indexOf('</footer>', fstart);
    let end = fend + '</footer>'.length;
    const wa = s.indexOf('class="whatsapp"', end);
    if (wa !== -1) {
      const aStart = s.lastIndexOf('<a', wa);
      const aEnd = s.indexOf('</a>', wa);
      if (aStart === fstart + (end - fstart) || aStart < fstart + 80) end = aEnd + '</a>'.length;
    }
    s = s.slice(0, fstart) + '<div id="site-footer"></div>' + s.slice(end);
  }

  // layout.js include — api.js/main.js er age
  if (!s.includes('js/layout.js')) {
    if (s.includes('<script src="js/api.js"')) s = s.replace('<script src="js/api.js"', '<script src="js/layout.js" defer></script>\n    <script src="js/api.js"');
    else if (s.includes('<script src="js/main.js"')) s = s.replace('<script src="js/main.js"', '<script src="js/layout.js" defer></script>\n    <script src="js/main.js"');
    else s = s.replace('</body>', '    <script src="js/layout.js" defer></script>\n  </body>');
  }

  if (s !== orig) { writeFileSync(p, s, 'utf8'); changed++; console.log('updated:', f); }
}
console.log(`done — ${changed} page updated`);
