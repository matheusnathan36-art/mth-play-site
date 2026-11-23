// Avisa o Bing (e outros buscadores do IndexNow) que páginas novas/atualizadas saíram.
// Uso:
//   node scripts/indexnow.mjs https://mthplay.pages.dev/noticia/slug/   (uma ou mais URLs)
//   node scripts/indexnow.mjs --todas                                   (todas as páginas do sitemap online)
// Rode DEPOIS que a página já estiver no ar (o Cloudflare leva ~2 min após o push).
import { readFileSync, readdirSync } from 'node:fs';

const KEY = '6704e112cbbd915ad7aa9ef7d817a725';
const settings = JSON.parse(readFileSync('src/data/settings.json', 'utf8'));
const site = (settings.url || 'https://mthplay.pages.dev').replace(/\/+$/, '');
const host = new URL(site).host;

// Confere se a chave existe em public/ (o IndexNow exige o arquivo no ar).
if (!readdirSync('public').includes(`${KEY}.txt`)) {
  console.error(`Arquivo public/${KEY}.txt não encontrado.`);
  process.exit(1);
}

let urls = process.argv.slice(2).filter((a) => a.startsWith('http'));
if (process.argv.includes('--todas')) {
  const idx = await (await fetch(`${site}/sitemap-index.xml`)).text();
  const mapas = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const m of mapas) {
    const xml = await (await fetch(m)).text();
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
  }
}
urls = [...new Set(urls)].filter((u) => new URL(u).host === host);
if (!urls.length) { console.error('Nenhuma URL para enviar.'); process.exit(1); }

const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${site}/${KEY}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: ${urls.length} URL(s) enviadas -> HTTP ${r.status} ${r.status === 200 || r.status === 202 ? '(aceito)' : await r.text()}`);
