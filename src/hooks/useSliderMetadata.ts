'use client';
import { useRef, useCallback } from 'react';
import type { SliderMetadata } from '@/types/metadata';

export function useSliderMetadata(axisIds: string[]) {
  const trajectories = useRef<Record<string, { value: number; timestamp: number }[]>>({});
  const firstTouch = useRef<Record<string, number>>({});
  const interactionStart = useRef<Record<string, number>>({});
  const touchOrder = useRef<string[]>([]);

  const trackChange = useCallback((axisId: string, value: number) => {
    const now = Date.now();

    if (!trajectories.current[axisId]) {
      trajectories.current[axisId] = [];
      firstTouch.current[axisId] = now;
      interactionStart.current[axisId] = now;
      touchOrder.current.push(axisId);
    }

    trajectories.current[axisId].push({ value, timestamp: now });
  }, []);

  const getMetadata = useCallback(
    (axisId: string): SliderMetadata => {
      const traj = trajectories.current[axisId] || [];
      const now = Date.now();

      let directionChanges = 0;
      let maxValue = 0;
      let minValue = 0;

      for (let i = 2; i < traj.length; i++) {
        const prev = traj[i - 1].value - traj[i - 2].value;
        const curr = traj[i].value - traj[i - 1].value;
        if ((prev > 0 && curr < 0) || (prev < 0 && curr > 0)) {
          directionChanges++;
        }
        maxValue = Math.max(maxValue, traj[i].value);
        minValue = Math.min(minValue, traj[i].value);
      }

      const lastFew = traj.slice(-5);
      const settleTime =
        lastFew.length >= 2
          ? lastFew[lastFew.length - 1].timestamp - lastFew[0].timestamp
          : 0;

      return {
        trajectory: traj,
        directionChanges,
        maxValue,
        minValue,
        settleTime,
        firstTouchTime: firstTouch.current[axisId]
          ? firstTouch.current[axisId] - (interactionStart.current[axisId] || now)
          : 0,
        totalInteractionTime: now - (interactionStart.current[axisId] || now),
      };
    },
    []
  );

  const getSliderOrder = useCallback(() => touchOrder.current, []);

  return { trackChange, getMetadata, getSliderOrder };
}
