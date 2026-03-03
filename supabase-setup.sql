-- Aletheia v2.0 — Supabase 신규 테이블 생성
-- 기존 conversations 테이블은 유지하고, 아래 테이블들을 추가합니다.
-- Supabase Dashboard > SQL Editor 에서 실행하세요.

-- 1. Discovery 세션 저장
CREATE TABLE IF NOT EXISTS discovery_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  free_response JSONB,
  childhood JSONB,
  scenario JSONB,
  slider_data JSONB,
  behavioral_pattern TEXT,
  before_report JSONB,
  after_report JSONB,
  ai_briefing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 대화 메시지 (Deep Conversation용)
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES discovery_sessions(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  token_cost INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 사용자 토큰 잔액
CREATE TABLE IF NOT EXISTS user_tokens (
  user_id TEXT PRIMARY KEY,
  balance INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 결제 내역
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  amount_usd INTEGER NOT NULL,
  package TEXT NOT NULL,
  tokens_granted INTEGER NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 추출된 패턴 (5축 분석 결과)
CREATE TABLE IF NOT EXISTS extracted_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES discovery_sessions(id),
  analytical REAL,
  creative REAL,
  interpersonal REAL,
  strategic REAL,
  introspective REAL,
  temporal JSONB,
  contradictions JSONB,
  behavioral_signature JSONB,
  confidence_level REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_conv_messages_session ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_extracted_patterns_session ON extracted_patterns(session_id);
CREATE INDEX IF NOT EXISTS idx_discovery_sessions_user ON discovery_sessions(user_id);
