// Gera capas 1280x720 com a identidade do MTH Play (cor da categoria + título + logo).
// Uso: node scripts/gerar-capa.mjs capas.json
// capas.json: [{ "arquivo": "nome.jpg", "titulo": "Tema curto (ex.: nome do jogo)", "etiqueta": "PLAYSTATION", "cor": "#3b82f6" }]
// O texto fica na parte de cima: embaixo o site coloca o título da matéria por cima da imagem.
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const lista = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const settings = JSON.parse(readFileSync('src/data/settings.json', 'utf8'));
const logoPath = 'public' + (settings.logo || '/logo.png');
const W = 1280, H = 720;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function quebrar(texto, max) {
  const palavras = texto.split(/\s+/);
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    if ((atual + ' ' + p).trim().length > max && atual) { linhas.push(atual); atual = p; }
    else atual = (atual + ' ' + p).trim();
  }
  if (atual) linhas.push(atual);
  return linhas;
}

for (const c of lista) {
  const cor = c.cor || '#22d3ee';
  // Centralizado, para não ser cortado nos cards quadrados do site.
  let tam = 68, linhas = quebrar(c.titulo, 20);
  if (linhas.length > 2) { tam = 56; linhas = quebrar(c.titulo, 24); }
  if (linhas.length > 2) linhas = linhas.slice(0, 2);
  const y0 = 56 + 44 + 26 + tam;
  const textos = linhas
    .map((l, i) => `<text x="640" text-anchor="middle" y="${y0 + i * tam * 1.08}" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="${tam}" fill="#fff" fill-opacity=".92" letter-spacing="-2">${esc(l)}</text>`)
    .join('');
  const etiqueta = c.etiqueta ? esc(c.etiqueta.toUpperCase()) : '';
  const largEtiq = etiqueta.length * 17 + 44;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="a" cx="85%" cy="5%" r="80%"><stop offset="0" stop-color="${cor}" stop-opacity=".75"/><stop offset="1" stop-color="${cor}" stop-opacity="0"/></radialGradient>
      <radialGradient id="b" cx="0%" cy="100%" r="70%"><stop offset="0" stop-color="#ff2bb3" stop-opacity=".30"/><stop offset="1" stop-color="#ff2bb3" stop-opacity="0"/></radialGradient>
      <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".06"/></pattern>
      <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#0a0b12"/><rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" fill="url(#a)"/><rect width="100%" height="100%" fill="url(#b)"/><rect width="100%" height="100%" fill="url(#s)"/>
    ${etiqueta ? `<rect x="${640 - largEtiq / 2}" y="${y0 - tam - 62}" width="${largEtiq}" height="44" rx="10" fill="${cor}"/><text x="640" text-anchor="middle" y="${y0 - tam - 31}" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="22" fill="#fff" letter-spacing="2">${etiqueta}</text>` : ''}
    ${textos}
  </svg>`;
  const camadas = [];
  if (existsSync(logoPath)) {
    const logo = await sharp(logoPath).trim().resize({ height: 110 }).toBuffer();
    const m = await sharp(logo).metadata();
    camadas.push({ input: logo, left: W - m.width - 60, top: 50 });
  }
  await sharp(Buffer.from(svg)).composite(camadas).jpeg({ quality: 85, mozjpeg: true }).toFile(`public/uploads/${c.arquivo}`);
  console.log('capa:', c.arquivo);
}
