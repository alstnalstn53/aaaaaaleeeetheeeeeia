export interface FiveAxisData {
  structure: number;
  completion: number;
  agency: number;
  sensory: number;
  risk: number;
}

export interface ContradictionEntry {
  statementA: string;
  statementB: string;
  tension: string;
  significance: string;
}

export interface TemporalPattern {
  invariant: string[];
  evolution: string[];
  unrealized: string[];
}

export interface AfterReport {
  selfPortrait: string;
  behavioralSignals: string[];
  theGap: string;
  mirrorSentence: string;
  fiveAxis: FiveAxisData;
  fullMirror: {
    invariantPattern: string;
    evolutionDirection: string;
    unrealizedPossibility: string;
  };
  contradictions: ContradictionEntry[];
  aiBriefing: string;
  thinkingPrompts: string[];
}

export interface TokenPackage {
  id: 'starter' | 'explorer' | 'deep';
  name: string;
  price: number;
  tokens: number;
  description: string;
}
