import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <main className="flex-1 py-8 sm:py-12">{children}</main>
      <Footer />
    </div>
  );
}
