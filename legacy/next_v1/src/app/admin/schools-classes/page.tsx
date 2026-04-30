'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/features/activities/activity-helpers';

export default function AdminSchoolClassPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [schoolData, classData] = await Promise.all([
      api<any[]>('/api/admin/schools').catch(() => []),
      api<any[]>('/api/admin/classes').catch(() => [])
    ]);
    setSchools(schoolData);
    setClasses(classData);
  };

  useEffect(() => {
    load();
  }, []);

  const createClass = async () => {
    await api('/api/admin/classes', { method: 'POST', body: JSON.stringify({ name, grade, school_id: schools[0]?.id }) });
    setName('');
    setGrade('');
    setMessage('班级创建成功，邀请码已生成。');
    load();
  };

  const renameClass = async (id: string, currentName: string) => {
    await api(`/api/admin/classes/${id}`, { method: 'PATCH', body: JSON.stringify({ name: `${currentName}（已更新）` }) });
    setMessage('班级名称已更新。');
    load();
  };

  const resetInvite = async (id: string) => {
    await api(`/api/admin/classes/${id}`, { method: 'PATCH', body: JSON.stringify({ reset_invite: true }) });
    setMessage('邀请码已重置。');
    load();
  };

  const deleteClass = async (id: string) => {
    await api(`/api/admin/classes/${id}`, { method: 'DELETE' });
    setMessage('班级已删除。');
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">班级管理</h1>
        <p className="mt-1 text-sm text-muted">维护班级、师生归属，并生成或重置班级邀请码。</p>
      </div>
      {message ? <Card className="border-green-200 bg-green-50 text-sm text-green-700">{message}</Card> : null}

      <Card className="space-y-3">
        <h3 className="font-semibold">新建班级</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded border p-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="班级名称" />
          <input className="rounded border p-2" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="年级" />
        </div>
        <Button onClick={createClass}>新建班级并生成邀请码</Button>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-semibold">班级列表</h3>
        {classes.map((item) => {
          const profiles = item.profiles ?? [];
          return (
            <div key={item.id} className="rounded-xl border bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">{item.grade ?? '未设置年级'} · 邀请码：{item.invite_code ?? '未生成'}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button className="rounded-md border px-3 py-1 text-primary" onClick={() => renameClass(item.id, item.name)}>编辑名称</button>
                  <button className="rounded-md border px-3 py-1 text-primary" onClick={() => resetInvite(item.id)}>重置邀请码</button>
                  <button className="rounded-md border px-3 py-1 text-red-600" onClick={() => deleteClass(item.id)}>删除</button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
                <p className="rounded bg-slate-50 p-2">教师：{profiles.filter((p: any) => p.role === 'teacher').map((p: any) => p.name).join('、') || '暂无'}</p>
                <p className="rounded bg-slate-50 p-2">学生数：{profiles.filter((p: any) => p.role === 'student').length}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
