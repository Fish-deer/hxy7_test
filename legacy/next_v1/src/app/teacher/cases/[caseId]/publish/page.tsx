'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { api } from '@/features/activities/activity-helpers';

export default function TeacherCasePublishPage({ params }: { params: { caseId: string } }) {
  const [item, setItem] = useState<any>(null);
  const [classes, setClasses] = useState('class-7a');

  const load = async () => {
    const list = await api<any[]>('/api/teacher/cases');
    setItem(list.find((x) => x.id === params.caseId));
  };
  useEffect(() => { load(); }, [params.caseId]);

  const publish = async () => { await api(`/api/teacher/cases/${params.caseId}/publish`, { method: 'POST', body: JSON.stringify({ status: 'published', class_ids: classes.split(',').map((x) => x.trim()).filter(Boolean) }) }); load(); };
  const draft = async () => { await api(`/api/teacher/cases/${params.caseId}/publish`, { method: 'POST', body: JSON.stringify({ status: 'draft' }) }); load(); };

  if (!item) return <div className="text-sm text-muted">加载中...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">发布到班级页</h1>
        <BackLink href="/teacher/dashboard" label="返回上一页" />
      </div>
      <Card className="space-y-2 text-sm">
        <p>案例：{item.title}</p>
        <p>当前状态：{item.status}</p>
        <input className="w-full rounded border p-2" value={classes} onChange={(e) => setClasses(e.target.value)} placeholder="班级ID，逗号分隔" />
        <div className="flex justify-end gap-2">
          <Button onClick={publish}>发布到班级</Button>
          <Button className="bg-slate-600" onClick={draft}>转为草稿</Button>
        </div>
      </Card>
    </div>
  );
}
