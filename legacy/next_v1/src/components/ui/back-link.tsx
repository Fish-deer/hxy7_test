'use client';

import { useRouter } from 'next/navigation';

export function BackLink({ href, label = '返回' }: { href: string; label?: string; preferBack?: boolean }) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.push(href)} className="inline-flex items-center rounded-md border bg-white px-3 py-1.5 text-sm text-primary shadow-sm">
      {label}
    </button>
  );
}
