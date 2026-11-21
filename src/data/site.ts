// As configurações do site ficam em settings.json, que é editado pelo painel (/admin → Configurações).
// Este arquivo só organiza esses dados para o resto do site. Não precisa mexer aqui.
import settings from './settings.json';

type Category = { slug: string; name: string; color?: string; menu?: boolean };

const s = settings as typeof settings & { categories: Category[] };

export const SITE = {
  ...s,
  lang: 'pt-BR',
  defaultAuthor: 'Equipe MTH Play',
  logo: s.logo || '/logo.png',
  colors: {
    primary: s.colors?.primary || '#22d3ee',
    secondary: s.colors?.secondary || '#ff2bb3',
  },
};

export const CATEGORIES: Required<Category>[] = (s.categories ?? [])
  .filter((c) => c?.slug && c?.name)
  .map((c) => ({ slug: c.slug, name: c.name, color: c.color || '#64748b', menu: c.menu !== false }));

// Plataformas que aparecem no menu, na lateral, no calendário e nas páginas de jogo.
export const MENU_CATEGORIES = CATEGORIES.filter((c) => c.menu);

export const HOME_SECTIONS: string[] = (s.homeSections ?? []).filter(Boolean);

export const TYPES = [
  { slug: 'noticia', name: 'Notícia', plural: 'Notícias' },
  { slug: 'review', name: 'Review', plural: 'Reviews' },
  { slug: 'guia', name: 'Guia', plural: 'Guias' },
  { slug: 'lista', name: 'Lista', plural: 'Listas' },
  { slug: 'video', name: 'Vídeo', plural: 'Vídeos' },
] as const;
