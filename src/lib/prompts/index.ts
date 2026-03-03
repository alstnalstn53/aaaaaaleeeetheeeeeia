export { corePrompt } from './core';
export { metaPrompt } from './meta';
export { interpretPrompt } from './interpret';
export { interpretAnalysisPrompt } from './interpret-analysis';
export { essenceDocumentPrompt } from './essence-document';
export { businessProposalPrompt } from './business-proposal';
export { brandGuidePrompt } from './brand-guide';
export { cafeProposalPrompt } from './cafe-proposal';
export { founderAnalysisPrompt } from './founder-analysis';
export { beforeReportPrompt } from './before-report';
export { afterReportPrompt } from './after-report';
export { aiBriefingPrompt } from './ai-briefing';

import { corePrompt } from './core';
import { metaPrompt } from './meta';
import { interpretPrompt } from './interpret';
import { interpretAnalysisPrompt } from './interpret-analysis';
import { essenceDocumentPrompt } from './essence-document';
import { businessProposalPrompt } from './business-proposal';
import { brandGuidePrompt } from './brand-guide';
import { cafeProposalPrompt } from './cafe-proposal';
import { founderAnalysisPrompt } from './founder-analysis';
import { beforeReportPrompt } from './before-report';
import { afterReportPrompt } from './after-report';
import { aiBriefingPrompt } from './ai-briefing';

export const PROMPTS = {
  core: corePrompt,
  meta_extract: metaPrompt,
  interpret: interpretPrompt,
  interpret_analysis: interpretAnalysisPrompt,
  essence_document: essenceDocumentPrompt,
  business_proposal: businessProposalPrompt,
  brand_guide: brandGuidePrompt,
  cafe_proposal: cafeProposalPrompt,
  founder_analysis: founderAnalysisPrompt,
  before_report: beforeReportPrompt,
  after_report: afterReportPrompt,
  ai_briefing: aiBriefingPrompt,
} as const;

export type PromptMode = keyof typeof PROMPTS;
