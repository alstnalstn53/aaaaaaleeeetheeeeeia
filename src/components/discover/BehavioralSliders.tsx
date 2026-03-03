'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSliderMetadata } from '@/hooks/useSliderMetadata';
import { useDiscoveryStore } from '@/store/discoveryStore';
import type { SliderData } from '@/types/discovery';

interface BehavioralSlidersProps {
  onNext: () => void;
}

const AXES = [
  { id: 'rules', left: 'Follow rules', right: 'Make rules' },
  { id: 'completion', left: 'Finish things', right: 'Start things' },
  { id: 'social', left: 'Time alone', right: 'Time together' },
];

export function BehavioralSliders({ onNext }: BehavioralSlidersProps) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(AXES.map((a) => [a.id, 0]))
  );
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const sliderMeta = useSliderMetadata(AXES.map((a) => a.id));
  const { saveSliders } = useDiscoveryStore();

  const handleChange = (axisId: string, value: number) => {
    setValues((prev) => ({ ...prev, [axisId]: value }));
    setTouched((prev) => new Set(prev).add(axisId));
    sliderMeta.trackChange(axisId, value);
  };

  const allTouched = touched.size === AXES.length;

  const handleSubmit = () => {
    if (!allTouched) return;
    const data: SliderData[] = AXES.map((axis) => ({
      axis: axis.id,
      leftLabel: axis.left,
      rightLabel: axis.right,
      value: values[axis.id],
      metadata: sliderMeta.getMetadata(axis.id),
    }));
    saveSliders(data);
    onNext();
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(20px,2.5vw,30px)] font-extralight tracking-tight text-[#F5F5F5]"
        >
          Last one. Go with your gut.
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-10"
      >
        {AXES.map((axis, i) => (
          <motion.div
            key={axis.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex justify-between text-xs text-[#999999]">
              <span>{axis.left}</span>
              <span>{axis.right}</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              value={values[axis.id]}
              onChange={(e) => handleChange(axis.id, Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-[10px] text-[#444444]">
                {values[axis.id]}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex justify-end">
        <motion.button
          onClick={handleSubmit}
          disabled={!allTouched}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-opacity disabled:opacity-15"
        >
          See My Report
        </motion.button>
      </div>
    </div>
  );
}
