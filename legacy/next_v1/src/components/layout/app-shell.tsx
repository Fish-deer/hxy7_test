'use client';

import { PropsWithChildren } from 'react';
import { usePathname } from 'next/navigation';
import { TopNav } from './top-nav';

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  if (pathname === '/login') return <>{children}</>;

  return (
    <>
      <TopNav />
      <main className="container-mobile py-5 lg:py-7">{children}</main>
    </>
  );
}
