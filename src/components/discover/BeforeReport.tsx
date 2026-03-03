'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useDiscoveryStore } from '@/store/discoveryStore';
import type { BeforeReport as BeforeReportType } from '@/types/discovery';

export function BeforeReport() {
  const { session, saveBeforeReport } = useDiscoveryStore();
  const [report, setReport] = useState<BeforeReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchReport() {
      try {
        const res = await fetch('/api/before-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session!.id,
            freeResponse: session!.freeResponse,
            childhood: session!.childhood,
            scenario: session!.scenario,
            sliderData: session!.sliderData,
          }),
        });

        if (!res.ok) throw new Error('Failed to generate report');
        const data = await res.json();
        setReport(data.report);
        saveBeforeReport(data.report);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [session, saveBeforeReport]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-[#666666]"
        >
          Analyzing your responses...
        </motion.div>
        <div className="h-[2px] w-32 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full bg-white/20"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: '50%' }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-[#666666]">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-xs text-white/50 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!report) return null;

  const sections = [
    { title: 'Your Self-Portrait', content: report.selfPortrait, delay: 0 },
    { title: 'Behavioral Signal', content: report.behavioralSignal, delay: 0.3 },
    { title: 'The Gap', content: report.theGap, delay: 0.6 },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <h2 className="text-xs tracking-[0.3em] text-[#666666]">
          BEFORE REPORT
        </h2>
      </motion.div>

      {sections.map((section) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: section.delay,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="rounded-2xl border border-white/5 bg-[#111111] p-6"
        >
          <h3 className="mb-3 text-[10px] font-medium tracking-[0.15em] text-[#666666] uppercase">
            {section.title}
          </h3>
          <p className="text-sm font-light leading-relaxed text-[#F5F5F5]">
            {section.content}
          </p>
        </motion.div>
      ))}

      {/* Mirror Sentence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"
      >
        <p className="text-[10px] tracking-[0.2em] text-[#666666] mb-4">
          YOUR MIRROR
        </p>
        <p className="text-lg font-extralight leading-relaxed text-[#F5F5F5] italic">
          &ldquo;{report.mirrorSentence}&rdquo;
        </p>
        <button
          onClick={() => navigator.clipboard?.writeText(report.mirrorSentence)}
          className="mt-4 text-[10px] text-[#666666] transition-colors hover:text-[#999999]"
        >
          Copy to clipboard
        </button>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="space-y-4 pt-4 text-center"
      >
        <Link
          href="/discover?step=deep"
          className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Go Deeper &mdash; $4.99
        </Link>
        <p className="text-xs text-[#666666]">
          Your Before Report is complete. That&apos;s already a lot.
        </p>
      </motion.div>
    </div>
  );
}
