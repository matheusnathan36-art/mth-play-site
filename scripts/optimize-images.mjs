// Roda depois do build: reduz e comprime as imagens enviadas pelo painel (dist/uploads).
// Mantém o mesmo nome de arquivo, então os links continuam funcionando.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const DIR = 'dist/uploads';
const MAX_WIDTH = 1600;
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function* walk(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (exts.has(extname(e.name).toLowerCase())) yield p;
  }
}

let saved = 0;
let count = 0;
for await (const file of walk(DIR)) {
  const input = await readFile(file);
  const ext = extname(file).toLowerCase();
  let img = sharp(input, { failOn: 'none' }).rotate();
  const meta = await img.metadata();
  if ((meta.width ?? 0) > MAX_WIDTH) img = img.resize({ width: MAX_WIDTH });
  if (ext === '.png') img = img.png({ compressionLevel: 9, palette: true, quality: 85 });
  else if (ext === '.webp') img = img.webp({ quality: 80 });
  else img = img.jpeg({ quality: 80, mozjpeg: true });
  const out = await img.toBuffer();
  if (out.length < input.length) {
    await writeFile(file, out);
    saved += input.length - out.length;
    count++;
  }
}
console.log(`Imagens otimizadas: ${count} (economia de ${(saved / 1024 / 1024).toFixed(1)} MB)`);
