---
title: "Como subi este blog do zero — Next.js 15, VPS, systemd, nginx e Let's Encrypt"
slug: como-subi-este-blog-nextjs-vps
excerpt: "A saga (bem-humorada e didática) de tirar um Next.js 15 do localhost e colocar no ar com domínio próprio, HTTPS e CI/CD pelo GitHub Actions. Inclui o bug do `$` que me fez perder uma hora."
publishedAt: 2026-04-27
tags: [nextjs, vps, devops, systemd, nginx, cicd]
---

## Por que esse post existe

Eu queria publicar este blog em um domínio próprio (`coderaventureiro.com.br`) rodando na minha VPS da Hostinger. Já tinha experiência fazendo deploy de API .NET no mesmo servidor, mas o **Next.js tem suas manhas** — e no meio do caminho topei com um bug tão peculiar que valeu virar post.

Aviso: eu mesmo me perdi em alguns pontos enquanto fazia, então aqui está a versão didática, do jeito que eu queria ter encontrado pronta antes de começar.

---

## A foto final da arquitetura

Antes de qualquer comando, é importante visualizar pra onde a gente está indo:

```
                        Internet
                           │
                           ▼
                  ┌─────────────────┐
                  │   DNS HostGator │   (A record → IP da VPS)
                  └────────┬────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   VPS Hostinger (Ubuntu 22.04)       │
        │                                      │
        │   nginx :443 (HTTPS)                 │
        │      │                               │
        │      └──► Next.js :3003 (systemd)    │
        │              │                       │
        │              └──► SQLite             │
        │                  (shared/dev.db)     │
        └──────────────────────────────────────┘
                           ▲
                           │
                  ┌────────┴────────┐
                  │  GitHub Actions │   (deploy a cada push em main)
                  └─────────────────┘
```

Cada `git push` na branch `main` dispara o GitHub Actions, que builda o projeto, empacota tudo, manda pra VPS via SSH, troca um symlink e reinicia o serviço. Se algo quebrar, eu volto pro release anterior só trocando o symlink. Capistrano-style.

---

## O que eu já tinha

- VPS Hostinger Ubuntu 22.04 com Node 20, nginx, certbot, postgresql instalados
- Domínio `coderaventureiro.com.br` registrado na HostGator
- Outros projetos rodando na mesma VPS (uma API .NET e outro Next.js)
- O blog rodando em `localhost:3000`

---

## Passo 1 — DNS

No painel da HostGator, criei dois A records:

```
coderaventureiro.com.br        →  IP-DA-MINHA-VPS
www.coderaventureiro.com.br    →  IP-DA-MINHA-VPS
```

Esperei propagar (uns 5 minutos no meu caso) e conferi:

```bash
dig coderaventureiro.com.br +short
```

Quando o IP da VPS aparece nessa saída, o DNS resolveu. Pode seguir.

---

## Passo 2 — Estrutura de pastas na VPS

Adotei o padrão "Capistrano-style", que separa três coisas:

```
/var/www/coder-aventureiro/
├── current → releases/<commit-sha>     (symlink — sempre aponta pro release ativo)
├── releases/
│   ├── abc123.../                      (deploy de hoje)
│   ├── def456.../                      (deploy de ontem)
│   └── ghi789.../                      (deploy anterior — mantenho só 3)
└── shared/
    ├── .env                            (variáveis de produção, nunca trocadas)
    └── prisma/
        └── dev.db                      (banco SQLite — persistente entre deploys)
```

**Por que separar `releases/` de `shared/`?**

- Cada deploy é uma pasta nova: dá pra olhar exatamente o que foi enviado
- Trocar `current` é uma operação atômica: o symlink aponta pro novo, restart do serviço, pronto
- Rollback é só `ln -sfn releases/<sha-anterior> current && systemctl restart` — segundos
- Banco SQLite e variáveis sensíveis ficam **fora** dos releases, então não somem em rollback

```bash
sudo mkdir -p /var/www/coder-aventureiro/{releases,shared/prisma}
```

---

## Passo 3 — O arquivo `shared/.env`

