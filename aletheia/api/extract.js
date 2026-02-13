import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { EXTRACTION_PROMPT, ESSENCE_PROMPT } from '../lib/extraction-prompt.js';

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
    const { sessionId, mode } = req.body;
    // mode: 'extract' (JSON 데이터) 또는 'essence' (읽을 수 있는 문서)

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId required' });
    }

    // 해당 세션의 전체 대화 가져오기
    const { data: conversations, error: dbError } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (dbError) {
      console.error('DB error:', dbError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!conversations || conversations.length < 6) {
      return res.status(200).json({
        status: 'insufficient',
        message: '아직 대화가 충분하지 않습니다. 조금 더 이야기를 나눠보세요.',
        exchange_count: conversations ? Math.floor(conversations.length / 2) : 0,
        minimum_needed: 4,
      });
    }

    // 대화를 텍스트로 변환
    const conversationText = conversations
      .map(c => `[${c.role === 'user' ? '사용자' : 'Aletheia'}]: ${c.content}`)
      .join('\n\n');

    const exchangeCount = Math.floor(conversations.length / 2);

    if (mode === 'essence') {
      // --- Essence Document 생성 모드 ---

      // 먼저 추출 데이터 가져오기 (있으면)
      const { data: snapshots } = await supabase
        .from('essence_snapshots')
        .select('data')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);

      const existingData = snapshots && snapshots.length > 0 ? JSON.stringify(snapshots[0].data) : '없음';

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: ESSENCE_PROMPT,
        messages: [
          {
            role: 'user',
            content: `대화 기록:\n${conversationText}\n\n이전 추출 데이터:\n${existingData}\n\n위 대화를 기반으로 Essence Document를 생성하세요. 대화 횟수: ${exchangeCount}회.`
          }
        ],
      });

      const essenceDocument = response.content[0].text;

      // Essence Document 저장
      await supabase.from('essence_documents').insert({
        session_id: sessionId,
        user_id: conversations[0].user_id,
        content: essenceDocument,
        exchange_count: exchangeCount,
      });

      return res.status(200).json({
        status: 'success',
        mode: 'essence',
        document: essenceDocument,
        exchange_count: exchangeCount,
      });

    } else {
      // --- 추출 모드 (JSON 데이터) ---

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: EXTRACTION_PROMPT,
        messages: [
          {
            role: 'user',
            content: `다음 대화를 분석하고 Essence 데이터를 추출하세요.\n\n${conversationText}`
          }
        ],
      });

      const extractedText = response.content[0].text;

      // JSON 파싱
      let parsed;
      try {
        const jsonMatch = extractedText.match(/```json\n?([\s\S]*?)\n?```/)
          || extractedText.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : extractedText);
      } catch {
        parsed = { raw: extractedText, parse_error: true };
      }

      // 스냅샷 저장
      await supabase.from('essence_snapshots').insert({
        session_id: sessionId,
        user_id: conversations[0].user_id,
        data: parsed,
        exchange_count: exchangeCount,
      });

      return res.status(200).json({
        status: 'success',
        mode: 'extract',
        essence: parsed,
        exchange_count: exchangeCount,
      });
    }

  } catch (error) {
    console.error('Extract API error:', error);
    return res.status(500).json({ error: 'Extraction failed. Please try again.' });
  }
}
