// Roda antes do build: gera o ícone da aba (logo-square.png) e a arte de compartilhamento
// (og-default.png) a partir do logo escolhido no painel. Trocou o logo, tudo acompanha.
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';

const settings = JSON.parse(readFileSync('src/data/settings.json', 'utf8'));
const logoPath = 'public' + (settings.logo || '/logo.png').replace(/^\/?/, '/');
if (!existsSync(logoPath)) {
  console.warn(`Logo não encontrado em ${logoPath}; mantendo ícones atuais.`);
  process.exit(0);
}
const c1 = settings.colors?.primary || '#22d3ee';
const c2 = settings.colors?.secondary || '#ff2bb3';
const tagline = (settings.tagline || '').replace(/[<>&"]/g, '');
const logo = readFileSync(logoPath);

// Ícone quadrado (aba do navegador, atalho no celular, painel).
await sharp(logo)
  .trim()
  .resize({ width: 512, height: 512, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile('public/logo-square.png');

// Arte 1200x630 para WhatsApp/redes quando a matéria não tem capa.
const W = 1200, H = 630;
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="a" cx="15%" cy="10%" r="70%"><stop offset="0" stop-color="${c1}" stop-opacity=".35"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="90%" cy="100%" r="70%"><stop offset="0" stop-color="${c2}" stop-opacity=".35"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>
    <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="100%" height="100%" fill="#0a0b12"/><rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#a)"/><rect width="100%" height="100%" fill="url(#b)"/>
  <text x="50%" y="575" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="600" fill="#c9cce0">${tagline}</text>
</svg>`);
const logoImg = await sharp(logo).trim().resize({ width: 900, height: 400, fit: 'inside' }).png().toBuffer();
const m = await sharp(logoImg).metadata();
await sharp(bg)
  .composite([{ input: logoImg, left: Math.round((W - m.width) / 2), top: Math.round((520 - m.height) / 2) + 20 }])
  .png({ compressionLevel: 9 })
  .toFile('public/og-default.png');

console.log('Ícone e arte de compartilhamento gerados a partir do logo.');
