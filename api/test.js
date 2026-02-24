module.exports = function handler(req, res) {
  var results = { status: 'ok', node: process.version };

  // Test ALL requires from chat.js
  var prompts = ['core','interpret','meta','interpret-analysis','essence-document','business-proposal','brand-guide','cafe-proposal'];
  prompts.forEach(function(p) {
    try {
      require('./_prompts/' + p);
      results['prompt_' + p] = 'ok';
    } catch (e) {
      results['prompt_' + p] = 'FAIL: ' + e.message;
    }
  });

  // Test supabase
  try {
    require('@supabase/supabase-js');
    results.supabase = 'ok';
  } catch (e) {
    results.supabase = 'FAIL: ' + e.message;
  }

  // Test loading chat.js itself
  try {
    require('./chat');
    results.chat_module = 'ok';
  } catch (e) {
    results.chat_module = 'FAIL: ' + e.message;
  }

  // Env vars
  results.has_anthropic_key = !!process.env.ANTHROPIC_API_KEY;
  results.has_supabase_url = !!process.env.SUPABASE_URL;
  results.has_supabase_key = !!process.env.SUPABASE_KEY;
  results.has_fetch = typeof fetch !== 'undefined';

  return res.status(200).json(results);
};