```ini
DATABASE_URL=file:/var/www/coder-aventureiro/shared/prisma/dev.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$KTko... (60 caracteres, gerado com bcryptjs)
AUTH_SECRET=GAriaLIh... (openssl rand -base64 32)
NEXT_PUBLIC_SITE_URL=https://coderaventureiro.com.br
NEXT_PUBLIC_SITE_NAME=Coder Aventureiro
```

Algumas regras importantes pro arquivo lido pelo `EnvironmentFile=` do systemd:

- **Sem aspas** ao redor dos valores
- **Sem barras invertidas** escapando coisas
- O `$` é literal nesse contexto (mas guarda esse detalhe na cabeça — vamos voltar nele no final do post)

Pra gerar o hash da senha:

```bash
node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('SUA_SENHA_AQUI', 12));
"
```

Pra gerar o `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Permissões:

```bash
sudo chmod 600 /var/www/coder-aventureiro/shared/.env
```

---

## Passo 4 — Serviço systemd

Coloquei o app rodando como serviço gerenciado pelo systemd. Assim ele sobe sozinho no boot, reinicia se cair, e os logs vão pro `journalctl`.

`/etc/systemd/system/coderaventureiro.service`:

```ini
[Unit]
Description=Coder Aventureiro (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/coder-aventureiro/current
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
KillSignal=SIGINT
SyslogIdentifier=coderaventureiro
Environment=NODE_ENV=production
Environment=PORT=3003
Environment=HOSTNAME=127.0.0.1
EnvironmentFile=/var/www/coder-aventureiro/shared/.env

[Install]
WantedBy=multi-user.target
```

Pontos importantes:

- `WorkingDirectory` aponta pro symlink `current` — o systemd resolve toda vez
- `PORT=3003` é o que o Next.js escuta. Outros projetos da VPS usam outras portas (`3001`, `3002`...)
- `HOSTNAME=127.0.0.1` faz o Next.js escutar só em loopback. **O nginx é quem expõe pro mundo**, isso é mais seguro
- `EnvironmentFile=` injeta o `shared/.env` no processo

```bash
sudo systemctl daemon-reload
sudo systemctl enable coderaventureiro
sudo systemctl start coderaventureiro
sudo systemctl status coderaventureiro
```

Se aparecer `active (running)`, beleza. Se não, `journalctl -u coderaventureiro -n 50` mostra o que deu errado.

---

## Passo 5 — nginx como proxy reverso

O Next.js está em `127.0.0.1:3003`, fechado pro mundo externo. Quem recebe requisições da internet é o nginx, em `:80` e `:443`, e encaminha pro Next.

`/etc/nginx/sites-available/coderaventureiro.com.br`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name coderaventureiro.com.br www.coderaventureiro.com.br;

    client_max_body_size 10M;
    access_log /var/log/nginx/coderaventureiro.access.log;
    error_log  /var/log/nginx/coderaventureiro.error.log;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

Ativa, testa e recarrega:

```bash
sudo ln -s /etc/nginx/sites-available/coderaventureiro.com.br \
           /etc/nginx/sites-enabled/coderaventureiro.com.br
sudo nginx -t
sudo systemctl reload nginx
```

> **Pegadinha clássica que me pegou**: depois do `nginx -t` dar OK, eu esqueci o `reload` e fiquei achando que o vhost não estava ativo. Sem o reload, o nginx ainda está usando a config antiga. Não esqueça.

Nesse ponto, abrindo `http://coderaventureiro.com.br` no navegador, o site já aparece (sem cadeado ainda).

---

## Passo 6 — HTTPS com Let's Encrypt

O certbot automatiza tudo: pede o certificado, edita o nginx pra adicionar a config SSL e configura redirect 80→443.

```bash
sudo certbot --nginx -d coderaventureiro.com.br -d www.coderaventureiro.com.br
```

O certbot pergunta o e-mail (pra avisos de expiração) e aceitação dos termos. No final, ele edita o `/etc/nginx/sites-available/coderaventureiro.com.br` pra incluir os blocos `listen 443 ssl`, `ssl_certificate`, `ssl_certificate_key` e o redirect.

Renovação? Já vem agendada num timer do systemd (`certbot.timer`). Sem trabalho extra.

```bash
sudo systemctl status certbot.timer
```

---

## Passo 7 — CI/CD com GitHub Actions

Aqui o pulo do gato. Cada `git push` na branch `main` deve:

1. Fazer o build no runner do GitHub
2. Empacotar só o necessário (`.next`, `public`, `prisma`, `package.json`, `package-lock.json`...)
3. Mandar via SCP pra `/tmp/deploy-<run-id>` na VPS
4. Via SSH: extrair pra `releases/<sha>/`, instalar dependências, aplicar schema, atualizar symlink `current`, reiniciar serviço, fazer health check
5. Limpar releases antigos

`.github/workflows/deploy.yml`:

```yaml
name: Deploy Coder Aventureiro to VPS

on:
  push:
    branches: ["main"]
  workflow_dispatch:

env:
  SERVICE_NAME: coderaventureiro
  REMOTE_DIR: /var/www/coder-aventureiro
  APP_PORT: 3003
  NODE_VERSION: 20.x

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm

      - name: Install dependencies
        run: npm ci
        env:
          DATABASE_URL: "file:./build.db"

      - name: Build Next.js
        env:
          NEXT_PUBLIC_SITE_URL: https://coderaventureiro.com.br
          NEXT_PUBLIC_SITE_NAME: Coder Aventureiro
          DATABASE_URL: "file:./build.db"
          AUTH_SECRET: "build-time-placeholder"
          ADMIN_USERNAME: "admin"
          ADMIN_PASSWORD_HASH: "build-time-placeholder"
        run: npm run build

      - name: Package artifact
        run: |
          tar -czf coderaventureiro.tar.gz \
            .next public prisma scripts \
            package.json package-lock.json \
            next.config.mjs tsconfig.json

      # ... (etapas de SCP e SSH com o script de deploy na VPS)
```

Algumas observações sobre o build:

- As variáveis `NEXT_PUBLIC_*` são **embutidas no bundle** no momento do build. Por isso entram no GitHub Actions
- As outras (`AUTH_SECRET`, `ADMIN_PASSWORD_HASH`...) são lidas em runtime pelo systemd. No build, valem placeholders só pra o Next.js não reclamar
- `DATABASE_URL` precisa de algum valor durante o build porque o `prisma generate` reclama caso esteja vazio

O script SSH na VPS faz o trabalho duro:

```bash
# Estrutura
sudo mkdir -p $REMOTE_DIR/releases
RELEASE_DIR=$REMOTE_DIR/releases/$COMMIT
sudo mkdir -p $RELEASE_DIR

# Extrai
sudo tar -xzf $TAR -C $RELEASE_DIR

# Dependências e Prisma
cd $RELEASE_DIR
sudo npm ci
sudo npx prisma db push --skip-generate

# Atualiza symlink atomicamente
sudo ln -sfn $RELEASE_DIR $REMOTE_DIR/current

# Reinicia serviço
sudo cp $RUN_DIR/coderaventureiro.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart coderaventureiro

# Limpa releases antigos (mantém os 3 mais recentes)
cd $REMOTE_DIR/releases
ls -t | tail -n +4 | xargs -r sudo rm -rf

# Health check
curl -fsS http://127.0.0.1:$APP_PORT/ || exit 1
```

E na configuração do GitHub: três secrets em `Settings → Secrets and variables → Actions`:

- `VPS_SSH_HOST` — IP da VPS
- `VPS_SSH_USER` — `root` (ou outro usuário com sudo NOPASSWD)
- `VPS_SSH_KEY` — chave privada SSH (gerei com `ssh-keygen -t ed25519` e adicionei a pública em `~/.ssh/authorized_keys` na VPS)

---

## Tropeços do caminho (pra você economizar tempo)

### 1. Conflito de dynamic routes no Next 15

O Next 15 não permite `[id]` e `[slug]` no mesmo nível dentro do `app/`. Eu tinha:

```
app/api/posts/[id]/route.ts        # admin (PUT/DELETE)
app/api/posts/[slug]/like/route.ts # público
```

Erro: `You cannot use different slug names for the same dynamic path`. Solução: separar admin em `/api/admin/posts/[id]/`.

### 2. `useSearchParams` exigindo Suspense

No build de produção, o Next 15 reclama:

```
useSearchParams() should be wrapped in a suspense boundary
```

Wrap:

```tsx
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />   {/* o useSearchParams() vive aqui dentro */}
    </Suspense>
  );
}
```

### 3. Pasta `public/` vazia + git + tar

Eu não tinha asset nenhum em `public/`, então o git nem trackeou a pasta. No CI, o `tar` reclamava:

```
tar: public: Cannot stat: No such file or directory
```

Solução: criar `public/.gitkeep` vazio.

---

## O bug bizarro: o login que não logava

Esse merece seção própria porque me custou uma hora.

**Sintoma**: site no ar, tudo certo, mas tentar logar com usuário+senha corretos retornava `401 — Usuário ou senha incorretos.`

**Investigação**:

1. Conferi o hash bcrypt no `.env` da VPS — está lá, 60 caracteres
2. Rodei `bcrypt.compareSync('senha', hash)` direto na VPS — retorna `true`
3. Conferi como a env chegou no processo:

```bash
PID=$(pgrep -f "next-server" | head -1)
sudo cat /proc/$PID/environ | tr '\0' '\n' | grep ADMIN
# ADMIN_PASSWORD_HASH=$2b$12$KTko... (íntegro, 60 chars)
```

4. Bati direto na API local:

```bash
curl -X POST http://127.0.0.1:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha-correta"}'
# 401: Usuário ou senha incorretos.
```

Hash bate, env chega no processo, mas o app rejeita. Como assim?

**Causa raiz**: o `@next/env` (loader de variáveis de ambiente do Next.js) usa o **`dotenv-expand`** internamente. Se o Next.js encontra um arquivo `.env` no diretório do projeto, ele lê e processa esse arquivo — interpretando `$VAR` como **referência de variável**.

Meu `deploy.yml` criava um symlink `.env` apontando pro `shared/.env`:

```bash
sudo ln -sfn $REMOTE_DIR/shared/.env $RELEASE_DIR/.env  # ❌ veneno
```

Quando o Next.js bootava, ele:

1. Recebia do systemd: `ADMIN_PASSWORD_HASH=$2b$12$KTko...` (correto)
2. Achava o `.env` no diretório, abria
3. O `dotenv-expand` lia a linha e interpretava `$2b$12$KTko...` como **três variáveis vazias** concatenadas
4. **Sobrescrevia** o `process.env.ADMIN_PASSWORD_HASH` com a string corrompida
5. `bcrypt.compare(senha, hash-corrompido)` retornava false → login negado

Por isso `cat /proc/$PID/environ` mostrava o valor certo (visão do kernel), mas dentro do código Node `process.env.ADMIN_PASSWORD_HASH` estava diferente.

**Correção**: tirar o symlink. As envs já vinham via systemd `EnvironmentFile`, ter um `.env` no diretório era redundante e tóxico.

```bash
sudo rm /var/www/coder-aventureiro/current/.env
sudo systemctl restart coderaventureiro
```

Login funcionou na hora. E removi a linha do `deploy.yml` pra não voltar.

---

## Lições que vou levar pros próximos deploys

Quando systemd está injetando env via `EnvironmentFile`, **não pode existir um `.env` físico no diretório do app Next.js**. Ou um, ou outro — mas nunca os dois lendo o mesmo arquivo.

O `dotenv-expand` é traiçoeiro com qualquer string que tenha `$` no meio (hashes bcrypt, JWTs, senhas geradas, etc.). Se precisar mesmo de um `.env` no diretório, escapa todos os `$` como `\$`.

`/proc/$PID/environ` mostra a env do processo no momento em que ele foi criado pelo kernel. Se o app modificar `process.env` em runtime (e o Next.js faz isso via `@next/env`), os dois valores divergem. Logar o valor exato dentro do código é mais confiável que olhar o `/proc`.

A estrutura `current → releases/<sha>` + `shared/` é simples, atômica e bem mais resiliente que ficar `git pull` na VPS. Recomendo demais.

---

## Próximos passos do projeto

- Migrar de SQLite pra Postgres (já tenho rodando na mesma VPS)
- Backup automatizado do banco com cron + scp pra storage externo
- Monitoramento externo (UptimeRobot ou Healthchecks.io) batendo numa rota `/health`
- Centralizar logs (Loki ou similar) ao invés de só `journalctl`

Mas isso fica pros próximos posts. Por enquanto, o blog está no ar, com cadeado verde, e cada `git push` em `main` chega aqui em ~2 minutos. Missão cumprida.
