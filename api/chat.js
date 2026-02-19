// Aletheia Chat API — Mode-based prompt selection (server-side only)
const { createClient } = require('@supabase/supabase-js');

// Load prompts (server-side only — never exposed to frontend)
const PROMPTS = {
  core: require('./_prompts/core'),
  interpret: require('./_prompts/interpret'),
  meta_extract: require('./_prompts/meta'),
  interpret_analysis: require('./_prompts/interpret-analysis'),
  essence_document: require('./_prompts/essence-document'),
  business_proposal: require('./_prompts/business-proposal'),
  brand_guide: require('./_prompts/brand-guide'),
  cafe_proposal: require('./_prompts/cafe-proposal')
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mode, messages, max_tokens, sessionId, userId } = req.body;

    // Select prompt based on mode (frontend only sends mode string)
    const systemPrompt = PROMPTS[mode];
    if (!systemPrompt) {
      return res.status(400).json({ error: { message: 'Invalid mode: ' + mode } });
    }

    // Call Claude API directly (no SDK)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 600,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();

    // Save to Supabase (non-blocking)
    if (supabase && sessionId) {
      const aiText = data.content ? data.content.map(c => c.type === 'text' ? c.text : '').join('') : '';
      const lastUserMsg = messages.length > 0 ? messages[messages.length - 1].content : '';
      supabase.from('conversations').insert({
        session_id: sessionId,
        user_id: userId || 'anon',
        mode: mode,
        user_message: lastUserMsg,
        ai_response: aiText,
        created_at: new Date().toISOString()
      }).then(() => {}).catch(() => {});
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: { message: error.message } });
  }
};
