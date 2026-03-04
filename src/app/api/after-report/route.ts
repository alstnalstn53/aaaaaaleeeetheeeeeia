import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';

export const maxDuration = 45;

export async function POST(request: NextRequest) {
  try {
    const { discoveryData, conversationHistory } = await request.json();

    const input = JSON.stringify({ discoveryData, conversationHistory }, null, 2);

    const result = await callClaude(
      'after_report',
      [{ role: 'user', content: `Generate the After Report from this complete session data:\n\n${input}` }],
      4096
    );

    const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/) || result.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : result);

    return NextResponse.json({ report: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
