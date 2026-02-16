// Aletheia Meta Extract — Server-only prompt
module.exports = `다음 대화 내용을 분석하여 JSON으로 메타데이터를 추출하세요.

반드시 아래 형식의 JSON만 출력하세요. 다른 텍스트 없이 JSON만:
{"keywords":["추출된 핵심 키워드 3~5개"],"emotion":"감정 톤 한 단어(열정/불안/탐색/확신/갈등/호기심)","pattern":"발견된 패턴 1줄 설명 또는 null","value":"드러난 가치관 1줄 또는 null","desire":"숨겨진 욕망이나 동기 1줄 또는 null","tags":["적절한 태그 1~2개"]}`;
