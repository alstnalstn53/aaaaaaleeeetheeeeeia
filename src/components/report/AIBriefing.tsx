'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AIBriefingProps {
  briefing: string;
}

export function AIBriefing({ briefing }: AIBriefingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard?.writeText(briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] tracking-[0.15em] text-[#666666] uppercase">
          AI Briefing
        </h3>
        <span className="text-[9px] text-[#444444]">
          Paste into ChatGPT, Claude, or Gemini
        </span>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-sm font-light leading-relaxed text-[#F5F5F5] mb-6"
      >
        {briefing}
      </motion.p>

      <button
        onClick={handleCopy}
        className="rounded-full border border-white/10 px-6 py-2 text-xs text-[#999999] transition-all hover:border-white/20 hover:text-white"
      >
        {copied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
    </div>
  );
}
