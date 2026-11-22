// Gera capa 1280x720 com o LOGO OFICIAL de uma empresa/jogo (SVG ou PNG) sobre a cor da marca dela,
// com o selo do MTH Play no canto. Use quando não houver vídeo oficial no YouTube.
// Uso: node scripts/capa-logo.mjs <logo.svg|png> <corDeFundo #hex> <saida.jpg> [branco]
//   - "branco" (opcional) pinta o logo de branco (útil para logos pretos em fundo escuro).
// Logos oficiais em domínio público/uso livre: Wikimedia Commons (https://commons.wikimedia.org),
// baixe pelo endereço https://commons.wikimedia.org/wiki/Special:FilePath/NOME_DO_ARQUIVO.svg
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const [logoPath, cor = '#1f2937', saida, branco] = process.argv.slice(2);
if (!logoPath || !saida) {
  console.error('Uso: node scripts/capa-logo.mjs <logo> <#cor> <public/uploads/nome.jpg> [branco]');
  process.exit(1);
}
const W = 1280, H = 720;
let logoBuf = readFileSync(logoPath);
if (branco === 'branco' && logoPath.endsWith('.svg')) {
  logoBuf = Buffer.from(
    logoBuf.toString('utf8').replace(/fill="#[0-9a-fA-F]{3,8}"/g, 'fill="#fff"').replace(/fill:#[0-9a-fA-F]{3,8}/g, 'fill:#fff'),
  );
}
const logo = await sharp(logoBuf, { density: 400 }).trim()
  .resize({ width: 760, height: 300, fit: 'inside' }).png().toBuffer();
const m = await sharp(logo).metadata();

const fundo = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="a" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="${cor}"/><stop offset="1" stop-color="${cor}" stop-opacity=".55"/></radialGradient>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".07"/></pattern>
  </defs>
  <rect width="100%" height="100%" fill="#07080d"/><rect width="100%" height="100%" fill="url(#a)"/>
  <rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#s)"/>
</svg>`);

const camadas = [{ input: logo, left: Math.round((W - m.width) / 2), top: Math.max(70, Math.round(250 - m.height / 2)) }];
const settings = JSON.parse(readFileSync('src/data/settings.json', 'utf8'));
const mth = 'public' + (settings.logo || '/logo.png');
if (existsSync(mth)) {
  const selo = await sharp(mth).trim().resize({ height: 90 }).toBuffer();
  const s = await sharp(selo).metadata();
  camadas.push({ input: selo, left: W - s.width - 40, top: 36 });
}
await sharp(fundo).composite(camadas).jpeg({ quality: 88, mozjpeg: true }).toFile(saida);
console.log('capa criada:', saida);
