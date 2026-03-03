'use client';

import { motion } from 'framer-motion';

interface ThinkingPromptsProps {
  prompts: string[];
}

export function ThinkingPrompts({ prompts }: ThinkingPromptsProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111111] p-6">
      <h3 className="mb-2 text-[10px] tracking-[0.15em] text-[#666666] uppercase">
        Thinking Prompts
      </h3>
      <p className="mb-5 text-xs text-[#444444]">
        AI can&apos;t answer these for you. That&apos;s exactly the point.
      </p>
      <div className="space-y-4">
        {prompts.map((prompt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4"
          >
            <span className="flex-shrink-0 text-xs text-[#444444]">
              {i + 1}.
            </span>
            <p className="text-sm font-light text-[#F5F5F5]">{prompt}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
