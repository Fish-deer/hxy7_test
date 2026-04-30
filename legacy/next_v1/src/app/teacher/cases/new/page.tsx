'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { api } from '@/features/activities/activity-helpers';

export default function TeacherCaseNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [grade, setGrade] = useState('七年级');
  const [tags, setTags] = useState('工业遗产,生态转型');
  const [period, setPeriod] = useState('2课时');

  const create = async () => {
    const created = await api<any>('/api/teacher/cases', { method: 'POST', body: JSON.stringify({ title, summary, grade, tags, period }) });
    router.push(`/teacher/cases/${created.id}/edit`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">新建案例页</h1>
        <BackLink href="/teacher/cases" label="返回上一页" />
      </div>
      <Card className="space-y-2">
        <input className="w-full rounded border p-2" placeholder="案例名称" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full rounded border p-2" rows={3} placeholder="案例简介" value={summary} onChange={(e) => setSummary(e.target.value)} />
        <div className="grid gap-2 md:grid-cols-3">
          <input className="rounded border p-2" placeholder="适用年级" value={grade} onChange={(e) => setGrade(e.target.value)} />
          <input className="rounded border p-2" placeholder="主题标签" value={tags} onChange={(e) => setTags(e.target.value)} />
          <input className="rounded border p-2" placeholder="推荐课时" value={period} onChange={(e) => setPeriod(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button onClick={create}>创建案例草稿</Button>
        </div>
      </Card>
    </div>
  );
}
