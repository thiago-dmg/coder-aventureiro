import Link from 'next/link';
import clsx from 'clsx';

type Props = {
  tag: string;
  className?: string;
  asLink?: boolean;
};

export default function TagBadge({ tag, className, asLink = true }: Props) {
  const base =
    'inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-ink-100 text-ink-700 hover:bg-accent/10 hover:text-accent transition-colors';

  if (!asLink) {
    return <span className={clsx(base, className)}>#{tag}</span>;
  }

  return (
    <Link href={`/tags/${encodeURIComponent(tag)}`} className={clsx(base, className)}>
      #{tag}
    </Link>
  );
}
