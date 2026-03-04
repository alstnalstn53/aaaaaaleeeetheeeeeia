const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const EXTRACTION_PROMPT = `당신은 Aletheia의 추출 엔진 v2입니다.
사용자와의 대화 기록을 분석하여, 그 사람의 본질을 구조화된 데이터로 추출합니다.

[추출 원칙]
- 추측하지 마라. 대화에서 직접적 근거가 있는 것만.
- 근거가 약하면 confidence를 낮게.
- 바넘 효과 경계 — 누구에게나 맞는 말 금지.
- 이 사람에게만 해당되는 구체적인 것을 추출해라.
- 빈 칸은 빈 칸으로 둬라.

[대화 LAYER 기반 추출]
대화는 3개의 층위로 진행된다:
- Surface(표면): 취향, 취미, 관심사 → likes, dislikes, energy_map
- Context(맥락): 배경, 경험, 전환점 → childhood, education, career, turning_points
- Essence(본질): 패턴, 모순, 핵심 성향 → patterns, shadow, contradictions, essence_draft

각 층위에서 드러난 데이터를 해당 필드에 정확히 매핑하라.

[결과물 연동]
이 추출 데이터는 최종적으로 4가지 결과물의 재료가 된다:
1. 본질 초상화 (Essence Portrait) — essence_draft
2. 내가 생각하는 나 vs 발견된 나 — self_image + gap
3. 당신의 스토리 — narrative_seeds + connections
4. 가능성 맵 — patterns + energy_map + motivations

반드시 아래 JSON 형식만 출력해라. 다른 텍스트 없이 JSON만.

{
  "snapshot_version": "v2",
  "conversation_depth": "shallow|medium|deep",
  "exchange_count": 0,
  "layer_reached": "surface|context|essence",
  "likes": ["좋아하는 것들 — 취미, 취향, 음악, 음식, 장소, 활동"],
  "dislikes": ["싫어하는 것들"],
  "childhood": ["어린 시절 경험/이야기"],
  "education": ["전공/공부/배운 것"],
  "career": ["직업/경험 히스토리"],
  "turning_points": ["결정적으로 바뀐 순간"],
  "values": [{"value": "", "evidence": "", "confidence": 0.0}],
  "patterns": [{"pattern": "", "frequency": 0, "context": "", "interpretation": ""}],
  "avoidance": [{"topic": "", "signal": "", "confidence": 0.0}],
  "motivations": [{"surface": "", "deeper": "", "deepest": "", "confidence": 0.0}],
  "contradictions": [{"a": "", "b": "", "tension": ""}],
  "energy_map": {"high": [], "low": [], "spike": []},
  "shadow": [{"hidden": "", "mask": "", "evidence": "", "confidence": 0.0}],
  "connections": [{"dots": [], "thread": "", "confidence": 0.0}],
  "self_image": "상대가 자기를 어떻게 정의했는지 또는 null",
  "gap": "self_image와 실제 발견된 패턴 사이의 차이 또는 null",
  "narrative_seeds": [],
  "essence_draft": {"one_line": "", "paragraph": "", "confidence": 0.0},
  "story_arc": "어린 시절 → 경험 → 현재를 관통하는 서사 한 문단 또는 null",
  "possibility_directions": ["본질에서 도출된 구체적 방향성/가능성"],
  "next_exploration": [],
  "style": "반말|존댓말|캐주얼|영어|스페인어",
  "language": "ko|en|es"
}`;

