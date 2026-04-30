'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === '1';

function setDemoRole(role: 'student' | 'teacher' | 'admin', userId: string) {
  document.cookie = `demo_role=${role}; path=/`;
  document.cookie = `demo_user_id=${userId}; path=/`;
}

export function LoginForm() {
  const router = useRouter();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const gotoByRole = (role: string) => {
    if (role === 'student') router.push('/student/activities');
    else if (role === 'teacher') router.push('/teacher/dashboard');
    else router.push('/admin/users');
    router.refresh();
  };

  const onLogin = async () => {
    setError('');
    const normalizedAccount = account.trim();
    if (!normalizedAccount || !password) {
      setError('请输入账号和密码。');
      return;
    }
    setLoading(true);

    if (isDemoMode) {
      try {
        const json = await fetch('/api/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account: normalizedAccount, password })
        }).then((r) => r.json());
        if (!json.success) {
          setError(json.message || '登录失败，请检查账号和密码。');
          return;
        }
        setDemoRole(json.data.role as 'student' | 'teacher' | 'admin', json.data.id);
        gotoByRole(json.data.role);
      } catch {
        setError('登录失败，请稍后再试。');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const supabase = createClient();
      const email = normalizedAccount.includes('@') ? normalizedAccount : `${normalizedAccount}@demo.local`;
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) {
        setError('账号或密码不正确。');
        return;
      }
      const me = await fetch('/api/me').then((r) => r.json());
      gotoByRole(me.data.role);
    } catch {
      setError('登录失败，请检查账号或系统配置。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] rounded-3xl border border-white/60 bg-white/88 p-7 shadow-2xl shadow-slate-950/25 backdrop-blur-xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="黄小游" className="h-11 w-11 rounded-xl object-cover shadow-sm" />
          <div>
            <p className="text-sm font-semibold text-sky-700">课堂云游学习平台</p>
            <p className="text-xs text-slate-500">Huangxiaoyou Learning Journey</p>
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-normal text-slate-950">登录黄小游</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">使用管理员分配的账号和密码进入对应的学生、教师或管理空间。</p>
      </div>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">账号</span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            placeholder="请输入账号，如 student / teacher / admin"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">密码</span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onLogin();
            }}
          />
        </label>
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
        <Button className="w-full py-3 text-base" onClick={onLogin} disabled={loading}>
          {loading ? '正在登录...' : '登录'}
        </Button>
        <p className="text-center text-xs leading-5 text-slate-500">体验账号：student / teacher / admin，默认密码：123456</p>
      </div>
    </div>
  );
}
