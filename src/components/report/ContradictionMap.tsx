'use client';

import { motion } from 'framer-motion';
import type { ContradictionEntry } from '@/types/report';

interface ContradictionMapProps {
  contradictions: ContradictionEntry[];
}

export function ContradictionMap({ contradictions }: ContradictionMapProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111111] p-6">
      <h3 className="mb-4 text-[10px] tracking-[0.15em] text-[#666666] uppercase">
        Contradiction Map
      </h3>
      <div className="space-y-6">
        {contradictions.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-stretch gap-3">
              <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className="text-xs text-[#F5F5F5] font-light">
                  &ldquo;{c.statementA}&rdquo;
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-lg text-[#444444]">&harr;</span>
              </div>
              <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                <p className="text-xs text-[#F5F5F5] font-light">
                  &ldquo;{c.statementB}&rdquo;
                </p>
              </div>
            </div>
            <div className="px-2">
              <p className="text-xs text-[#999999] font-light">{c.tension}</p>
              <p className="text-[11px] text-[#666666] mt-1">{c.significance}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
