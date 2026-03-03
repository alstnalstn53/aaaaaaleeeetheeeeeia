'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelectionMetadata } from '@/hooks/useSelectionMetadata';
import { useDiscoveryStore } from '@/store/discoveryStore';

interface HypotheticalScenarioProps {
  onNext: () => void;
}

const OPTIONS = [
  { id: 'same', label: 'The same thing', desc: "I'd keep doing what I do, because it's who I am" },
  { id: 'postponed', label: 'What I\'ve been putting off', desc: "I'd finally pursue what I've been delaying" },
  { id: 'rest', label: 'Rest', desc: "I'd do nothing for a while" },
  { id: 'unknown', label: 'I don\'t know', desc: "I honestly have no idea" },
];

export function HypotheticalScenario({ onNext }: HypotheticalScenarioProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const { trackHover, trackChange, getMetadata } = useSelectionMetadata();
  const { saveScenario } = useDiscoveryStore();

  const handleSelect = (id: string) => {
    if (selected !== id) trackChange();
    setSelected(id);
  };

  const handleSubmit = () => {
    if (!selected) return;
    saveScenario({
      selected,
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
          AI replaced all your work.
          <br />
          <span className="text-[#999999]">What do you do tomorrow morning?</span>
        </motion.h2>
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
