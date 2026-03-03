'use client';
import { useRef, useCallback, useState } from 'react';
import type { PauseEvent, TypingMetadata } from '@/types/metadata';

export function useTypingMetadata() {
  const startTime = useRef(Date.now());
  const lastKeystroke = useRef(Date.now());
  const [editCount, setEditCount] = useState(0);
  const [pauseEvents, setPauseEvents] = useState<PauseEvent[]>([]);
  const totalCharsTyped = useRef(0);
  const totalCharsDeleted = useRef(0);

  const trackInput = useCallback((currentLength: number, prevLength: number) => {
    const now = Date.now();
    const gap = now - lastKeystroke.current;

    // Detect pauses > 3 seconds
    if (gap > 3000 && lastKeystroke.current !== startTime.current) {
      setPauseEvents((prev) => [
        ...prev,
        {
          timestamp: lastKeystroke.current - startTime.current,
          duration: gap,
          charCountAtPause: prevLength,
        },
      ]);
    }

    // Track additions vs deletions
    if (currentLength > prevLength) {
      totalCharsTyped.current += currentLength - prevLength;
    } else {
      totalCharsDeleted.current += prevLength - currentLength;
    }

    setEditCount((prev) => prev + 1);
    lastKeystroke.current = now;
  }, []);

  const getMetadata = useCallback(
    (charCount: number): TypingMetadata => ({
      charCount,
      timeSpent: Date.now() - startTime.current,
      editCount,
      pauseEvents,
      deletionRatio:
        totalCharsTyped.current > 0
          ? totalCharsDeleted.current / totalCharsTyped.current
          : 0,
    }),
    [editCount, pauseEvents]
  );

  return { trackInput, getMetadata };
}
