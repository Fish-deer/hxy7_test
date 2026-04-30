import fs from 'fs';
import path from 'path';

const root = process.cwd();
const envLocal = path.join(root, '.env.local');
const envExample = path.join(root, '.env.local.example');

if (!fs.existsSync(envLocal) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envLocal);
  console.log('[setup] 已创建 .env.local');
}

console.log('[setup] 完成。未配置 Supabase 时将自动进入 Demo Mode。');
