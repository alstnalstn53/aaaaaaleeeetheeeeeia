import type { TypingMetadata, SelectionMetadata, SliderMetadata, SliderPattern } from './metadata';

export interface FreeResponseData {
  text: string;
  metadata: TypingMetadata;
}

export interface ChildhoodChoice {
  selected: string;
  supplementText?: string;
  metadata: SelectionMetadata;
}

export interface HypotheticalChoice {
  selected: string;
  metadata: SelectionMetadata;
}

export interface SliderData {
  axis: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  metadata: SliderMetadata;
}

export interface BeforeReport {
  selfPortrait: string;
  behavioralSignal: string;
  theGap: string;
  mirrorSentence: string;
}

export type DiscoveryStep = 'free-response' | 'childhood' | 'scenario' | 'sliders' | 'before-report';

export interface DiscoverySession {
  id: string;
  userId: string;
  status: 'in_progress' | 'before_complete' | 'paywall' | 'deep_conversation' | 'after_complete';
  currentStep: DiscoveryStep;
  freeResponse?: FreeResponseData;
  childhood?: ChildhoodChoice;
  scenario?: HypotheticalChoice;
  sliderData?: SliderData[];
  behavioralPattern?: SliderPattern;
  beforeReport?: BeforeReport;
  createdAt: string;
  updatedAt: string;
}
