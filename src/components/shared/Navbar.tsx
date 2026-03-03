'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <Link
        href="/"
        className="text-sm font-light tracking-[0.2em] text-[#F5F5F5] transition-opacity hover:opacity-70"
      >
        ALETHEIA
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/auth"
          className="text-xs text-[#999999] transition-colors hover:text-[#F5F5F5]"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}
