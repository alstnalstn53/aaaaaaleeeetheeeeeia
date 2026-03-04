import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { freeResponse, childhood, scenario, sliderData } = await request.json();

    const analysisInput = JSON.stringify(
      { freeResponse, childhood, scenario, sliderData },
      null,
      2
    );

    const result = await callClaude(
      'before_report',
      [{ role: 'user', content: `Analyze this discovery data:\n\n${analysisInput}` }],
      2000
    );

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/) || result.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : result);

    return NextResponse.json({ report: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: { message } }, { status: 500 });
  }
}
