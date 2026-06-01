
(function () {
  const cfg = window.JAGUAR_CONFIG || {};
  const looksConfigured =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("ضع_") &&
    !cfg.SUPABASE_ANON_KEY.includes("ضع_");

  window.JAGUAR_IS_CONFIGURED = Boolean(looksConfigured);

  if (looksConfigured && window.supabase) {
    window.jaguarSupabase = window.supabase.createClient(
      cfg.SUPABASE_URL,
      cfg.SUPABASE_ANON_KEY
    );
  } else {
    window.jaguarSupabase = null;
  }
})();
