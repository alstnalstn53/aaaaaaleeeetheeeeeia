'use client';
import { useRef, useCallback, useState } from 'react';
import type { SelectionMetadata } from '@/types/metadata';

export function useSelectionMetadata() {
  const displayTime = useRef(Date.now());
  const [changeCount, setChangeCount] = useState(0);
  const [hoverHistory, setHoverHistory] = useState<string[]>([]);

  const reset = useCallback(() => {
    displayTime.current = Date.now();
    setChangeCount(0);
    setHoverHistory([]);
  }, []);

  const trackHover = useCallback((optionId: string) => {
    setHoverHistory((prev) => [...prev, optionId]);
  }, []);

  const trackChange = useCallback(() => {
    setChangeCount((prev) => prev + 1);
  }, []);

  const getMetadata = useCallback(
    (): SelectionMetadata => ({
      selectionTime: Date.now() - displayTime.current,
      hoverHistory,
      changeCount,
    }),
    [hoverHistory, changeCount]
  );

  return { reset, trackHover, trackChange, getMetadata };
}
