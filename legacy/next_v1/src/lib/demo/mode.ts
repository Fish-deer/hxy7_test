export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isDemoMode() {
  return process.env.FORCE_DEMO_MODE === '1' || !isSupabaseConfigured();
}

export function isAIConfigured() {
  return Boolean(
    process.env.OPENAI_API_KEY || 
    process.env.DEEPSEEK_API_KEY || 
    process.env.XFYUN_API_PASSWORD ||
    (process.env.XFYUN_API_KEY && process.env.XFYUN_API_SECRET)
  );
}
