export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-ink-200">
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-ink-500 flex flex-col sm:flex-row gap-2 justify-between">
        <p>© {year} Code Aventureiro — feito com Next.js e café.</p>
        <p>
          Construído por <span className="text-ink-700 font-medium">Thiago</span>
        </p>
      </div>
    </footer>
  );
}
