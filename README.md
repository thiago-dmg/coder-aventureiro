# Coder Aventureiro

Blog pessoal para registrar projetos, bugs resolvidos e estudos de front-end.
Construído com **Next.js 15 (App Router)**, **TypeScript**, **Tailwind**, **Prisma** e **SQLite**.

---

## ✨ Funcionalidades

**Público:**
- Home com lista dos posts publicados
- Página de detalhe por slug (`/posts/[slug]`)
- Filtro por tag (`/tags/[tag]`)
- Página "Sobre"
- Renderização de Markdown com syntax highlighting
- SEO básico (title/description/Open Graph)
- 100% responsivo

**Admin (`/admin`):**
- Login com usuário e senha
- Dashboard com lista de todos os posts (incluindo rascunhos)
- Criar, editar e excluir posts
- Salvar como rascunho ou publicar
- Editor com preview de Markdown ao vivo
- Slug gerado automaticamente a partir do título

---

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Gere um segredo para JWT:

```bash
# Linux/Mac
openssl rand -base64 32

# ou no Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Cole o resultado em `AUTH_SECRET` no `.env`.

### 3. Definir senha do admin

Gere o hash da sua senha:

```bash
npm run hash-password -- "sua-senha-forte-aqui"
```

Copie o `ADMIN_PASSWORD_HASH` retornado pro `.env`. Defina também `ADMIN_USERNAME`.

### 4. Criar o banco

```bash
npm run db:push   # cria as tabelas no SQLite
npm run db:seed   # (opcional) popula com 2 posts de exemplo
```

### 5. Rodar em dev

```bash
npm run dev
```

Acesse:
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

### 6. Build de produção

```bash
npm run build
npm start
```

### Bônus: visualizar o banco

```bash
npm run db:studio
```

Abre o Prisma Studio em http://localhost:5555 — uma interface gráfica pro banco.

---

## 📁 Estrutura de pastas

```
code-aventureiro/
├── prisma/
│   ├── schema.prisma          # modelo Post
│   └── seed.ts                # posts iniciais
├── scripts/
│   └── hash-password.ts       # gera bcrypt da senha admin
├── src/
│   ├── app/
│   │   ├── layout.tsx         # layout raiz (header/footer)
│   │   ├── page.tsx           # home — lista de posts
│   │   ├── globals.css        # tailwind + tipografia do post
│   │   ├── not-found.tsx      # página 404
│   │   ├── posts/[slug]/      # detalhe do post
│   │   ├── tags/[tag]/        # posts por tag
│   │   ├── sobre/             # página "sobre"
│   │   ├── admin/
│   │   │   ├── layout.tsx     # navbar do admin
│   │   │   ├── page.tsx       # dashboard
│   │   │   ├── login/         # tela de login
│   │   │   ├── posts/novo/    # criar post
│   │   │   └── posts/[id]/    # editar post
│   │   └── api/
│   │       ├── auth/login     # POST: gera JWT
│   │       ├── auth/logout    # POST: limpa cookie
│   │       └── posts/         # POST/PUT/DELETE
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   ├── TagBadge.tsx
│   │   ├── PostForm.tsx       # form com preview de markdown
│   │   └── MarkdownContent.tsx
│   ├── lib/
│   │   ├── prisma.ts          # singleton do Prisma Client
│   │   ├── auth.ts            # JWT + bcrypt
│   │   ├── posts.ts           # queries de leitura
│   │   └── slug.ts            # geradores e parsers
│   └── middleware.ts          # protege /admin e /api/posts
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🧠 Decisões técnicas (e por quê)

### 1. **App Router** em vez de Pages Router
O App Router é o padrão atual do Next, suporta Server Components nativos
e simplifica muita coisa (loading states, layouts aninhados, metadata API).

### 2. **JWT em cookie httpOnly** em vez de NextAuth
NextAuth é overkill para um blog com **um único admin**. JWT em cookie httpOnly
é seguro contra XSS, simples de auditar, e funciona perfeitamente para esse caso.
Se um dia houver múltiplos usuários, migre para NextAuth ou Lucia.

### 3. **Prisma + SQLite** começando local
SQLite roda em arquivo, zero setup. Quando for fazer deploy:
- Vercel + **Turso** (SQLite distribuído)
- Railway/Fly.io + **Postgres** (mude `provider` no `schema.prisma`)

### 4. **Markdown** em vez de MDX
MDX permite componentes React inline no conteúdo, mas adiciona complexidade
de build e renderização. Markdown puro com `remark-gfm` cobre 99% das
necessidades de um blog técnico (incluindo tabelas, code blocks com highlight,
checkboxes).

### 5. **Tags como string CSV**
Em vez de criar uma tabela `Tag` e uma `PostTag` (relação N:N), guardamos as tags
como string simples `"angular,signals,rxjs"`. Trade-off:
- ✅ Muito mais simples para criar/editar
- ✅ Queries mais simples
- ❌ Não dá pra fazer "renomear tag em 50 posts" facilmente
- ❌ Filtragem por tag é feita em memória (ok até ~milhares de posts)

Quando o blog ficar grande, é uma migração tranquila. **YAGNI** por enquanto.

### 6. **Server Components** por padrão
A home, página do post e tags rodam no servidor — o HTML chega pronto pro
cliente, ótimo pra SEO. Só componentes interativos (`PostForm`, `LoginPage`,
`LogoutButton`) usam `'use client'`.

### 7. **API Routes** para mutações em vez de Server Actions
Server Actions são mais "modernos" no App Router, mas API routes:
- São mais explícitas e fáceis de debugar
- Mais fáceis de testar com curl/Postman
- Padrão familiar para qualquer dev

Você pode migrar para Server Actions depois se quiser.

### 8. **Middleware** para proteger rotas
Roda **antes** da request chegar na página, valida o JWT e redireciona/bloqueia.
É a camada mais barata e segura para auth básica.

---

## 🛣️ Próximos passos sugeridos

Quando quiser evoluir o blog, na ordem de menor para maior esforço:

1. **Dark mode** com Tailwind (`dark:` + `prefers-color-scheme`)
2. **Tempo de leitura estimado** no card e na página do post
3. **RSS feed** em `/rss.xml` (Next tem suporte built-in)
4. **Sitemap** automático (App Router suporta `sitemap.ts`)
5. **OG images dinâmicos** com `next/og`
6. **Comentários** via Giscus (GitHub Discussions, sem backend)
7. **Busca** usando algo como Pagefind (estática) ou full-text do SQLite
8. **Upload de imagens** (Cloudinary, UploadThing) em vez de URL externa
9. **Migrar para Postgres + Turso** quando for pra produção
10. **Editor melhor** (TipTap, Plate) se quiser WYSIWYG

---

## 🐛 Troubleshooting

**"AUTH_SECRET não definido"** — Você esqueceu de criar o `.env`. Veja o passo 2.

**"PrismaClientInitializationError"** — Rode `npm run db:push` para criar as tabelas.

**Login retorna 401 mesmo com senha certa** — Confirme que rodou `npm run hash-password`
e copiou o hash inteiro (incluindo `$2a$12$...`) entre aspas.

**Cookies não persistem em produção** — Em produção, garanta HTTPS. O cookie é setado com
`secure: true` quando `NODE_ENV === 'production'`, e cookies seguros só funcionam em HTTPS.

**Imagens externas não aparecem** — Veja `next.config.mjs`. Já está liberado para qualquer
host HTTPS, mas pode restringir conforme seus domínios.

---

## 📝 Licença

Faça o que quiser com isso. É seu blog. 🚀
