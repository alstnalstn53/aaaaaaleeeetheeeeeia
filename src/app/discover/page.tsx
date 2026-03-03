'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDiscoveryStore } from '@/store/discoveryStore';
import { ProgressBar } from '@/components/discover/ProgressBar';
import { FreeResponse } from '@/components/discover/FreeResponse';
import { ChildhoodPlay } from '@/components/discover/ChildhoodPlay';
import { HypotheticalScenario } from '@/components/discover/HypotheticalScenario';
import { BehavioralSliders } from '@/components/discover/BehavioralSliders';
import { BeforeReport } from '@/components/discover/BeforeReport';
import type { DiscoveryStep } from '@/types/discovery';

const STEPS: DiscoveryStep[] = [
  'free-response',
  'childhood',
  'scenario',
  'sliders',
  'before-report',
];

export default function DiscoverPage() {
  const { currentStep, setStep, session, initSession } = useDiscoveryStore();
  const stepIndex = STEPS.indexOf(currentStep);

  useEffect(() => {
    if (!session) {
      initSession('anon_' + Date.now().toString(36));
    }
  }, [session, initSession]);

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1]);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <ProgressBar current={stepIndex} total={STEPS.length} />

      <div className="flex min-h-screen items-center justify-center px-6 pt-16 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[560px]"
          >
            {currentStep === 'free-response' && <FreeResponse onNext={handleNext} />}
            {currentStep === 'childhood' && <ChildhoodPlay onNext={handleNext} />}
            {currentStep === 'scenario' && <HypotheticalScenario onNext={handleNext} />}
            {currentStep === 'sliders' && <BehavioralSliders onNext={handleNext} />}
            {currentStep === 'before-report' && <BeforeReport />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
