# MTH Play — como colocar o site no ar (de graça)

Tudo aqui é gratuito. Você só precisa de duas contas: **GitHub** (guarda o site) e **Cloudflare** (deixa ele online).

---

## 1. Criar o repositório no GitHub

1. Crie uma conta em https://github.com, se ainda não tiver.
2. Clique em **New repository** e use o nome `mth-play-site`. Pode deixar **Public**, que é necessário se quiser comentários.
3. **Não** marque "Add a README". Clique em **Create repository**.
4. Abra o PowerShell **dentro da pasta `MTH Play Site`** e rode (troque `SEU-USUARIO`):

```powershell
git init -b main
```
```powershell
git add .
```
```powershell
git commit -m "Primeira versão do site MTH Play"
```
```powershell
git remote add origin https://github.com/SEU-USUARIO/mth-play-site.git
```
```powershell
git push -u origin main
```

> O GitHub vai pedir login na primeira vez. É só autorizar no navegador.

## 2. Publicar no Cloudflare Pages

1. Crie uma conta em https://dash.cloudflare.com.
2. Vá em **Workers e Pages → Criar → Pages → Conectar ao Git** e escolha o repositório `mth-play-site`.
3. Configure assim:
   - **Nome do projeto:** `mthplay` (vira `mthplay.pages.dev`)
   - **Predefinição de framework:** Astro
   - **Comando de build:** `npm run build`
   - **Diretório de saída:** `dist`
4. Clique em **Salvar e implantar**. Em cerca de 2 minutos o site está no ar.

> Se o nome `mthplay` estiver ocupado, use outro. Depois troque o endereço no painel, em **Configurações → Endereço do site**,
> e nas linhas `site_url`/`display_url` de `public/admin/config.yml`.

## 3. Ativar o login do painel (/admin)

O painel usa **login com GitHub**: só entra quem tem permissão no seu repositório.

### 3a. Criar o "porteiro" do login (Worker gratuito)

1. Abra https://github.com/sveltia/sveltia-cms-auth e clique em **Deploy to Cloudflare Workers**.
2. Depois do deploy, anote o endereço, algo como `https://sveltia-cms-auth.SEU-USUARIO.workers.dev`.

### 3b. Criar o app de login no GitHub

1. Abra GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Preencha:
   - **Application name:** MTH Play Painel
   - **Homepage URL:** `https://mthplay.pages.dev`
   - **Authorization callback URL:** `https://sveltia-cms-auth.SEU-USUARIO.workers.dev/callback`
3. Clique em **Register application**, depois em **Generate a new client secret**, e copie o **Client ID** e o **Client secret**.

### 3c. Ligar os dois

1. No Cloudflare, abra o Worker `sveltia-cms-auth` e vá em **Configurações → Variáveis e segredos**. Adicione:
   - `GITHUB_CLIENT_ID` = Client ID
   - `GITHUB_CLIENT_SECRET` = Client secret (tipo **Secret**)
   - `ALLOWED_DOMAINS` = `mthplay.pages.dev`
2. No arquivo `public/admin/config.yml`, troque as duas linhas marcadas com **TROCAR**:
   - `repo: SEU-USUARIO/mth-play-site`
   - `base_url: https://sveltia-cms-auth.SEU-USUARIO.workers.dev`
3. Envie a mudança:

```powershell
git commit -am "Configura login do painel"; git push
```

Pronto: acesse `https://mthplay.pages.dev/admin/` e clique em **Entrar com GitHub**.

> **Plano B (sem Worker):** na tela do painel existe **"Entrar usando Token de Acesso"**. Crie um token em
> GitHub → Settings → Developer settings → Fine-grained tokens, dando acesso só a `mth-play-site` com permissão
> *Contents: Read and write*, e cole lá. Funciona, mas o login com GitHub é mais prático.

### Adicionar outros redatores

No repositório do GitHub, vá em **Settings → Collaborators → Add people**. Quem você adicionar consegue entrar no painel.

---

## 4. Publicar notícias no dia a dia

1. Entre em `/admin` e clique em **Nova Publicação**.
2. Preencha título, resumo, categoria e capa, e escreva o texto.
3. Clique em **Salvar**. Em cerca de 1 minuto a matéria está no ar.

