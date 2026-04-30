'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { api } from '@/features/activities/activity-helpers';

export default function TeacherCaseSitesPage({ params }: { params: { caseId: string } }) {
  const [sites, setSites] = useState<any[]>([]);
  const [name, setName] = useState('');

  const load = async () => setSites((await api<any[]>(`/api/teacher/sites?case_id=${params.caseId}`)).sort((a, b) => a.order_index - b.order_index));
  useEffect(() => { load(); }, [params.caseId]);

  const add = async () => {
    await api('/api/teacher/sites', { method: 'POST', body: JSON.stringify({ case_id: params.caseId, route_id: 'route-hs-main', name, intro: '新点位简介' }) });
    setName('');
    load();
  };

  const update = async (id: string, patch: any) => { await api(`/api/teacher/sites/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }); load(); };
  const remove = async (id: string) => { await api(`/api/teacher/sites/${id}`, { method: 'DELETE' }); load(); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">点位编辑页</h1>
        <BackLink href="/teacher/cases" label="返回上一页" />
      </div>
      <Card className="space-y-2">
        <input className="w-full rounded border p-2" placeholder="新增点位名称" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={add}>新增点位</Button>
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {sites.map((s) => (
          <Card key={s.id} className="space-y-2">
            <input className="w-full rounded border p-2" value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} />
            <textarea className="w-full rounded border p-2" rows={2} value={s.intro} onChange={(e) => update(s.id, { intro: e.target.value })} />
            <textarea className="w-full rounded border p-2" rows={2} value={s.ai_context} onChange={(e) => update(s.id, { ai_context: e.target.value })} placeholder="问题链/AI上下文" />
            <div className="flex justify-end">
              <Button className="bg-rose-600" onClick={() => remove(s.id)}>删除点位</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
