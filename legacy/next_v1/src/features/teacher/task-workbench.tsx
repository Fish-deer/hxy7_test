'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/features/activities/activity-helpers';

interface TaskItem {
  id: string;
  case_id?: string;
  site_id?: string;
  phase: 'learn' | 'research' | 'visit';
  title: string;
  description?: string;
  class_ids?: string[];
  due_at?: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface CaseItem {
  id: string;
  title: string;
}

const ROUTE_TEMPLATES = [
  { title: '序厅：黄石矿冶历史总览', site_id: 'site-1' },
  { title: '矿坑结构观察', site_id: 'site-2' },
  { title: '矿车与采矿机械观察', site_id: 'site-3' },
  { title: '工业精神故事采集', site_id: 'site-4' },
  { title: '生态修复与城市转型提案', site_id: 'site-5' }
];

function classNameFor(item: ClassItem) {
  const names: Record<string, string> = {
    'class-7a': '七年级 1 班',
    'class-7b': '七年级 2 班',
    'class-8a': '八年级 1 班'
  };
  return names[item.id] ?? item.name;
}

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

export function TeacherTaskWorkbench() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [caseId, setCaseId] = useState('');
  const [routeTitle, setRouteTitle] = useState(ROUTE_TEMPLATES[1].title);
  const [customRoute, setCustomRoute] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [phase, setPhase] = useState<TaskItem['phase']>('visit');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState('');
  const [modal, setModal] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [taskData, classData, caseData] = await Promise.all([
      api<TaskItem[]>('/api/teacher/tasks').catch(() => []),
      api<ClassItem[]>('/api/admin/classes').catch(() => []),
      api<CaseItem[]>('/api/teacher/cases').catch(() => [])
    ]);
    setTasks(taskData);
    setClasses(classData);
    setCases(caseData);
    if (!caseId && caseData[0]) setCaseId(caseData[0].id);
    if (!selectedClassIds.length && classData[0]) setSelectedClassIds([classData[0].id]);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleClass = (id: string) => {
    setSelectedClassIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const resetForm = () => {
    setRouteTitle(ROUTE_TEMPLATES[1].title);
    setCustomRoute('');
    setDescription('');
    setDueAt('');
    setPhase('visit');
    setEditingId('');
    setSelectedClassIds(classes[0] ? [classes[0].id] : []);
  };

  const saveTask = async () => {
    const selectedRoute = routeTitle === '__custom__' ? customRoute.trim() : routeTitle;
    if (!selectedRoute || !caseId || selectedClassIds.length === 0) {
      setError('请选择案例、任务和发布班级。');
      return;
    }
    setError('');
    const template = ROUTE_TEMPLATES.find((item) => item.title === routeTitle);
    const payload = {
      activity_id: 'demo-activity-1',
      case_id: caseId,
      site_id: template?.site_id ?? 'site-1',
      phase,
      title: selectedRoute,
      description,
      due_at: dueAt,
      class_ids: selectedClassIds,
      status: 'published',
      required_assets: template?.site_id === 'site-2' ? ['m6', 'm7', 'm8'] : [],
      key_clue_assets: template?.site_id === 'site-2' ? ['m7'] : []
    };

    if (editingId) {
      await api(`/api/teacher/tasks/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setModal('任务已更新，学生端刷新后会读取最新内容。');
    } else {
      await api('/api/teacher/tasks', { method: 'POST', body: JSON.stringify(payload) });
      setModal('任务发布成功，只有被选中的班级能在学生端看到该任务。');
    }
    resetForm();
    await load();
  };

  const editTask = (task: TaskItem) => {
    setEditingId(task.id);
    const matched = ROUTE_TEMPLATES.find((item) => item.title === task.title || item.site_id === task.site_id);
    setRouteTitle(matched ? matched.title : '__custom__');
    setCustomRoute(matched ? '' : task.title);
    setDescription(task.description ?? '');
    setDueAt(task.due_at ?? '');
    setCaseId(task.case_id ?? cases[0]?.id ?? '');
    setPhase(task.phase);
    setSelectedClassIds(task.class_ids ?? []);
  };

  const removeTask = async (id: string) => {
    await api(`/api/teacher/tasks/${id}`, { method: 'DELETE' });
    setModal('任务删除成功，学生端刷新后将不再显示该任务。');
    await load();
  };

  return (
    <div className="space-y-4">
      <SuccessModal message={modal || error} onClose={() => { setModal(''); setError(''); }} />

      <Card className="space-y-3 bg-gradient-to-br from-sky-50 to-white">
        <h3 className="font-semibold">发布课堂任务</h3>
        <p className="text-sm text-muted">选择案例、点位任务和目标班级；发布后会真实写入所选班级的任务列表。</p>
        <div className="grid gap-2 md:grid-cols-2">
          <select className="rounded border p-2" value={caseId} onChange={(e) => setCaseId(e.target.value)}>
            {cases.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <select className="rounded border p-2" value={routeTitle} onChange={(e) => setRouteTitle(e.target.value)}>
            {ROUTE_TEMPLATES.map((item) => <option key={item.title} value={item.title}>{item.title}</option>)}
            <option value="__custom__">自定义任务</option>
          </select>
          {routeTitle === '__custom__' ? <input className="rounded border p-2 md:col-span-2" value={customRoute} onChange={(e) => setCustomRoute(e.target.value)} placeholder="输入自定义任务名称" /> : null}
          <select className="rounded border p-2" value={phase} onChange={(e) => setPhase(e.target.value as TaskItem['phase'])}>
            <option value="learn">课前学习</option>
            <option value="visit">现场云游</option>
            <option value="research">课后探究</option>
          </select>
          <input className="rounded border p-2" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </div>
        <textarea className="w-full rounded border p-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="任务说明" />
        <div className="grid gap-2 text-sm md:grid-cols-3">
          {classes.map((item) => (
            <label key={item.id} className="flex items-center gap-2 rounded-xl border bg-white p-3">
              <input type="checkbox" checked={selectedClassIds.includes(item.id)} onChange={() => toggleClass(item.id)} />
              <span>{classNameFor(item)}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={saveTask}>{editingId ? '更新任务' : '发布任务'}</Button>
          {editingId ? <button className="rounded-md border px-4 py-2 text-sm" onClick={resetForm}>取消编辑</button> : null}
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {tasks.map((task) => (
          <Card key={task.id} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted">{task.phase.toUpperCase()}{task.due_at ? ` · 截止 ${task.due_at}` : ''}</p>
                <h3 className="font-semibold">{task.site_id === 'site-2' ? '矿坑结构观察' : task.title}</h3>
              </div>
              <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">学生刷新可见</span>
            </div>
            <p className="text-sm text-muted">{task.description}</p>
            <p className="text-xs text-muted">发布班级：{(task.class_ids ?? []).map((id) => classNameFor({ id, name: id })).join('、') || '未选择'}</p>
            <div className="flex gap-2">
              <button className="rounded-md border px-3 py-1 text-sm text-primary" onClick={() => editTask(task)}>编辑</button>
              <button className="rounded-md border px-3 py-1 text-sm text-red-600" onClick={() => removeTask(task.id)}>删除</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
