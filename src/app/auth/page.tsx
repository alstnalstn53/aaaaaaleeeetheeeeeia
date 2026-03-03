import Link from 'next/link';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-extralight tracking-tight text-[#F5F5F5]">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-[#666666]">
            Continue your discovery journey.
          </p>
        </div>

        <button className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 text-sm text-[#F5F5F5] transition-all hover:border-white/20 hover:bg-white/[0.06]">
          Continue with Google
        </button>

        <p className="text-xs text-[#444444]">
          By signing in, you agree to our terms of service.
        </p>

        <Link href="/" className="block text-xs text-[#666666] transition-colors hover:text-[#999999]">
          &larr; Back to home
        </Link>
      </div>
    </main>
  );
}
