// Responde "sim" se alguma matéria tem data de publicação na última hora (ou seja, acabou de "vencer").
import { readdirSync, readFileSync } from 'node:fs';

const dir = 'src/content/noticias';
const now = Date.now();
const windowMs = 65 * 60 * 1000;
let found = false;
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.md')) continue;
  const m = readFileSync(`${dir}/${f}`, 'utf8').match(/^date:\s*['"]?([^'"\n]+)/m);
  if (!m) continue;
  const t = new Date(m[1].trim()).getTime();
  if (t <= now && now - t < windowMs) found = true;
}
console.log(found ? 'sim' : 'nao');
