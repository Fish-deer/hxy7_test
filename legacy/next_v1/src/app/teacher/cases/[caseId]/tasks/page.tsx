'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { api } from '@/features/activities/activity-helpers';
import { demoSites } from '@/lib/demo/store';

function SuccessModal({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-xl">
        <p className="text-lg font-semibold">操作成功</p>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <Button className="mt-4 w-full" onClick={onClose}>确定</Button>
      </div>
    </div>
  );
}

export default function TeacherCaseTasksPage({ params }: { params: { caseId: string } }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [siteId, setSiteId] = useState('site-1');
  const [modal, setModal] = useState('');

  const load = async () => setTasks(await api<any[]>(`/api/teacher/tasks?case_id=${params.caseId}`));
  useEffect(() => { load(); }, [params.caseId]);

  const add = async () => {
    if (!title.trim()) return;
    await api('/api/teacher/tasks', { method: 'POST', body: JSON.stringify({ case_id: params.caseId, site_id: siteId, phase: 'visit', title, description: '新任务', required_assets: [], key_clue_assets: [], status: 'published' }) });
    setTitle('');
    setModal('任务发布成功。学生端刷新后可以看到最新任务。');
    load();
  };

  const update = async (id: string, patch: any) => {
    await api(`/api/teacher/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    setModal('任务更新成功。');
    load();
  };

  const remove = async (id: string) => {
    await api(`/api/teacher/tasks/${id}`, { method: 'DELETE' });
    setModal('任务删除成功。学生端刷新后将不再显示。');
    load();
  };

  return (
    <div className="space-y-4">
      <SuccessModal message={modal} onClose={() => setModal('')} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">案例任务配置</h1>
          <p className="mt-1 text-sm text-muted">为案例点位配置任务，保存后学生端刷新即可读取最新任务。</p>
        </div>
        <BackLink href="/teacher/dashboard" label="返回上一页" />
      </div>
      <Card className="space-y-2">
        <div className="grid gap-2 md:grid-cols-2">
          <select className="rounded border p-2" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            {demoSites.filter((s: any) => s.case_id === params.caseId).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="rounded border p-2" placeholder="任务标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button onClick={add}>新增任务</Button>
        </div>
      </Card>
      <div className="grid gap-3 lg:grid-cols-2">
        {tasks.map((t: any) => (
          <Card key={t.id} className="space-y-2">
            <input className="w-full rounded border p-2" value={t.title} onChange={(e) => update(t.id, { title: e.target.value })} />
            <textarea className="w-full rounded border p-2" rows={2} value={t.description} onChange={(e) => update(t.id, { description: e.target.value })} />
            <input className="w-full rounded border p-2" value={(t.required_assets || []).join(',')} onChange={(e) => update(t.id, { required_assets: e.target.value.split(',').filter(Boolean) })} placeholder="推荐资源ID，逗号分隔" />
            <input className="w-full rounded border p-2" value={(t.key_clue_assets || []).join(',')} onChange={(e) => update(t.id, { key_clue_assets: e.target.value.split(',').filter(Boolean) })} placeholder="关键线索资源ID" />
            <div className="flex justify-end">
              <Button className="bg-rose-600" onClick={() => remove(t.id)}>删除任务</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
