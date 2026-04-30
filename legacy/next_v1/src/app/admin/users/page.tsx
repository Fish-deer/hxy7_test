'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/features/activities/activity-helpers';

type UserForm = {
  name: string;
  account: string;
  password: string;
  role: string;
  class_id: string;
  class_ids: string[];
};

function makePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const pick = (source: string) => source[Math.floor(Math.random() * source.length)];
  const required = [pick('ABCDEFGHJKLMNPQRSTUVWXYZ'), pick('abcdefghijkmnopqrstuvwxyz'), pick('23456789'), pick('!@#$%')];
  while (required.length < 12) required.push(pick(chars));
  return required.sort(() => Math.random() - 0.5).join('');
}

function classNameFor(item: any) {
  const names: Record<string, string> = {
    'class-7a': '七年级 1 班',
    'class-7b': '七年级 2 班',
    'class-8a': '八年级 1 班'
  };
  return names[item.id] ?? item.name;
}

const emptyForm: UserForm = { name: '', account: '', password: '123456', role: 'student', class_id: '', class_ids: [] };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');

  const admins = useMemo(() => users.filter((user) => user.role === 'admin'), [users]);
  const teachers = useMemo(() => users.filter((user) => user.role === 'teacher'), [users]);
  const students = useMemo(() => users.filter((user) => user.role === 'student'), [users]);

  const load = async () => {
    const [userData, classData] = await Promise.all([
      api<any[]>('/api/admin/users').catch(() => []),
      api<any[]>('/api/admin/classes').catch(() => [])
    ]);
    setUsers(userData);
    setClasses(classData);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId('');
  };

  const toggleTeacherClass = (id: string) => {
    setForm((prev) => {
      const classIds = prev.class_ids.includes(id) ? prev.class_ids.filter((item) => item !== id) : [...prev.class_ids, id];
      return { ...prev, class_ids: classIds, class_id: classIds[0] ?? '' };
    });
  };

  const saveUser = async () => {
    const classIds = form.role === 'teacher' ? form.class_ids : [form.class_id].filter(Boolean);
    const payload = { ...form, account: form.account.trim(), email: form.account.trim(), class_id: classIds[0] ?? '', class_ids: classIds };
    if (editingId) {
      await api(`/api/admin/users/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setMessage('账号信息已更新，教师端刷新后会同步新的班级绑定。');
    } else {
      await api('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) });
      setMessage('账号创建成功，可直接用账号和初始密码登录。');
    }
    resetForm();
    load();
  };

  const resetUserPassword = async (user: any) => {
    const nextPassword = makePassword();
    window.alert(`${user.name} 的新密码：${nextPassword}`);
    await api(`/api/admin/users/${user.id}/password`, { method: 'POST', body: JSON.stringify({ password: nextPassword }) });
    window.alert('重置成功');
    setMessage(`${user.account ?? user.email} 的密码已随机重置。`);
    load();
  };

  const editUser = (user: any) => {
    const classIds = user.role === 'teacher' ? (user.class_ids ?? (Array.isArray(user.classes) ? user.classes.map((item: any) => item.id) : [user.class_id].filter(Boolean))) : [];
    setEditingId(user.id);
    setForm({ name: user.name ?? '', account: user.account ?? user.email ?? '', password: user.password ?? '123456', role: user.role, class_id: user.class_id ?? classIds[0] ?? '', class_ids: classIds });
  };

  const deleteUser = async (id: string) => {
    await api(`/api/admin/users/${id}`, { method: 'DELETE' });
    setMessage('账号已删除。');
    load();
  };

  const userClassText = (user: any) => {
    if (user.role === 'teacher') {
      const list = Array.isArray(user.classes) ? user.classes : [];
      return list.length ? list.map(classNameFor).join('、') : '未绑定班级';
    }
    return user.classes ? classNameFor(user.classes) : '未绑定班级';
  };

  const renderUser = (user: any) => (
    <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3 text-sm">
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="mt-1 text-xs text-muted">账号：{user.id === 'demo-admin-1' ? 'admin' : (user.account ?? user.email)} · {user.role} · {userClassText(user)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-md border px-3 py-1 text-primary" onClick={() => editUser(user)}>编辑</button>
        <button className="rounded-md border px-3 py-1 text-primary" onClick={() => resetUserPassword(user)}>重置密码</button>
        {user.role !== 'admin' ? <button className="rounded-md border px-3 py-1 text-red-600" onClick={() => deleteUser(user.id)}>删除</button> : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">账号管理</h1>
        <p className="mt-1 text-sm text-muted">创建教师和学生账号，维护班级绑定；教师账号支持同时绑定多个班级。</p>
      </div>
      {message ? <Card className="border-green-200 bg-green-50 text-sm text-green-700">{message}</Card> : null}

      <Card className="space-y-3">
        <h3 className="font-semibold">{editingId ? '编辑账号' : '创建账号'}</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded border p-2" placeholder="姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded border p-2" placeholder="账号" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} />
          <input className="rounded border p-2" placeholder="初始密码" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="rounded border p-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, class_id: '', class_ids: [] })}>
            <option value="student">学生</option>
            <option value="teacher">教师</option>
          </select>
        </div>
        {form.role === 'teacher' ? (
          <div className="grid gap-2 text-sm md:grid-cols-3">
            {classes.map((item) => (
              <label key={item.id} className="flex items-center gap-2 rounded-xl border bg-white p-3">
                <input type="checkbox" checked={form.class_ids.includes(item.id)} onChange={() => toggleTeacherClass(item.id)} />
                <span>{classNameFor(item)}</span>
              </label>
            ))}
          </div>
        ) : (
          <select className="w-full rounded border p-2" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
            <option value="">请选择绑定班级</option>
            {classes.map((item) => <option key={item.id} value={item.id}>{classNameFor(item)}</option>)}
          </select>
        )}
        <div className="flex justify-end gap-2">
          {editingId ? <button className="rounded-md border px-4 py-2 text-sm" onClick={resetForm}>取消编辑</button> : null}
          <Button onClick={saveUser}>{editingId ? '保存账号' : '创建账号'}</Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-2">
          <h3 className="font-semibold">管理员账号</h3>
          {admins.map(renderUser)}
          <h3 className="pt-3 font-semibold">教师账号</h3>
          {teachers.map(renderUser)}
        </Card>
        <Card className="space-y-2">
          <h3 className="font-semibold">学生账号</h3>
          {students.map(renderUser)}
        </Card>
      </div>
    </div>
  );
}
