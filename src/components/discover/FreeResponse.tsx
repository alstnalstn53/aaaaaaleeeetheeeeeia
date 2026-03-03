'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTypingMetadata } from '@/hooks/useTypingMetadata';
import { useDiscoveryStore } from '@/store/discoveryStore';

interface FreeResponseProps {
  onNext: () => void;
}

export function FreeResponse({ onNext }: FreeResponseProps) {
  const [text, setText] = useState('');
  const prevLength = useRef(0);
  const { trackInput, getMetadata } = useTypingMetadata();
  const { saveFreeResponse } = useDiscoveryStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length > 2000) return;
    trackInput(newText.length, prevLength.current);
    prevLength.current = newText.length;
    setText(newText);
  };

  const handleSubmit = () => {
    if (text.trim().length < 20) return;
    const metadata = getMetadata(text.length);
    saveFreeResponse({ text, metadata });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(24px,3vw,36px)] font-extralight tracking-tight text-[#F5F5F5]"
        >
          Who are you?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-3 text-sm text-[#666666]"
        >
          Write freely. There are no right answers.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Tell us about yourself..."
          className="w-full min-h-[180px] resize-none rounded-2xl border border-white/5 bg-[#111111] p-6 text-base text-[#F5F5F5] placeholder-[#444444] transition-colors duration-300 focus:border-white/15 focus:outline-none"
          autoFocus
        />
      </motion.div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[#666666]">
          {text.length} / 2000
        </span>
        <motion.button
          onClick={handleSubmit}
          disabled={text.trim().length < 20}
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
