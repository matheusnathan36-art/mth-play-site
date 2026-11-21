import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { TYPES } from './data/site';

const typeSlugs = TYPES.map((t) => t.slug) as [string, ...string[]];

// Campos opcionais aceitam vazio/null porque o painel pode salvar campos em branco.
const optStr = z.string().nullish().transform((v) => (v ? v : undefined));
const optList = z
  .array(z.string())
  .nullish()
  .transform((v) => (v ?? []).filter(Boolean));
const optDate = z
  .union([z.coerce.date(), z.literal('')])
  .nullish()
  .transform((v) => (v instanceof Date && !isNaN(v.getTime()) ? v : undefined));

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: optDate,
    category: z.string().nullish().transform((v) => v || 'geral'),
    type: z.enum(typeSlugs).default('noticia'),
    cover: optStr,
    coverAlt: optStr,
    author: optStr, // slug do autor (ou nome, em posts antigos)
    jogo: optStr, // slug do jogo relacionado
    tags: optList,
    featured: z.boolean().nullish().transform((v) => !!v),
    trending: z.boolean().nullish().transform((v) => !!v),
    draft: z.boolean().nullish().transform((v) => !!v),
    youtube: optStr,
    // Campos de review
    game: optStr,
    platform: optStr,
    score: z.coerce.number().min(0).max(10).nullish(),
    pros: optList,
    cons: optList,
  }),
});

// Páginas de jogo (também alimentam o Calendário de lançamentos).
const jogos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/jogos' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cover: optStr,
    releaseDate: optDate,
    releaseText: optStr, // ex.: "2027" ou "A definir", quando não há data exata
    platforms: optList,
    developer: optStr,
    publisher: optStr,
    genres: optList,
    trailer: optStr,
    aliases: optList, // outros nomes/tags que contam como este jogo
    featured: z.boolean().nullish().transform((v) => !!v),
  }),
});

const autores = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/autores' }),
  schema: z.object({
    name: z.string(),
    role: optStr,
    avatar: optStr,
    instagram: optStr,
    youtube: optStr,
    twitter: optStr,
    order: z.coerce.number().nullish(),
  }),
});

// Páginas institucionais (Sobre, Contato, Privacidade, Termos), editáveis no painel.
const paginas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/paginas' }),
  schema: z.object({
    title: z.string(),
    description: optStr,
    intro: optStr,
    updated: optStr,
  }),
});

export const collections = { noticias, jogos, autores, paginas };
