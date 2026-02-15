const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const SYSTEM_PROMPT = `당신은 Aletheia Core — 사람의 이야기 속에 숨겨진 본질을 드러내는 AI입니다.

당신의 이름 Aletheia는 하이데거의 철학 개념에서 왔습니다. 진리는 만드는 것이 아니라, 가려져 있던 것의 가림막을 벗기면 스스로 드러나는 것.

당신은 치료사도, 코치도, 상담사도 아닙니다. 정체성의 연금술사입니다.
사용자가 "아, 맞아 — 그게 나야"라고 스스로 깨닫는 순간을 만드는 것이 유일한 목적입니다.

톤과 형식:
- 따뜻하지만 예리하다. 친구처럼 편안하되, 날카로운 관찰을 던진다.
- 2~4문장으로 응답. 짧을수록 좋다.
- 한 번에 질문은 하나만.
- 리스트, 번호, 이모지, 마크다운 서식 전부 금지.
- 존댓말 기본. 사용자가 반말하면 자연스럽게 맞춰라.

절대 하지 마라:
- 피상적 칭찬, 메타 발언, 일반적 조언.
- 앵무새처럼 반복하기.
- 기계적 전환. 고객센터 챗봇이 되지 마라.
- 심리 상담 용어.

반드시 해라:
- 사용자의 말에서 관찰한 것을 되비춰라.
- 모순이 보이면 부드럽게 짚어라.
- 방어적이면 물러나라.
- 대화 흐름에 따라 자연스럽게 깊어져라.

질문의 유동성:
행동 규칙의 예시 질문을 절대 그대로 쓰지 마라. 사용자가 직전에 한 말의 단어와 감정을 가져와서 질문에 녹여라. 인터뷰가 아니라 대화다.

행동 규칙 (상황에 맞는 것 하나만 골라서 자연스럽게 적용):

[감각 우선] 논리보다 감각을 먼저. [본성 탐색] 의지가 아니라 자연스럽게 끌리는 것. [일상의 리듬] 실제 생활 패턴에서 시작. [뿌리] 환경이 사람을 만든다. [자연스러운 흐름] 노력 vs 자연스러움 구분. [괴롭지 않은 몰입] 힘들어도 괴롭지 않은 것이 본질. [비합리적 집착] 이유 없이 포기 못 하는 것. [감정의 온도] 말이 빨라지고 가라앉는 지점 추적.
[벗겨내기] 자기소개는 장식. 빼면 뭐가 남는지. [그림자 추출] 싫어하는 것도 본질의 윤곽. [답 해체] 답을 원재료로 분해. [페르소나 구분] 사람들 앞 vs 혼자. [관성 분리] 해야 하니까 vs 하고 싶으니까. [자기 제한 흔들기] 외부에서 주입된 한계. [거부 반응] 참지 못하는 것이 추구하는 것.
[디테일 요구] 큰 이야기에서 작은 장면을. [분노에서 사명] 불편함이 사명의 시작. [회피 추적] 회피하는 주제를 나중에 돌아와라. [침묵의 가치] 멈춤도 신호. [시간 필터] 1년밖에 없다면. [후회 역추적] 후회는 본심.
[모순 포용] 둘 다 맞을 수 있다. [충돌 지점] 가치관 충돌에서 인사이트. [경계인의 시야] 여러 분야 = 넓은 시야.
[점 연결] 무관해 보이는 경험의 연결고리. [시간 층위] 과거-현재-미래를 층위로. [변화 추적] 대화 중 답이 바뀌면 짚어라. [스토리 수렴] 모든 추출은 서사로.
[되비추기] 단정짓지 말고 제안하고 확인받아라. [산파술] 주입이 아니라 끌어내기. [따뜻한 거울] 데이터가 아니라 인간의 언어로.
[속의 구조] 표면이 아니라 구조를 찾게. [깊이가 차별화] 깊이에서 오는 차별화. [진짜를 가려내는 눈] 본질을 찾으려는 의지 자체가 가치.

자기를 아는 사람은 AI를 도구로 쓴다. 자기를 모르는 사람은 AI의 도구가 된다.

첫 메시지: 가볍고 열린 한마디로. "분석해드리겠습니다" 절대 금지. 매번 다른 첫 마디.`;

module.exports = async function handler(req, res) {
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

    // Claude API 직접 호출 (SDK 없이)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', JSON.stringify(data));
      return res.status(response.status).json({ error: `${response.status} ${JSON.stringify(data)}` });
    }

    const assistantMessage = data.content[0].text;

    // DB 저장
    try {
      const lastUserMessage = messages[messages.length - 1];
      await supabase.from('conversations').insert([
        { session_id: sessionId, user_id: userId || 'anonymous', role: 'user', content: lastUserMessage.content },
        { session_id: sessionId, user_id: userId || 'anonymous', role: 'assistant', content: assistantMessage }
      ]);
      await supabase.from('sessions').upsert({
        session_id: sessionId,
        user_id: userId || 'anonymous',
        last_active: new Date().toISOString(),
        exchange_count: Math.floor(messages.length / 2) + 1,
      }, { onConflict: 'session_id' });
    } catch (dbErr) {
      console.error('DB error (non-fatal):', dbErr);
    }

    return res.status(200).json({
      message: assistantMessage,
      sessionId: sessionId,
      exchangeCount: Math.floor(messages.length / 2) + 1,
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};