Dicas:
- Use capas em **1280×720** (16:9).
- **Destaque na home** coloca a matéria no mosaico do topo. A mais recente fica com o card grande.
- **Em alta** coloca a matéria no ranking lateral.
- **Rascunho** guarda a matéria sem publicar.
- Para uma review, escolha o tipo **Review** e preencha nota, prós e contras.
- O tipo **Vídeo** com um link do YouTube vai para a seção Vídeos.
- As tags mais usadas aparecem automaticamente na barra "Em alta" do topo.
- **Agendar:** coloque uma data e hora futuras em "Data de publicação". A matéria só aparece nesse horário (precisa do passo 5a).
- **Jogo relacionado:** escolha o jogo e a matéria entra automaticamente na página dele.
- As imagens enviadas são reduzidas e comprimidas sozinhas na publicação, sem perder a qualidade visível.
- Apague os posts de exemplo (os que começam com "Exemplo"), os jogos de exemplo e o "Autor de Exemplo" quando publicar os seus.

### Outras áreas do painel
- **Jogos:** cadastre o jogo com capa, data de lançamento, plataformas e trailer. Ele ganha uma página própria (`/jogo/nome-do-jogo`) e, se tiver data, entra no **Calendário de lançamentos**. Sem data exata, preencha "Lançamento sem data exata" (ex.: `2027`).
- **Equipe:** cadastre cada redator com foto, função e bio. Depois é só escolher o autor em cada matéria.
- **Páginas:** textos de Sobre, Contato, Privacidade e Termos.
- **Configurações:** nome, logo, cores da marca, e-mail, redes sociais (as vazias somem do site), textos da caixa do YouTube e da chamada da home, frase do rodapé, **categorias/plataformas** (nome, cor da etiqueta e se aparecem no menu), quais plataformas ganham bloco na home, código do Google e comentários.

### Testar o painel no seu PC (antes de publicar)
Com o site aberto em http://localhost:4321, entre em http://localhost:4321/admin/ pelo **Chrome ou Edge**, clique em **Trabalhar com Repositório Local** e escolha a pasta `MTH Play Site`. O que você salvar aparece no site local em poucos segundos.

## 5. Ligar os extras técnicos (uma vez só, depois de publicar)

### 5a. Publicação agendada
1. No Cloudflare, abra o projeto `mthplay` e vá em **Configurações → Builds → Ganchos de implantação (Deploy hooks)**.
2. Crie um gancho com nome `agendadas` e branch `main`, e copie o link gerado.
3. No GitHub, abra o repositório e vá em **Settings → Secrets and variables → Actions → New repository secret**:
   - Nome: `CLOUDFLARE_DEPLOY_HOOK`
   - Valor: o link copiado

Pronto: a cada hora o GitHub confere se alguma matéria agendada chegou no horário e, só nesse caso, atualiza o site.

### 5b. Estatísticas de visitas (grátis, sem cookies)
No Cloudflare, abra o projeto `mthplay` → **Métricas → Web Analytics → Ativar**.

### 5c. Google (Search Console)
1. Acesse https://search.google.com/search-console e adicione o endereço do site como **Prefixo de URL**.
2. Escolha verificar pela **Tag HTML**, copie só o código dentro de `content="..."` e cole no painel, em **Configurações → Código do Google Search Console**. Salve, espere uns 2 minutos e clique em **Verificar**.
3. Em **Sitemaps**, envie: `sitemap-index.xml`.

### 5d. E-mail de contato
No painel, em **Configurações → E-mail de contato**, preencha o e-mail (ex.: `contato@mthplay.com.br`). Ele aparece nas páginas de Contato e de Privacidade. O AdSense costuma exigir um contato visível.

## 6. Extras opcionais

- **Domínio próprio** (`mthplay.com.br`, cerca de R$ 40 por ano): registre no https://registro.br, depois vá no Cloudflare Pages → **Domínios personalizados**.
  Depois troque o endereço em **Configurações → Endereço do site**. O mapa do site, os links e o robots.txt acompanham sozinhos.
- **Comentários (Giscus, grátis):** ative *Discussions* no repositório, configure em https://giscus.app/pt e cole os dados no painel, em **Configurações → Comentários**.
- **Google AdSense:** quando for aprovado, cole o código `ca-pub-...` em **Configurações → Código do Google AdSense**. Os anúncios automáticos e o arquivo `ads.txt` são ligados sozinhos.
- **Ganhar dinheiro:** quando tiver visitas constantes, peça o Google AdSense. As páginas de Privacidade, Termos e Contato, exigidas por ele, já estão prontas.

## 7. Mexer no visual (no seu PC)

```powershell
npm run dev
```

Abra http://localhost:4321. Nome, logo, cores, redes e categorias se mudam pelo painel, em **Configurações**.
