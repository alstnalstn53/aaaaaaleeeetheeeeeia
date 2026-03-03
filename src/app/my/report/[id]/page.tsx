'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarChart } from '@/components/report/RadarChart';
import { ContradictionMap } from '@/components/report/ContradictionMap';
import { AIBriefing } from '@/components/report/AIBriefing';
import { ThinkingPrompts } from '@/components/report/ThinkingPrompts';
import type { AfterReport } from '@/types/report';

export default function ReportPage() {
  const [report, setReport] = useState<AfterReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from Supabase by session ID
    // For now, show placeholder
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <p className="text-sm text-[#666666]">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <p className="text-sm text-[#666666]">No report found.</p>
          <p className="mt-2 text-xs text-[#444444]">Complete a deep conversation to generate your After Report.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 py-20">
      <div className="mx-auto max-w-[720px] space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-xs tracking-[0.3em] text-[#666666]">AFTER REPORT</h1>
        </motion.div>

        {/* Self Portrait */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/5 bg-[#111111] p-6"
        >
          <h3 className="mb-3 text-[10px] tracking-[0.15em] text-[#666666] uppercase">
            Self-Portrait
          </h3>
          <p className="text-sm font-light leading-relaxed text-[#F5F5F5]">
            {report.selfPortrait}
          </p>
        </motion.div>

        {/* Behavioral Signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/5 bg-[#111111] p-6"
        >
          <h3 className="mb-3 text-[10px] tracking-[0.15em] text-[#666666] uppercase">
            Behavioral Signals
          </h3>
          <div className="space-y-3">
            {report.behavioralSignals.map((signal, i) => (
              <p key={i} className="text-sm font-light text-[#F5F5F5]">{signal}</p>
            ))}
          </div>
        </motion.div>

        {/* Mirror Sentence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center"
        >
          <p className="text-[10px] tracking-[0.2em] text-[#666666] mb-4">YOUR MIRROR</p>
          <p className="text-lg font-extralight leading-relaxed text-[#F5F5F5] italic">
            &ldquo;{report.mirrorSentence}&rdquo;
          </p>
        </motion.div>

        {/* 5-Axis Radar */}
        <RadarChart data={report.fiveAxis} />

        {/* Full Mirror */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/5 bg-[#111111] p-6 space-y-4"
        >
          <h3 className="text-[10px] tracking-[0.15em] text-[#666666] uppercase">Full Mirror</h3>
          <div>
            <p className="text-[10px] text-[#666666] mb-1">What never changes</p>
            <p className="text-sm font-light text-[#F5F5F5]">{report.fullMirror.invariantPattern}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#666666] mb-1">Where you&apos;re heading</p>
            <p className="text-sm font-light text-[#F5F5F5]">{report.fullMirror.evolutionDirection}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#666666] mb-1">What you haven&apos;t tried yet</p>
            <p className="text-sm font-light text-[#F5F5F5]">{report.fullMirror.unrealizedPossibility}</p>
          </div>
        </motion.div>

        {/* Contradictions */}
        <ContradictionMap contradictions={report.contradictions} />

        {/* AI Briefing */}
        <AIBriefing briefing={report.aiBriefing} />

        {/* Thinking Prompts */}
        <ThinkingPrompts prompts={report.thinkingPrompts} />
      </div>
    </main>
  );
}
