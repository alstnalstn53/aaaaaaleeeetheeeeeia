module.exports = function handler(req, res) {
  var results = { status: 'ok', node: process.version };

  // Test 1: supabase require
  try {
    require('@supabase/supabase-js');
    results.supabase = 'ok';
  } catch (e) {
    results.supabase = 'FAIL: ' + e.message;
  }

  // Test 2: prompts require
  try {
    require('./_prompts/core');
    results.prompts_core = 'ok';
  } catch (e) {
    results.prompts_core = 'FAIL: ' + e.message;
  }

  // Test 3: env vars
  results.has_anthropic_key = !!process.env.ANTHROPIC_API_KEY;
  results.has_supabase_url = !!process.env.SUPABASE_URL;

  // Test 4: fetch available
  results.has_fetch = typeof fetch !== 'undefined';

  return res.status(200).json(results);
};
