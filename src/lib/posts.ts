/**
 * Camada de queries de posts.
 * Centralizar aqui evita repetir Prisma em vários lugares e
 * facilita trocar a fonte de dados depois (CMS, API, etc).
 */
import { prisma } from './prisma';
import { parseTags } from './slug';

export type PostListItem = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  tags: string[];
  publishedAt: Date | null;
};

function toListItem(p: {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  tags: string;
  publishedAt: Date | null;
}): PostListItem {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    summary: p.summary,
    coverImage: p.coverImage,
    tags: parseTags(p.tags),
    publishedAt: p.publishedAt,
  };
}

export async function listPublishedPosts(): Promise<PostListItem[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      coverImage: true,
      tags: true,
      publishedAt: true,
    },
  });
  return posts.map(toListItem);
}

export async function listPostsByTag(tag: string): Promise<PostListItem[]> {
  const all = await listPublishedPosts();
  const target = tag.toLowerCase();
  return all.filter((p) => p.tags.includes(target));
}

export async function getPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.published) return null;
  return { ...post, tagsArray: parseTags(post.tags) };
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { tags: true },
  });

  const counter = new Map<string, number>();
  for (const p of posts) {
    for (const t of parseTags(p.tags)) {
      counter.set(t, (counter.get(t) ?? 0) + 1);
    }
  }
  return Array.from(counter.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/** Para o admin: lista tudo, inclusive rascunhos. */
export async function listAllPostsForAdmin() {
  return prisma.post.findMany({
    orderBy: [{ updatedAt: 'desc' }],
  });
}

export type AdminPostRow = Awaited<ReturnType<typeof prisma.post.findMany>>[number];

export type PagedAdminPosts = {
  items: AdminPostRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  q: string;
};

/**
 * Versão paginada da listagem do admin, com busca opcional.
 *
 * `q` filtra por título, slug ou tags (CSV). Usa `contains` do Prisma
 * que no SQLite vira LIKE — case-insensitive pra ASCII, que cobre
 * 99% dos casos do blog (tags e slugs sempre lowercase ASCII).
 *
 * Inclui rascunhos (sem filtro `published`) — é o painel admin.
 */
export async function listAllPostsForAdminPaged(opts: {
  page: number;
  perPage: number;
  q?: string;
}): Promise<PagedAdminPosts> {
  const perPage = Math.max(1, Math.min(50, opts.perPage));
  const page = Math.max(1, opts.page);
  const skip = (page - 1) * perPage;
  const q = (opts.q ?? '').trim();

  const where = q
    ? {
        OR: [
          { title: { contains: q } },
          { slug: { contains: q } },
          { tags: { contains: q } },
        ],
      }
    : {};

  const [total, items] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take: perPage,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return { items, total, page, perPage, totalPages, q };
}

export type PagedPosts = {
  items: PostListItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/**
 * Versão paginada da listagem pública.
 * O Prisma faz `take` e `skip` direto no SQL, evitando carregar tudo em memória.
 */
export async function listPublishedPostsPaged(opts: {
  page: number;
  perPage: number;
}): Promise<PagedPosts> {
  const perPage = Math.max(1, Math.min(50, opts.perPage));
  const page = Math.max(1, opts.page);
  const skip = (page - 1) * perPage;

  const where = { published: true };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        coverImage: true,
        tags: true,
        publishedAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    items: posts.map(toListItem),
    total,
    page,
    perPage,
    totalPages,
  };
}
