'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelectionMetadata } from '@/hooks/useSelectionMetadata';
import { useDiscoveryStore } from '@/store/discoveryStore';

interface ChildhoodPlayProps {
  onNext: () => void;
}

const OPTIONS = [
  { id: 'manual', label: 'By the book', desc: 'Followed instructions step by step' },
  { id: 'improvise', label: 'Made it up', desc: 'Improvised and experimented freely' },
  { id: 'adapt', label: 'Started rules, then my way', desc: 'Learned the basics, then broke them' },
  { id: 'imagine', label: 'Lost in imagination', desc: 'Created entire worlds alone' },
];

export function ChildhoodPlay({ onNext }: ChildhoodPlayProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [supplement, setSupplement] = useState('');
  const { trackHover, trackChange, getMetadata } = useSelectionMetadata();
  const { saveChildhood } = useDiscoveryStore();

  const handleSelect = (id: string) => {
    if (selected !== id) trackChange();
    setSelected(id);
  };

  const handleSubmit = () => {
    if (!selected) return;
    saveChildhood({
      selected,
      supplementText: supplement || undefined,
      metadata: getMetadata(),
    });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(20px,2.5vw,30px)] font-extralight tracking-tight text-[#F5F5F5]"
        >
          When you were young, how did you play?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-3 text-sm text-[#666666]"
        >
          Think about the games you lost yourself in.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            onMouseEnter={() => trackHover(opt.id)}
            className={`w-full rounded-xl border p-4 text-left transition-all duration-300 ${
              selected === opt.id
                ? 'border-white/20 bg-white/[0.06]'
                : 'border-white/5 bg-[#111111] hover:border-white/10'
            }`}
          >
            <div className="text-sm font-light text-[#F5F5F5]">{opt.label}</div>
            <div className="mt-1 text-xs text-[#666666]">{opt.desc}</div>
          </button>
        ))}
      </motion.div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4 }}
        >
          <input
            type="text"
            value={supplement}
            onChange={(e) => setSupplement(e.target.value)}
            placeholder="Want to add anything? (optional)"
            className="w-full rounded-xl border border-white/5 bg-[#111111] px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#444444] focus:border-white/15 focus:outline-none"
          />
        </motion.div>
      )}

      <div className="flex justify-end">
        <motion.button
          onClick={handleSubmit}
          disabled={!selected}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-opacity disabled:opacity-15"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
