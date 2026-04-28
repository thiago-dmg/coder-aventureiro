/**
 * Seed do banco - popula com ~30 posts variados pra exercitar paginacao,
 * filtro por tag e UI em geral.
 *
 * Rodar com: npm run db:seed
 *
 * O seed e idempotente (usa upsert por slug), entao pode rodar varias vezes
 * sem duplicar conteudo. Posts ja existentes nao sao modificados.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedPost = {
  title: string;
  slug: string;
  summary: string;
  /** Markdown curto. Pra paginacao, o que importa eh existir conteudo. */
  content: string;
  tags: string;
  coverImage?: string;
  /** Quantos dias atras esse post foi publicado. */
  daysAgo: number;
};

const COVER_IMAGES: Record<string, string> = {
  angular: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1200&h=600&fit=crop',
  rxjs: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop',
  typescript: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop',
  css: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1200&h=600&fit=crop',
  tailwind: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=600&fit=crop',
  devops: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&h=600&fit=crop',
  nextjs: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
  react: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=600&fit=crop',
  javascript: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=1200&h=600&fit=crop',
  git: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&h=600&fit=crop',
  carreira: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&h=600&fit=crop',
  fundamentos: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop',
};

function pickCover(tags: string): string | undefined {
  for (const tag of tags.split(',').map((t) => t.trim())) {
    if (COVER_IMAGES[tag]) return COVER_IMAGES[tag];
  }
  return undefined;
}

function p(
  title: string,
  slug: string,
  summary: string,
  tags: string,
  daysAgo: number,
  body?: string,
): SeedPost {
  return {
    title,
    slug,
    summary,
    tags,
    daysAgo,
    content:
      body ||
      '# ' + title + '\n\n' + summary + '\n\n' +
        'Esse post ainda esta em rascunho expandido. ' +
        'Em breve mais detalhes aqui.\n',
  };
}

