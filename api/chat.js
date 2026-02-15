const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { system, messages, max_tokens, sessionId, userId } = req.body;

    if (!messages) {
      return res.status(400).json({ error: 'messages required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1024,
        system: system || '',
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // DB 저장
    if (sessionId && messages.length > 0) {
      try {
        const lastUser = messages[messages.length - 1];
        const aiText = data.content.map(function(c) { return c.type === 'text' ? c.text : ''; }).join('');
        await supabase.from('conversations').insert([
          { session_id: sessionId, user_id: userId || 'anonymous', role: 'user', content: typeof lastUser.content === 'string' ? lastUser.content : JSON.stringify(lastUser.content) },
          { session_id: sessionId, user_id: userId || 'anonymous', role: 'assistant', content: aiText }
        ]);
        await supabase.from('sessions').upsert({
          session_id: sessionId, user_id: userId || 'anonymous',
          last_active: new Date().toISOString(),
          exchange_count: Math.floor(messages.length / 2) + 1,
        }, { onConflict: 'session_id' });
      } catch (e) { console.error('DB error:', e); }
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ type: 'error', error: { type: 'server_error', message: error.message } });
  }
};
