// Aletheia Founder Analysis — Server-only prompt
// 창업자 모드 전용: 대화에서 창업 분석 데이터 추출
module.exports = `사용자와의 대화 내용을 분석하여 창업자 분석(Founder Analysis) 데이터를 JSON으로 추출하세요.

중요 규칙:
- 대화에서 직접적 근거가 있는 것만 추출하라.
- 대화에서 드러나지 않은 항목은 null로 남겨라. 추측하지 마라.
- 바넘 효과 경계 — 누구에게나 맞는 말 금지.
- 이 사람에게만 해당되는 구체적인 것을 추출해라.

반드시 아래 JSON 형식만 출력하세요. 다른 텍스트 없이 JSON만:

{
  "name": "사용자 이름 또는 null",
  "sector": "창업 분야 (예: 스페셜티 카페) 또는 null",
  "tags": ["대화에서 드러난 핵심 키워드 3-6개"],
  "core": "이 사람을 관통하는 핵심 가치 한 문장 또는 null",
  "coreDesc": "핵심 가치 부연 설명 1-2문장 또는 null",
  "energy": {
    "up": "에너지가 올라가는 순간 또는 null",
    "down": "에너지가 내려가는 순간 또는 null"
  },
  "narrative": "이 사람의 서사 2-3문장 또는 null",
  "golden": {
    "why": {"text": "WHY — 존재 이유 또는 null", "desc": "부연 또는 null"},
    "how": "HOW — 방법론 또는 null",
    "what": "WHAT — 구체적 결과물 또는 null"
  },
  "paradox": {
    "title": "역설적 문장 또는 null",
    "desc": "역설 설명 또는 null"
  },
  "surface": ["표면적으로 보이는 해석들 — 대화에서 드러난 것만"],
  "essence": ["본질적 해석들 — 대화에서 드러난 것만"],
  "pattern": {
    "title": "반복되는 행동 패턴 한 줄 또는 null",
    "desc": "패턴 설명 또는 null",
    "apps": ["패턴이 적용되는 구체적 사례들"]
  },
  "positioning": {
    "self": {"x": 50, "y": 50},
    "others": [{"x": 30, "y": 40, "l": "경쟁자명"}]
  },
  "trajectory": [
    {"y": "시기", "n": "분야", "d": "설명", "now": false}
  ],
  "influences": [
    {"n": "영향 받은 인물/브랜드", "d": "한줄 설명"}
  ],
  "materials": [
    {"name": "재료명", "note": "스펙", "role": "역할", "color": "#hex", "desc": "설명"}
  ],
  "keywords": [
    {"ko": "한글 키워드", "en": "ENGLISH", "desc": "설명"}
  ],
  "spaceScenario": "창업 후 공간/가게를 어떻게 꾸릴지에 대한 시나리오 3-5문장 또는 null"
}

positioning의 x축은 트렌드(0)↔본질(100), y축은 대중(100)↔전문(0).
trajectory의 now:true는 현재 단계.
materials의 color는 재료를 대표하는 색상 hex.
대화에서 언급되지 않은 섹션은 빈 배열 [] 또는 null로.`;