const SEED_POSTS: SeedPost[] = [
  p('Bem-vindo ao Coder Aventureiro', 'bem-vindo-ao-coder-aventureiro',
    'Primeiro post do blog. Por que criei esse espaco e o que esperar daqui.',
    'meta,intro', 0,
    '# Ola, mundo\n\nEsse e o primeiro post do **Coder Aventureiro**, meu espaco para registrar a jornada como dev front-end.\n'),

  p('Como eu estudei Signals no Angular', 'como-eu-estudei-signals-no-angular',
    'Minha trilha pessoal pra entender signals, computed e effect, sem decoreba.',
    'angular,signals,estudos', 2),

  p('Standalone Components: enfim, sem NgModule', 'standalone-components-sem-ngmodule',
    'Por que migrar tudo pra standalone e o que mudou no dia a dia.',
    'angular,arquitetura', 5),

  p('RxJS: switchMap vs mergeMap vs concatMap vs exhaustMap', 'rxjs-switchmap-mergemap-concatmap-exhaustmap',
    'A confusao classica desses 4 operadores explicada com casos reais.',
    'angular,rxjs', 8),

  p('Por que adotei TypeScript strict mode', 'typescript-strict-mode',
    'A diferenca entre confiar no compilador e ficar cacando bug em runtime.',
    'typescript,boas-praticas', 11),

  p('Tailwind: parando de fugir e abracando', 'tailwind-parando-de-fugir',
    'Resisti ao Tailwind por anos. Esse post e o "ai, voces tinham razao".',
    'css,tailwind', 14),

  p('O dia em que o npm install levou 40 minutos', 'npm-install-40-minutos',
    'Historia do bug mais frustrante: instalacao travando por causa de DNS.',
    'devops,debug', 17),

  p('Estruturas de dados que todo dev front-end deveria saber', 'estruturas-de-dados-front-end',
    'Map, Set, Stack, Queue, quando trocar por elas mudou meu codigo.',
    'fundamentos,algoritmos', 20),

  p('Como funciona a Event Loop do JS de verdade', 'event-loop-javascript',
    'Microtasks, macrotasks, e por que setTimeout(0) nao e instantaneo.',
    'javascript,fundamentos', 23),

  p('Git rebase interativo: o canivete suico do historico', 'git-rebase-interativo',
    'squash, fixup, reorder, edit, o comando que aprendi tarde demais.',
    'git,produtividade', 26),

  p('Acessibilidade no front: 5 mudancas com impacto enorme', 'acessibilidade-front-end',
    'O basico que quase ninguem faz e que melhora muito a experiencia.',
    'acessibilidade,boas-praticas', 30),

  p('Por que a internet anda mais lenta do que devia', 'web-performance-bundles',
    'Bundles de 5MB, fontes pesadas, hidratacao cara. Como olhar pra isso.',
    'performance,web', 33),

  p('Server Components: a virada de chave do Next 13+', 'server-components-next',
    'O que muda quando o "default" e renderizar no servidor.',
    'nextjs,react,arquitetura', 36),

  p('NgRx: quando vale a pena e quando e overkill', 'ngrx-quando-vale-a-pena',
    'Criterios honestos pra decidir se seu projeto precisa de Redux/NgRx.',
    'angular,ngrx,arquitetura', 39),

  p('Docker pra dev front-end: o minimo necessario', 'docker-dev-front-end',
    'Sem virar especialista, so o essencial pra ter ambiente reprodutivel.',
    'devops,docker', 42),

  p('Por que parei de usar moment.js', 'parei-de-usar-moment-js',
    'Moment e deprecated. Date-fns ou Day.js entregam o mesmo com 1/10 do tamanho.',
    'javascript,bibliotecas', 45),

  p('Tipagem generica em TypeScript: do basico ao avancado', 'genericos-typescript',
    'Generics deixaram de me assustar quando entendi o "extends".',
    'typescript,fundamentos', 48),

  p('CSS Grid: parando de quebrar a cabeca com layouts', 'css-grid-na-pratica',
    'Layouts que demoravam horas com flex viraram 5 linhas com grid.',
    'css,layout', 51),

  p('Code review: o que aprendi revisando 500 PRs', 'code-review-500-prs',
    'Padroes que vejo se repetindo, e o que vale comentar ou deixar passar.',
    'carreira,boas-praticas', 54),

  p('Web Components: a alternativa que ninguem usa', 'web-components-alternativa',
    'Custom Elements + Shadow DOM ja existem ha anos. Por que ainda raros?',
    'web,padroes', 57),

  p('Nginx como proxy reverso: o setup que uso em todo projeto', 'nginx-proxy-reverso',
    'Template de config que copio em todo deploy de Node em VPS.',
    'devops,nginx', 60),

  p('A regra dos 80% no setState do React', 'regra-80-setstate-react',
    'Quando estado deve ficar no componente, e quando vira contexto/store.',
    'react,arquitetura', 63),

  p('systemd para devs: roda sua app como servico', 'systemd-para-devs',
    'Auto-restart, logs centralizados, boot automatico, tudo de graca.',
    'devops,linux', 66),

  p('CI/CD com GitHub Actions: o primeiro deploy', 'ci-cd-github-actions-primeiro-deploy',
    'Workflow minimo pra subir uma app Node em VPS via SSH.',
    'devops,ci-cd', 69),

  p('Markdown no front: react-markdown + plugins', 'markdown-no-front-react',
    'Como renderizar markdown com syntax highlight e tabelas sem MDX.',
    'react,nextjs', 72),

  p('O bug do dotenv-expand que me custou uma hora', 'bug-dotenv-expand-symlink-env',
    'Hash bcrypt no .env, systemd injetando certo, e mesmo assim login negado.',
    'nextjs,debug,devops', 1),

  p('Prisma vs TypeORM: por que escolhi Prisma', 'prisma-vs-typeorm',
    'DX, tipagem, migrations, comparativo honesto entre dois grandes ORMs.',
    'prisma,typescript,backend', 75),

  p('Por que Server Actions ainda nao me convenceram', 'server-actions-nao-me-convenceram',
    'Hot take: API routes ainda sao mais explicitas e faceis de debugar.',
    'nextjs,opiniao', 78),

  p('Imposter syndrome: o que aprendi convivendo com isso', 'imposter-syndrome-na-pratica',
    'Nao e fase. Nao passa. Mas da pra trabalhar com isso de bem.',
    'carreira,saude-mental', 81),

  p('A receita do meu .gitconfig', 'meu-gitconfig',
    'Aliases que economizam horas por mes. Cole ai no seu tambem.',
    'git,produtividade', 84),
];

async function main() {
  for (const post of SEED_POSTS) {
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - post.daysAgo);

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        tags: post.tags,
        coverImage: post.coverImage ?? pickCover(post.tags),
        published: true,
        publishedAt,
      },
    });
  }

  console.log('Seed concluido. ' + SEED_POSTS.length + ' posts no banco.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
