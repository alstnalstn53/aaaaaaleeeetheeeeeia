import { PROMPTS, type PromptMode } from './prompts';

export async function callClaude(
  mode: PromptMode,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  maxTokens: number = 600
): Promise<string> {
  const systemPrompt = PROMPTS[mode];
  if (!systemPrompt) throw new Error(`Invalid mode: ${mode}`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'Claude API error');

  return data.content
    .map((item: { type: string; text?: string }) => (item.type === 'text' ? item.text : ''))
    .filter(Boolean)
    .join('\n');
}
