'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-[2px] w-full bg-white/5">
        <motion.div
          className="h-full bg-white/30"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex items-center justify-between px-6 py-3">
        <span className="text-[10px] tracking-[0.15em] text-[#666666]">
          {current + 1} / {total}
        </span>
        <span className="text-[10px] tracking-[0.15em] text-[#666666]">
          DISCOVERY
        </span>
      </div>
    </div>
  );
}