const ESSENCE_PROMPT = `당신은 Aletheia의 Essence Document 생성기 v2입니다.
대화를 기반으로 상대의 스토리를 만드세요.

이것은 분석 보고서가 아니라 서사(narrative)다.
상대가 "재미있는 대화를 했을 뿐"인데, 결과적으로 놀라운 스토리가 나오는 것. 그게 Aletheia의 마법이다.

[작성 원칙]
- 태그 나열이 아니라 서사로 써라.
- 확정이 아니라 현재 버전의 스냅샷.
- 따뜻하지만 날카롭게. 예리하되 잔인하지 않게.
- 바넘 효과 문장 절대 금지 — 누구에게나 맞는 말은 쓸모없다.
- 구체적 발언과 취향에 근거한 서술만.
- 상대가 "아, 맞아 — 그게 나야"라고 느끼는 수준.

[출력 형식]

# 본질 초상화 (Essence Portrait)

## 한 줄
[이 사람을 관통하는 한 문장. "당신은 ~인 사람이다."]

## 서사
[어린 시절부터 현재까지를 관통하는 하나의 맥. 구체적 취향/경험에 근거. 3~5문장.]

## 핵심 가치
[대화에서 반복적으로 드러난 가치관 2~4개. 각각 근거와 함께.]

---

# 내가 생각하는 나 vs 발견된 나 (Self vs Discovered)

## 자기 정의
[상대가 스스로를 어떻게 정의했는지 — 대화에서 직접 인용]

## 발견된 나
[Aletheia가 대화를 통해 발견한 것 — 상대가 미처 보지 못한 패턴]

## 교차점과 갭
[자기 인식과 실제 패턴 사이의 일치점과 차이. 2~3문장.]

---

# 당신의 스토리 (Your Story)

[단절된 것 같은 경험들이 실은 하나로 연결된다는 발견.
"~였던 아이가, ~를 거쳐, 지금 ~에 서 있다" 형식의 서사.
4~6문장.]

---

# 에너지 지도 (Energy Map)

## 올라가는 것
[에너지가 솟는 순간/활동/주제]

## 내려가는 것
[에너지가 빠지는 순간/활동/주제]

## 반복 패턴
[무의식적으로 반복하는 행동/선택 패턴]

---

# 가능성 맵 (Possibility Map)

[스토리에서 도출된 방향성. 구체적이어야 한다. "가능성은 무한합니다" 같은 건 쓸모없다.
상대의 본질 + 패턴 + 에너지를 기반으로 3~5가지 구체적 방향 제시.
각 방향마다: 왜 적합한가(본질 근거), 구체적 실행 아이디어, 주의할 점.]

---

# 아직 탐색이 필요한 것

[빈 칸으로 남은 영역. 더 대화하면 발견할 수 있는 것들. 2~3가지.]

---

이것은 현재 버전의 스냅샷입니다. 맞는 부분과 다른 부분을 알려주세요.`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sessionId, mode } = req.body;

    const { data: conversations } = await supabase
      .from('conversations').select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (!conversations || conversations.length < 6) {
      return res.status(200).json({
        status: 'insufficient',
        message: '아직 대화가 충분하지 않습니다.',
        exchange_count: conversations ? Math.floor(conversations.length / 2) : 0,
      });
    }

    const conversationText = conversations
      .map(function(c) { return '[' + (c.role === 'user' ? '사용자' : 'Aletheia') + ']: ' + c.content; })
      .join('\n\n');

    const exchangeCount = Math.floor(conversations.length / 2);
    const prompt = mode === 'essence' ? ESSENCE_PROMPT : EXTRACTION_PROMPT;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: prompt,
        messages: [{ role: 'user', content: '다음 대화를 분석하세요.\n\n' + conversationText }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const result = data.content[0].text;

    if (mode === 'essence') {
      try {
        await supabase.from('essence_documents').insert({
          session_id: sessionId, user_id: conversations[0].user_id,
          content: result, exchange_count: exchangeCount,
        });
      } catch (e) { console.error('DB error:', e); }
      return res.status(200).json({ status: 'success', mode: 'essence', document: result, exchange_count: exchangeCount });
    } else {
      let parsed;
      try {
        const m = result.match(/```json\n?([\s\S]*?)\n?```/) || result.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(m ? (m[1] || m[0]) : result);
      } catch (e) { parsed = { raw: result }; }
      try {
        await supabase.from('essence_snapshots').insert({
          session_id: sessionId, user_id: conversations[0].user_id,
          data: parsed, exchange_count: exchangeCount,
        });
      } catch (e) { console.error('DB error:', e); }
      return res.status(200).json({ status: 'success', mode: 'extract', essence: parsed, exchange_count: exchangeCount });
    }
  } catch (error) {
    console.error('Extract error:', error);
    return res.status(500).json({ error: error.message });
  }
};
