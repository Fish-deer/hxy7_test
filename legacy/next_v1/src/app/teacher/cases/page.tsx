'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { api } from '@/features/activities/activity-helpers';

export default function TeacherCasesPage() {
  const [cases, setCases] = useState<any[]>([]);

  const load = async () => setCases(await api<any[]>('/api/teacher/cases'));
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => { await api(`/api/teacher/cases/${id}`, { method: 'DELETE' }); load(); };
  const copy = async (id: string) => { await api(`/api/teacher/cases/${id}/copy`, { method: 'POST' }); load(); };
  const toggleStatus = async (c: any) => { await api(`/api/teacher/cases/${c.id}`, { method: 'PATCH', body: JSON.stringify({ status: c.status === 'published' ? 'draft' : 'published' }) }); load(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">案例列表页</h1>
        <BackLink href="/teacher/dashboard" label="返回教师工作台" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Link href="/teacher/cases/new" className="rounded-xl border border-dashed bg-gradient-to-br from-sky-50 to-white p-5 text-primary shadow-sm">
          <p className="text-lg font-semibold">新增案例</p>
          <p className="mt-1 text-sm text-muted">创建后会同步出现在案例列表和发布任务的“选择案例”中。</p>
        </Link>
        {cases.map((c) => (
          <Card key={c.id}>
            <img src={c.cover_image} alt={c.title} className="h-40 w-full rounded-lg object-cover" />
            <h3 className="mt-2 font-semibold">{c.title}</h3>
            <p className="text-sm text-muted">{c.summary}</p>
            <p className="mt-1 text-xs">状态：{c.status} / 版本：v{c.version}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Link href={`/teacher/cases/${c.id}/edit`} className="text-primary">编辑案例</Link>
            </div>
            <div className="mt-2 flex gap-2">
              <Button className="px-3 py-1 text-xs" onClick={() => toggleStatus(c)}>{c.status === 'published' ? '转为草稿' : '发布'}</Button>
              <Button className="bg-slate-700 px-3 py-1 text-xs" onClick={() => copy(c.id)}>复制案例</Button>
              <Button className="bg-rose-600 px-3 py-1 text-xs" onClick={() => remove(c.id)}>删除案例</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
