export interface PauseEvent {
  timestamp: number;
  duration: number;
  charCountAtPause: number;
}

export interface TypingMetadata {
  charCount: number;
  timeSpent: number;
  editCount: number;
  pauseEvents: PauseEvent[];
  deletionRatio: number;
}

export interface SelectionMetadata {
  selectionTime: number;
  hoverHistory: string[];
  changeCount: number;
}

export interface SliderMetadata {
  trajectory: { value: number; timestamp: number }[];
  directionChanges: number;
  maxValue: number;
  minValue: number;
  settleTime: number;
  firstTouchTime: number;
  totalInteractionTime: number;
}

export type SliderPattern = 'extreme' | 'center_cluster' | 'neat' | 'scattered' | 'progressive';
