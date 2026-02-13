import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, sessionId, userId } = req.method === 'GET' ? req.query : req.body;

    switch (action) {
      // 특정 세션의 대화 기록
      case 'conversation': {
        const { data } = await supabase
          .from('conversations')
          .select('role, content, created_at')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        return res.status(200).json({ conversations: data || [] });
      }

      // 사용자의 세션 목록
      case 'sessions': {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId || 'anonymous')
          .order('last_active', { ascending: false });

        return res.status(200).json({ sessions: data || [] });
      }

      // 최신 Essence 스냅샷
      case 'snapshot': {
        const { data } = await supabase
          .from('essence_snapshots')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        return res.status(200).json({
          snapshot: data && data.length > 0 ? data[0] : null
        });
      }

      // 최신 Essence Document
      case 'essence': {
        const { data } = await supabase
          .from('essence_documents')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        return res.status(200).json({
          document: data && data.length > 0 ? data[0] : null
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('History API error:', error);
    return res.status(500).json({ error: 'Failed to retrieve data' });
  }
}
