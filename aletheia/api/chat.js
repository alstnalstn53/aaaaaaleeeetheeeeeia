import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { CONVERSATION_PROMPT } from '../lib/conversation-prompt.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, sessionId, userId } = req.body;

    if (!messages || !sessionId) {
      return res.status(400).json({ error: 'messages and sessionId required' });
    }

    // Claude API 호출
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: CONVERSATION_PROMPT,
      messages: messages,
    });

    const assistantMessage = response.content[0].text;

    // 마지막 사용자 메시지와 AI 응답을 DB에 저장
    const lastUserMessage = messages[messages.length - 1];

    await supabase.from('conversations').insert([
      {
        session_id: sessionId,
        user_id: userId || 'anonymous',
        role: 'user',
        content: lastUserMessage.content,
      },
      {
        session_id: sessionId,
        user_id: userId || 'anonymous',
        role: 'assistant',
        content: assistantMessage,
      }
    ]);

    // 세션 업데이트
    await supabase
      .from('sessions')
      .upsert({
        session_id: sessionId,
        user_id: userId || 'anonymous',
        last_active: new Date().toISOString(),
        exchange_count: Math.floor(messages.length / 2) + 1,
      }, { onConflict: 'session_id' });

    return res.status(200).json({
      message: assistantMessage,
      sessionId: sessionId,
      exchangeCount: Math.floor(messages.length / 2) + 1,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
