import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

// O endereço do site vem do painel (Configurações → Endereço do site).
const settings = JSON.parse(readFileSync(new URL('./src/data/settings.json', import.meta.url), 'utf8'));
const site = (settings.url || 'https://mthplay.pages.dev').replace(/\/+$/, '');

export default defineConfig({
  site,
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
});
