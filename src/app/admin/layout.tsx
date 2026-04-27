import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-ink-200 pb-4">
        <Link href="/admin" className="font-semibold text-ink-900">
          Admin
        </Link>
        <Link href="/admin/posts/novo" className="text-sm text-accent hover:underline">
          + Novo post
        </Link>
        <Link href="/admin/comments" className="text-sm text-ink-700 hover:underline">
          Comentários
        </Link>
        <Link href="/" className="text-sm text-ink-500 hover:underline">
          Ver site público
        </Link>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
