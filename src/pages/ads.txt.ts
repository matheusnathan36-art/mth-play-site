import type { APIRoute } from 'astro';
import { SITE } from '../data/site';

// Arquivo exigido pelo Google AdSense. Gerado a partir do código preenchido no painel.
export const GET: APIRoute = () => {
  const pub = (SITE.adsenseClient || '').replace(/^ca-/, '');
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : '';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
