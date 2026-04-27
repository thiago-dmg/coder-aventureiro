import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sobre' };

export default function SobrePage() {
  return (
    <div className="prose-post max-w-2xl">
      <h1>Sobre o Code Aventureiro</h1>

      <p>
        Esse é o meu canto da internet onde eu registro tudo que aprendo
        construindo coisas com código.
      </p>

      <p>
        Sou <strong>Thiago</strong>, dev front-end. Trabalho com Angular no dia
        a dia e estudo várias outras coisas no tempo livre — Next.js, RxJS,
        TypeScript, design de interfaces, e o que mais aparecer pela frente.
      </p>

      <h2>Por que esse blog existe?</h2>

      <p>
        Quando eu não escrevo o que aprendo, esqueço. E quando esqueço, sinto
        que sou impostor. Esse blog é um anti-impostor: sempre que bater a
        sensação, eu venho aqui ler o que <em>eu mesmo</em> escrevi e lembro
        que sei mais do que pensava.
      </p>

      <h2>O que esperar daqui</h2>

      <ul>
        <li>Notas curtas sobre projetos</li>
        <li>Bugs que me deram dor de cabeça (e a solução)</li>
        <li>Conceitos que precisei revisitar</li>
        <li>Comparativos honestos entre ferramentas</li>
      </ul>

      <h2>Contato</h2>
      <p>
        Pode me achar como <em>@codeaventureiro</em> nas redes (ou edite essa
        página com seus links reais).
      </p>
    </div>
  );
}
