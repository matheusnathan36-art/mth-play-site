import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, TYPES, SITE } from '../data/site';

export type Post = CollectionEntry<'noticias'>;
export type Jogo = CollectionEntry<'jogos'>;
export type Autor = CollectionEntry<'autores'>;

// Publicações com data futura só aparecem quando a data chega (agendamento).
export async function getPosts(): Promise<Post[]> {
  const now = Date.now();
  const all = await getCollection(
    'noticias',
    ({ data }) => import.meta.env.DEV || (!data.draft && data.date.getTime() <= now),
  );
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const postUrl = (p: Post) => `/noticia/${p.id}/`;

export const categoryName = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

export const categoryColor = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.color ?? '#64748b';

export function topTags(posts: Post[], n = 8) {
  const count = new Map<string, number>();
  posts.forEach((p) => p.data.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
  return [...count].sort((a, b) => b[1] - a[1]).slice(0, n).map(([t]) => t);
}

export const typeName = (slug: string) => TYPES.find((t) => t.slug === slug)?.name ?? slug;

// ---------- Autores ----------
const AUTHORS: Autor[] = (await getCollection('autores')).sort(
  (a, b) => (a.data.order ?? 99) - (b.data.order ?? 99) || a.data.name.localeCompare(b.data.name),
);
export const getAuthors = () => AUTHORS;

export function authorEntry(p: Post): Autor | undefined {
  const a = p.data.author;
  if (!a) return AUTHORS.find((x) => x.data.name === SITE.defaultAuthor);
  return AUTHORS.find((x) => x.id === a || x.data.name.toLowerCase() === a.toLowerCase());
}
export const authorOf = (p: Post) => authorEntry(p)?.data.name ?? p.data.author ?? SITE.defaultAuthor;
export const authorUrl = (a: Autor) => `/autor/${a.id}/`;
export const initials = (name: string) =>
  name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const postsByAuthor = (posts: Post[], a: Autor) =>
  posts.filter((p) => authorEntry(p)?.id === a.id);

// ---------- Jogos ----------
export async function getJogos(): Promise<Jogo[]> {
  return (await getCollection('jogos')).sort((a, b) => a.data.title.localeCompare(b.data.title));
}
export const jogoUrl = (j: Jogo) => `/jogo/${j.id}/`;
export function postsOfJogo(posts: Post[], j: Jogo) {
  const names = [j.data.title, ...j.data.aliases].map((n) => n.toLowerCase());
  return posts.filter(
    (p) => p.data.jogo === j.id || p.data.tags.some((t) => names.includes(t.toLowerCase())),
  );
}
export function jogoOfPost(jogos: Jogo[], p: Post) {
  if (p.data.jogo) return jogos.find((j) => j.id === p.data.jogo);
  return jogos.find((j) => postsOfJogo([p], j).length > 0);
}
const fmtLong = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
export function releaseLabel(j: Jogo) {
  if (j.data.releaseDate) return fmtLong.format(j.data.releaseDate);
  return j.data.releaseText ?? 'A definir';
}
export const isReleased = (j: Jogo) => !!j.data.releaseDate && j.data.releaseDate.getTime() <= Date.now();

// ---------- Utilidades ----------
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
export const formatDate = (d: Date) => fmt.format(d).replace('.', '');

export function readingTime(body = '') {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Capa da publicação; se não tiver, usa a miniatura do vídeo do YouTube (sem pesar o site).
export function coverOf(p: Post) {
  if (p.data.cover) return p.data.cover;
  const id = youtubeId(p.data.youtube);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}

export function youtubeId(url?: string) {
  if (!url) return undefined;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m?.[1] ?? (/^[\w-]{11}$/.test(url) ? url : undefined);
}
