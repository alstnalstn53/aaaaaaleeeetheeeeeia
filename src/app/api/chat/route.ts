import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { createServerSupabase } from '@/lib/supabase';
import type { PromptMode } from '@/lib/prompts';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { mode, messages, max_tokens, sessionId, userId } = await request.json();

    const result = await callClaude(mode as PromptMode, messages, max_tokens || 600);

    // Non-blocking save to Supabase
    if (sessionId) {
      const supabase = createServerSupabase();
      const lastUserMsg = messages.length > 0 ? messages[messages.length - 1].content : '';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from('conversations')
        .insert({
          session_id: sessionId,
          user_id: userId || 'anon',
          mode,
          user_message: lastUserMsg,
          ai_response: result,
          created_at: new Date().toISOString(),
        })
        .then(() => {})
        .catch(() => {});
    }

    return NextResponse.json({
      content: [{ type: 'text', text: result }],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
