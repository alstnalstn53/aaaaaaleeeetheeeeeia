export interface Database {
  public: {
    Tables: {
      discovery_sessions: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          free_response: Record<string, unknown> | null;
          childhood: Record<string, unknown> | null;
          scenario: Record<string, unknown> | null;
          slider_data: Record<string, unknown> | null;
          behavioral_pattern: string | null;
          before_report: Record<string, unknown> | null;
          after_report: Record<string, unknown> | null;
          ai_briefing: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          status?: string;
          free_response?: Record<string, unknown> | null;
          childhood?: Record<string, unknown> | null;
          scenario?: Record<string, unknown> | null;
          slider_data?: Record<string, unknown> | null;
          behavioral_pattern?: string | null;
          before_report?: Record<string, unknown> | null;
          after_report?: Record<string, unknown> | null;
          ai_briefing?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['discovery_sessions']['Insert']>;
      };
      conversation_messages: {
        Row: {
          id: string;
          session_id: string;
          type: string;
          content: string;
          metadata: Record<string, unknown> | null;
          token_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          type: string;
          content: string;
          metadata?: Record<string, unknown> | null;
          token_cost?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversation_messages']['Insert']>;
      };
      user_tokens: {
        Row: {
          user_id: string;
          balance: number;
          total_purchased: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          total_purchased?: number;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_tokens']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount_usd: number;
          package: string;
          tokens_granted: number;
          stripe_payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount_usd: number;
          package: string;
          tokens_granted: number;
          stripe_payment_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      conversations: {
        Row: {
          id: number;
          session_id: string;
          user_id: string;
          mode: string;
          user_message: string;
          ai_response: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: string;
          user_id: string;
          mode: string;
          user_message: string;
          ai_response: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      extracted_patterns: {
        Row: {
          id: string;
          session_id: string;
          analytical: number;
          creative: number;
          interpersonal: number;
          strategic: number;
          introspective: number;
          temporal: Record<string, unknown> | null;
          contradictions: Record<string, unknown> | null;
          behavioral_signature: Record<string, unknown> | null;
          confidence_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          analytical: number;
          creative: number;
          interpersonal: number;
          strategic: number;
          introspective: number;
          temporal?: Record<string, unknown> | null;
          contradictions?: Record<string, unknown> | null;
          behavioral_signature?: Record<string, unknown> | null;
          confidence_level?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['extracted_patterns']['Insert']>;
      };
    };
  };
}
