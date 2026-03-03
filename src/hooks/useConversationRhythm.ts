'use client';
import { useCallback, useRef } from 'react';
import type { ConversationRhythm } from '@/types/chat';

// deep > light > light > deep > mirror (repeat)
const RHYTHM_PATTERN: ConversationRhythm[] = ['deep', 'light', 'light', 'deep', 'mirror'];

export function useConversationRhythm() {
  const turnCount = useRef(0);
  const consecutiveDeep = useRef(0);

  const getNextRhythm = useCallback((): ConversationRhythm => {
    const idx = turnCount.current % RHYTHM_PATTERN.length;
    let rhythm = RHYTHM_PATTERN[idx];

    // Safety: prevent 3+ consecutive deep questions
    if (rhythm === 'deep' && consecutiveDeep.current >= 2) {
      rhythm = 'light';
    }

    if (rhythm === 'deep') {
      consecutiveDeep.current++;
    } else {
      consecutiveDeep.current = 0;
    }

    turnCount.current++;
    return rhythm;
  }, []);

  const getTurnCount = useCallback(() => turnCount.current, []);

  return { getNextRhythm, getTurnCount };
}
