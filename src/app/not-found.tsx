import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-ink-700">Talvez esse post foi excluído ou nunca existiu.</p>
      <Link href="/" className="mt-6 inline-block text-accent hover:underline">
        ← Voltar pra home
      </Link>
    </div>
  );
}
