'use client';

import { motion } from 'framer-motion';

interface SidePanelProps {
  keywords: string[];
  currentLayer: string;
  tokenBalance: number;
}

const LAYERS = ['Surface', 'Pattern', 'Values', 'Motivation', 'Essence'];

export function SidePanel({ keywords, currentLayer, tokenBalance }: SidePanelProps) {
  const layerIndex = LAYERS.indexOf(currentLayer);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex w-[320px] flex-col border-l border-white/5 bg-[#0A0A0A] p-6"
    >
      {/* Nebula map placeholder */}
      <div className="mb-6 h-[200px] rounded-xl border border-white/5 bg-[#111111] flex items-center justify-center">
        <span className="text-xs text-[#444444]">Nebula Map</span>
      </div>

      {/* Keywords */}
      <div className="mb-6">
        <h3 className="mb-3 text-[10px] tracking-[0.15em] text-[#666666] uppercase">
          Keywords
        </h3>
        <div className="flex flex-wrap gap-2">
          {keywords.length > 0 ? (
            keywords.map((kw, i) => (
              <span
                key={i}
                className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-[#999999]"
              >
                {kw}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#444444]">Keywords appear as you talk</span>
          )}
        </div>
      </div>

      {/* Layer diagram */}
      <div className="mb-6">
        <h3 className="mb-3 text-[10px] tracking-[0.15em] text-[#666666] uppercase">
          Depth
        </h3>
        <div className="space-y-1">
          {LAYERS.map((layer, i) => (
            <div
              key={layer}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                i <= layerIndex ? 'text-[#F5F5F5]' : 'text-[#333333]'
              }`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  i <= layerIndex ? 'bg-white/40' : 'bg-white/10'
                }`}
              />
              {layer}
            </div>
          ))}
        </div>
      </div>

      {/* Token balance */}
      <div className="mt-auto rounded-xl border border-white/5 bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#666666]">Tokens</span>
          <span className="text-sm font-light text-[#F5F5F5]">{tokenBalance}</span>
        </div>
      </div>
    </motion.aside>
  );
}
