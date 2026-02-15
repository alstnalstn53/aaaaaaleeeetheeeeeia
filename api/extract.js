const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

const anthropic = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const EXTRACTION_PROMPT = `당신은 Aletheia의 추출 엔진입니다.
사용자와의 대화 기록을 분석하여, 그 사람의 본질을 구조화된 데이터로 추출합니다.

규칙:
- 추측하지 마라. 대화에서 직접적 근거가 있는 것만.
- 근거가 약하면 confidence를 낮게.
- 바넘 효과 경계 — 누구에게나 맞는 말 금지.
- 이 사람에게만 해당되는 구체적인 것을 추출해라.
- 빈 칸은 빈 칸으로 둬라.

반드시 아래 JSON 형식만 출력해라. 다른 텍스트 없이 JSON만.

{
  "snapshot_version": "v1",
  "conversation_depth": "shallow | medium | deep",
  "exchange_count": 0,
  "values": [{ "value": "", "evidence": "", "confidence": 0.0 }],
  "patterns": [{ "pattern": "", "frequency": 0, "context": "", "interpretation": "" }],
  "avoidance": [{ "topic": "", "signal": "", "confidence": 0.0 }],
  "motivations": [{ "surface": "", "deeper": "", "deepest": "", "confidence": 0.0 }],
  "contradictions": [{ "a": "", "b": "", "tension": "" }],
  "energy_map": { "high": [], "low": [], "spike": [] },
  "shadow": [{ "hidden": "", "mask": "", "evidence": "", "confidence": 0.0 }],
  "connections": [{ "dots": [], "thread": "", "confidence": 0.0 }],
  "narrative_seeds": [],
  "essence_draft": { "one_line": "", "paragraph": "", "confidence": 0.0 },
  "next_exploration": []
}`;

const ESSENCE_PROMPT = `당신은 Aletheia의 Essence Document 생성기입니다.
추출된 데이터와 대화를 기반으로, 사람이 읽을 수 있는 Essence Document를 생성하세요.

규칙:
- 태그 나열이 아니라 서사로 써라.
- 확정이 아니라 현재 버전의 스냅샷.
- 따뜻하지만 정확하게.
- 바넘 효과 문장 절대 금지.

출력 형식 (마크다운):

# Essence Snapshot

## 한 줄
[이 사람을 한 문장으로]

## 서사
[3~5문장. 이 사람이 누구인지를 이야기로.]

## 핵심 가치
[가장 확실한 2~4개. 각각 한 줄.]

## 에너지 지도
[에너지가 올라가는 것 / 내려가는 것]

## 반복 패턴
[무의식적으로 반복하는 것들]

## 아직 탐색이 필요한 것
[빈 칸. 솔직하게.]

---
이것은 확정이 아니라 현재 버전입니다.
맞는 부분과 다른 부분을 알려주세요.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, mode } = req.body;

    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!conversations || conversations.length < 6) {
      return res.status(200).json({
        status: 'insufficient',
        message: '아직 대화가 충분하지 않습니다. 조금 더 이야기를 나눠보세요.',
        exchange_count: conversations ? Math.floor(conversations.length / 2) : 0,
      });
    }

    const conversationText = conversations
      .map(c => `[${c.role === 'user' ? '사용자' : 'Aletheia'}]: ${c.content}`)
      .join('\n\n');

    const exchangeCount = Math.floor(conversations.length / 2);
    const prompt = mode === 'essence' ? ESSENCE_PROMPT : EXTRACTION_PROMPT;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: prompt,
      messages: [{ role: 'user', content: `다음 대화를 분석하세요.\n\n${conversationText}` }],
    });

    const result = response.content[0].text;

    if (mode === 'essence') {
      try {
        await supabase.from('essence_documents').insert({
          session_id: sessionId,
          user_id: conversations[0].user_id,
          content: result,
          exchange_count: exchangeCount,
        });
      } catch (e) { console.error('DB save error:', e); }

      return res.status(200).json({ status: 'success', mode: 'essence', document: result, exchange_count: exchangeCount });
    } else {
      let parsed;
      try {
        const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/) || result.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : result);
      } catch { parsed = { raw: result }; }

      try {
        await supabase.from('essence_snapshots').insert({
          session_id: sessionId,
          user_id: conversations[0].user_id,
          data: parsed,
          exchange_count: exchangeCount,
        });
      } catch (e) { console.error('DB save error:', e); }

      return res.status(200).json({ status: 'success', mode: 'extract', essence: parsed, exchange_count: exchangeCount });
    }
  } catch (error) {
    console.error('Extract error:', error);
    return res.status(500).json({ error: error.message || 'Extraction failed' });
  }
};
