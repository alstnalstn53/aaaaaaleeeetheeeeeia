export type MessageType = 'ai_question' | 'ai_mirror' | 'ai_insight' | 'user_text' | 'user_choice' | 'user_slider' | 'system';

export interface ChatMessage {
  id: string;
  sessionId: string;
  type: MessageType;
  content: string;
  metadata?: {
    tokenCost?: number;
    responseTime?: number;
    insightType?: string;
    feedbackGiven?: 'agree' | 'disagree';
  };
  createdAt: string;
}

export type ConversationRhythm = 'deep' | 'light' | 'mirror';

export interface ConversationState {
  messages: ChatMessage[];
  isLoading: boolean;
  totalTokensUsed: number;
  currentRhythm: ConversationRhythm;
  turnCount: number;
}
