'use client';

import { motion } from 'framer-motion';
import type { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user_text' || message.type === 'user_choice' || message.type === 'user_slider';
  const isInsight = message.type === 'ai_insight';

  if (isInsight) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <p className="text-[10px] tracking-[0.15em] text-[#666666] uppercase mb-2">
          Pattern Detected
        </p>
        <p className="text-sm font-light leading-relaxed text-[#F5F5F5]">
          {message.content}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? 'bg-white/[0.08] text-[#F5F5F5]'
            : 'text-[#F5F5F5]'
        }`}
      >
        <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}
