'use client';

import { useEffect, useState } from 'react';
import { api } from './activity-helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ClassItem { id: string; name: string }
interface SiteItem { id: string; name: string; order_index: number }
interface TaskItem { id: string; phase: string; title: string }

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

export function TeacherActivityEditor({ activityId }: { activityId: string }) {
  const [siteName, setSiteName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [phase, setPhase] = useState<'learn' | 'research' | 'visit'>('learn');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [classData, siteData, taskData] = await Promise.all([
      api<ClassItem[]>('/api/admin/classes').catch(() => []),
      api<SiteItem[]>(`/api/activities/${activityId}/sites`),
      api<TaskItem[]>(`/api/activities/${activityId}/tasks`)
    ]);
    setClasses(classData);
    setSites(siteData);
    setTasks(taskData);
  };

  useEffect(() => {
    load();
  }, [activityId]);

  const toggleClass = (id: string) => {
    setSelectedClassIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const bindClassesAndSync = async () => {
    await api(`/api/activities/${activityId}/classes`, { method: 'POST', body: JSON.stringify({ class_ids: selectedClassIds }) });
    const result = await api<{ synced: number }>(`/api/activities/${activityId}/members/sync`, { method: 'POST' });
    setMsg(`班级绑定成功，已同步 ${result.synced} 名学生到活动成员`);
  };

  const addSite = async () => {
    if (!siteName.trim()) return;
    await api(`/api/activities/${activityId}/sites`, {
      method: 'POST',
      body: JSON.stringify({
        name: siteName,
        order_index: sites.length + 1,
        intro: '请补充简介',
        knowledge_text: '',
        key_facts: '',
        problem_chain: [{ level: '核心问题', content: '你观察到了什么？' }],
        evidence_checklist: ['拍摄1张照片', '写下1条说明']
      })
    });
    setSiteName('');
    setMsg('点位已添加');
    load();
  };

  const addTask = async () => {
    if (!taskTitle.trim()) return;
    await api(`/api/activities/${activityId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ phase, title: taskTitle, description: '请完成任务要求', task_type: 'mixed', sort_order: tasks.length + 1, required: true })
    });
    setTaskTitle('');
    setMsg('任务已添加');
    load();
  };

  const publish = async () => {
    await api(`/api/activities/${activityId}/publish`, { method: 'POST' });
    setMsg('活动已发布');
  };

  return (
    <div className="space-y-3">
      <SuccessModal message={msg} onClose={() => setMsg('')} />
      <Card className="space-y-2">
        <h3 className="font-semibold">1) 绑定班级并同步学生</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {classes.map((x) => (
            <label key={x.id} className="flex items-center gap-2 rounded border p-2">
              <input type="checkbox" checked={selectedClassIds.includes(x.id)} onChange={() => toggleClass(x.id)} />
              {x.name}
            </label>
          ))}
        </div>
        <Button onClick={bindClassesAndSync}>绑定并同步活动成员</Button>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">2) 配置点位</h3>
        <input className="w-full rounded border p-2" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="点位名称" />
        <Button onClick={addSite}>添加点位</Button>
        <ul className="text-sm text-muted">{sites.map((s) => <li key={s.id}>{s.order_index}. {s.name}</li>)}</ul>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">3) 配置任务</h3>
        <select className="w-full rounded border p-2" value={phase} onChange={(e) => setPhase(e.target.value as any)}>
          <option value="learn">学</option>
          <option value="research">研</option>
          <option value="visit">游</option>
        </select>
        <input className="w-full rounded border p-2" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="任务标题" />
        <Button onClick={addTask}>添加任务</Button>
        <ul className="text-sm text-muted">{tasks.map((t) => <li key={t.id}>{t.phase} / {t.title}</li>)}</ul>
      </Card>

      <Button onClick={publish}>4) 发布活动</Button>
      {msg ? <p className="text-sm text-green-600">{msg}</p> : null}
    </div>
  );
}
