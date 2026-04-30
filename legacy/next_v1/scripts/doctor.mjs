const missing = [];
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
if (!process.env.OPENAI_API_KEY && !process.env.DEEPSEEK_API_KEY) missing.push('OPENAI_API_KEY/DEEPSEEK_API_KEY (可选)');

if (missing.length) {
  console.log('[doctor] 缺少配置：');
  missing.forEach((x) => console.log(` - ${x}`));
  console.log('[doctor] 不影响启动：系统将使用 Demo Mode。');
} else {
  console.log('[doctor] 配置完整，可使用云服务模式。');
}
