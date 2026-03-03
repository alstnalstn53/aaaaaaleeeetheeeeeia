'use client';

import { motion } from 'framer-motion';

interface InsightCardProps {
  pattern: string;
  observation: string;
  evidence: string;
  onFeedback: (agree: boolean) => void;
}

export function InsightCard({ pattern, observation, evidence, onFeedback }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
    >
      <p className="text-[10px] tracking-[0.2em] text-[#666666] uppercase mb-1">
        {pattern}
      </p>
      <p className="text-sm font-light leading-relaxed text-[#F5F5F5] mb-2">
        {observation}
      </p>
      <p className="text-xs text-[#666666] mb-4">
        {evidence}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onFeedback(true)}
          className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-[#999999] transition-all hover:border-white/20 hover:text-white"
        >
          That&apos;s right
        </button>
        <button
          onClick={() => onFeedback(false)}
          className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-[#999999] transition-all hover:border-white/20 hover:text-white"
        >
          Not quite...
        </button>
      </div>
    </motion.div>
  );
}
