-- ==========================================
-- ALETHEIA DATABASE SETUP
-- Supabase Dashboard → SQL Editor에서 실행
-- ==========================================

-- 1. 대화 기록 테이블
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT DEFAULT 'anonymous',
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_time ON conversations(created_at);

-- 2. 세션 관리 테이블
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id TEXT DEFAULT 'anonymous',
  display_name TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now(),
  exchange_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived'))
);

CREATE INDEX idx_sessions_user ON sessions(user_id);

-- 3. Essence 스냅샷 테이블 (추출 엔진 JSON 결과)
CREATE TABLE essence_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT DEFAULT 'anonymous',
  data JSONB NOT NULL,
  exchange_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_snapshots_session ON essence_snapshots(session_id);

-- 4. Essence Document 테이블 (사람이 읽을 수 있는 문서)
CREATE TABLE essence_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT DEFAULT 'anonymous',
  content TEXT NOT NULL,
  exchange_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_session ON essence_documents(session_id);

-- ==========================================
-- 완료! 4개 테이블이 생성되었습니다.
-- ==========================================
