import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-ink-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-accent">{'</>'}</span> Coder Aventureiro
        </Link>

        <nav className="flex items-center gap-5 text-sm text-ink-700">
          <Link href="/" className="hover:text-ink-900">Posts</Link>
          <Link href="/sobre" className="hover:text-ink-900">Sobre</Link>
        </nav>
      </div>
    </header>
  );
}
