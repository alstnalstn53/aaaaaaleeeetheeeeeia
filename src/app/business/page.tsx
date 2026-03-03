import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';

export default function BusinessPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center space-y-6">
          <h1 className="text-[clamp(24px,3vw,36px)] font-extralight tracking-tight text-[#F5F5F5]">
            Aletheia for Business
          </h1>
          <p className="text-sm text-[#666666] max-w-md mx-auto">
            Understand your team, your customers, and your brand at a deeper level.
            Enterprise solutions coming soon.
          </p>
          <div className="inline-block rounded-full border border-white/10 px-6 py-2 text-xs text-[#666666]">
            Coming Soon
          </div>
          <div>
            <Link href="/" className="text-xs text-[#444444] transition-colors hover:text-[#666666]">
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
