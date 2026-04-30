'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { api } from '@/features/activities/activity-helpers';

export default function TeacherCaseEditPage({ params }: { params: { caseId: string } }) {
  const [item, setItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    api<any[]>('/api/teacher/cases').then((list) => {
      const c = list.find((x) => x.id === params.caseId);
      setItem(c);
      setForm(c || {});
    });
  }, [params.caseId]);

  const save = async () => {
    await api(`/api/teacher/cases/${params.caseId}`, { method: 'PATCH', body: JSON.stringify(form) });
    const list = await api<any[]>('/api/teacher/cases');
    setItem(list.find((x) => x.id === params.caseId));
  };

  if (!item) return <div className="text-sm text-muted">加载中...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">案例编辑页</h1>
        <BackLink href="/teacher/cases" label="返回上一页" />
      </div>
      <Card className="space-y-2">
        <h3 className="font-semibold">基础信息</h3>
        {form.cover_image ? <img src={form.cover_image} alt={form.title || '案例封面'} className="h-44 w-full rounded-lg object-cover" /> : null}
        <input className="w-full rounded border p-2" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="案例名称" />
        <input className="w-full rounded border p-2" value={form.cover_image || ''} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="封面图 URL" />
        <textarea className="w-full rounded border p-2" rows={3} value={form.summary || ''} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="案例简介" />
        <div className="flex justify-end">
          <Button onClick={save}>保存基础信息</Button>
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold">路线与点位</h3>
          <p className="mt-1 text-sm text-muted">进入点位编辑页可新增/排序/编辑点位及简介。</p>
          <Link href={`/teacher/cases/${params.caseId}/sites`} className="mt-2 inline-block text-sm text-primary">打开点位编辑</Link>
        </Card>
        <Card>
          <h3 className="font-semibold">点位资源库</h3>
          <p className="mt-1 text-sm text-muted">支持图片、视频、音频、文本、PPT/PDF/链接以及图注说明。</p>
          <Link href={`/teacher/cases/${params.caseId}/resources`} className="mt-2 inline-block text-sm text-primary">打开资源管理</Link>
        </Card>
      </div>

      <Card><h3 className="font-semibold">点位任务</h3><p className="text-sm text-muted">可在教师任务页选择本案例后发布路线任务。</p><Link href="/teacher/tasks" className="text-sm text-primary">去发布任务</Link></Card>
    </div>
  );
}
