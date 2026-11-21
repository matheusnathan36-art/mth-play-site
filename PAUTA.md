# Pauta automática do MTH Play

Guia para a rotina automática que publica **1 matéria por execução** (todo dia às 9h e às 18h, horário de Brasília). Siga tudo à risca: a matéria vai **direto para o ar**, sem revisão humana.

## 1. Preparar

```bash
git pull --rebase origin main
npm ci
TZ=America/Sao_Paulo date "+%Y-%m-%dT%H:%M:%S-03:00"   # data/hora para o campo date
ls src/content/noticias src/content/jogos
```

Leia 2 matérias recentes em `src/content/noticias/` para copiar o **tom e o formato**. Bons modelos: `ps5-passa-100-milhoes.md` e `black-friday-2026-games.md`.

Liste os títulos das últimas 30 matérias, ordenadas pelo `date:` do frontmatter. O objetivo é **não repetir assunto**: uma atualização real de um assunto já coberto pode virar matéria nova, mas a mesma notícia não.

## 2. Escolher a pauta

- Pesquise na web as notícias de games **das últimas 24–48 horas**. Priorize o que é mais relevante para o público brasileiro:
  - grandes lançamentos, anúncios, adiamentos e trailers;
  - PlayStation, Xbox, Nintendo e PC;
  - promoções e jogos grátis;
  - PS Plus e Game Pass;
  - eSports com times brasileiros (FURIA, LOUD, paiN, MIBR…);
  - GTA VI enquanto estiver em alta.
- Escolha **1 notícia** que ainda não esteja no site.
- **Só fatos confirmados**, de preferência em 2 fontes confiáveis:
  - oficiais: PlayStation Blog, Xbox Wire, Nintendo, sites das publicadoras;
  - imprensa: IGN, GameSpot, Eurogamer, VGC, The Verge, Game Informer;
  - brasileiros: TecMundo, The Enemy, Omelete, MeuPlayStation.
- **Boato não é fato:** se for rumor, só publique se for muito relevante e deixe claro no título e no texto que é rumor.

## 3. Imagem (OBRIGATÓRIA, nunca publique sem)

### Opção A (preferida): imagem do vídeo oficial no YouTube

1. Encontre um vídeo **oficial** ligado à notícia, do canal da publicadora, da desenvolvedora, da plataforma (PlayStation, Xbox, Nintendo) ou do organizador do evento. Nunca use IGN, GameSpot, reuploads ou canais de fãs.
2. Confira o canal e o título:
   ```bash
   curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json"
   ```
   O `author_name` precisa ser o canal oficial.
3. Baixe a imagem em HD. Se o arquivo vier com menos de 5 KB, tente `sddefault` e depois `hqdefault`:
   ```bash
   curl -sfo public/uploads/yt-VIDEO_ID.jpg https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg
   ```
4. No frontmatter, use `cover: /uploads/yt-VIDEO_ID.jpg` e `youtube: https://www.youtube.com/watch?v=VIDEO_ID`.

### Opção B: capa com a identidade MTH Play

Use quando não houver vídeo oficial. Crie um arquivo JSON e rode o gerador:

```bash
echo '[{"arquivo":"NOME-DA-MATERIA.jpg","titulo":"Tema curto","etiqueta":"PlayStation","cor":"#3b82f6"}]' > /tmp/capa.json
node scripts/gerar-capa.mjs /tmp/capa.json
```

- **Cores por categoria:**
  - playstation `#3b82f6`
  - xbox `#22c55e`
  - nintendo `#ef4444`
  - pc `#06b6d4`
  - mobile `#f59e0b`
  - esports `#a855f7`
  - lancamentos `#ec4899`
  - geral `#64748b`
- No frontmatter, use `cover: /uploads/NOME-DA-MATERIA.jpg`.

**Nunca** baixe fotos de sites de notícias, porque têm direitos autorais.

## 4. Escrever a matéria

Crie `src/content/noticias/SLUG.md`. O slug deve ser curto, em minúsculas, com hífen e sem acento.

```yaml
---
title: "Título claro e chamativo, sem clickbait mentiroso"
description: "Resumo de 1 a 2 frases (aparece no card e no Google)."
date: 2026-11-22T09:00:00-03:00
type: noticia            # noticia | guia | lista  (NUNCA review)
category: playstation    # playstation | xbox | nintendo | pc | mobile | esports | lancamentos | geral
author: equipe-mth-play
cover: /uploads/...
youtube: https://www.youtube.com/watch?v=...   # só se tiver vídeo oficial
jogo: slug-do-jogo       # só se existir em src/content/jogos
tags: ["Nome do Jogo", "Plataforma"]
trending: true           # só se for notícia muito quente
---
```

**Regras do texto:**

- **Idioma e tom:** português do Brasil, linguagem de site gamer, direta e animada, sem exagero.
- **Tamanho:** de 250 a 500 palavras.
- **Estrutura:** um parágrafo de abertura com o essencial, subtítulos `##`, listas com os números e as datas, e um fechamento.
- **Originalidade:** escreva **com suas palavras**. Não copie frases das fontes; citação direta só curta e entre aspas.
- **Datas:** formato brasileiro (21 de novembro, 10/12). Mantenha os preços em dólar ou real como na fonte.
- **Links internos:** quando fizer sentido, aponte para matérias e páginas de jogo do site, como `[calendário de lançamentos](/lancamentos/)` e `/jogo/slug/`.
- **Fontes:** termine com `*Fontes: [Nome](url), [Nome](url).*`
- **Sem nota:** **NUNCA** escreva review com nota nem opinião de "jogamos" sobre jogo que ninguém do MTH Play jogou.
- **Tags:** use o nome do jogo como tag. As matérias com essa tag aparecem na página do jogo.

**Calendário de lançamentos:**

- Se a notícia mudar a data de um jogo que já está em `src/content/jogos/`, atualize o `releaseDate` (ou o `releaseText`) desse arquivo.
- Se for o anúncio de um jogo grande com data, crie o arquivo do jogo seguindo os existentes.

**Destaques da home:**

- **Não mexa** em `pinned` nem em `featured` de outras matérias.
- Use `featured: true` só em notícia realmente grande.

## 5. Conferir e publicar

```bash
npm run build          # TEM que terminar sem erro
git add src/content public/uploads
git commit -m "Notícia: TÍTULO" -m "Publicado pela pauta automática."
git push origin main   # se rejeitar: git pull --rebase origin main && git push origin main
```

Só envie arquivos da matéria nova, da imagem dela e, se for o caso, do jogo atualizado. **Não altere** código, layout, configurações (`src/data/settings.json`), `public/admin/` nem este arquivo.

Se algo der errado, como build quebrado, nenhuma notícia nova relevante ou falta de imagem possível, **não publique nada** e explique o motivo no resumo final.
