import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';

export const maxDuration = 25;

export async function POST(request: NextRequest) {
  try {
    const { discoveryData, conversationHistory } = await request.json();

    const input = JSON.stringify({ discoveryData, conversationHistory }, null, 2);

    const result = await callClaude(
      'ai_briefing',
      [{ role: 'user', content: `Generate an AI Briefing for this person based on their complete data:\n\n${input}` }],
      1000
    );

    return NextResponse.json({ briefing: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
