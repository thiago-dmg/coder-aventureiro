/**
 * Seed inicial — popula o banco com 2 posts de exemplo.
 * Rodar com: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.post.upsert({
    where: { slug: 'bem-vindo-ao-code-aventureiro' },
    update: {},
    create: {
      title: 'Bem-vindo ao Code Aventureiro',
      slug: 'bem-vindo-ao-code-aventureiro',
      summary: 'Primeiro post do blog. Por que criei esse espaço e o que esperar daqui.',
      content: `# Olá, mundo

Esse é o primeiro post do **Code Aventureiro**, meu espaço para registrar a jornada como dev front-end.

Aqui vou compartilhar:

- Projetos que estou construindo
- Bugs que resolvi (e como)
- Conceitos que aprendi de novo (várias vezes)
- Ferramentas que valem a pena

> "A melhor forma de fixar algo é ensinar."

\`\`\`ts
const dev = { name: 'Thiago', stack: ['Angular', 'Next.js', 'TypeScript'] };
console.log(\`Bora codar, \${dev.name}!\`);
\`\`\`
`,
      tags: 'meta,intro',
      published: true,
      publishedAt: new Date(),
    },
  });

  await prisma.post.upsert({
    where: { slug: 'como-eu-estudei-signals-no-angular' },
    update: {},
    create: {
      title: 'Como eu estudei Signals no Angular',
      slug: 'como-eu-estudei-signals-no-angular',
      summary: 'Minha trilha pessoal pra entender signals, computed e effect — sem decoreba.',
      content: `# Signals: o que mudou minha cabeça

Quando o Angular 16 introduziu signals, demorei pra entender por que era diferente de \`BehaviorSubject\`.

A virada foi quando entendi que:

1. **Signal é um valor**, não um stream
2. **Computed** depende de outros signals automaticamente
3. **Effect** roda quando algo lido dentro dele muda

\`\`\`ts
const count = signal(0);
const double = computed(() => count() * 2);

effect(() => console.log('Mudou para', double()));

count.set(5); // imprime "Mudou para 10"
\`\`\`

Não precisei mais de \`subscribe\` em estado local. Combinado com \`OnPush\`, virou uma arma de produtividade.
`,
      tags: 'angular,signals,estudos',
      published: true,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
