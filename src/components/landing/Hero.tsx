'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
      {/* Main copy */}
      <motion.h1
        initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[640px] text-center text-[clamp(24px,4vw,42px)] font-extralight leading-[1.3] tracking-tight text-[#F5F5F5]"
      >
        AI knows everything.
        <br />
        <span className="text-[#999999]">
          Except what only you can create.
        </span>
      </motion.h1>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 flex flex-col items-center gap-4"
      >
        <Link
          href="/discover"
          className="group relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-light text-white backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06]"
        >
          Start Discovery
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </Link>
      </motion.div>

      {/* For Business */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1 }}
        className="mt-6"
      >
        <Link
          href="/business"
          className="text-xs text-[#666666] transition-colors hover:text-[#999999]"
        >
          For Business &rarr;
        </Link>
      </motion.div>
    </div>
  );
}
