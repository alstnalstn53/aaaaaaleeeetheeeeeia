import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';

export default function MyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="mx-auto max-w-[720px] px-6 pt-24 pb-12">
        <h1 className="text-2xl font-extralight tracking-tight text-[#F5F5F5]">
          My Page
        </h1>
        <p className="mt-2 text-sm text-[#666666]">
          Your discovery sessions and reports.
        </p>

        {/* Sessions list placeholder */}
        <div className="mt-12 space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#111111] p-6 text-center">
            <p className="text-sm text-[#444444]">No sessions yet.</p>
            <Link
              href="/discover"
              className="mt-3 inline-block text-xs text-[#999999] transition-colors hover:text-white"
            >
              Start your first discovery &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
