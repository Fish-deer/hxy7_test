'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PageTitle } from '@/components/layout/page-title';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/features/activities/activity-helpers';
import { TeacherActivityEditor } from '@/features/activities/teacher-editor';

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === '1';

export function NewActivityClient() {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [activityId, setActivityId] = useState('');

  const create = async () => {
    const data = await api<any>('/api/activities', {
      method: 'POST',
      body: JSON.stringify({ title, theme, description: '研学活动说明' })
    });
    setActivityId(data.id);
  };

  if (isDemoMode) {
    return (
      <div className="space-y-3">
        <PageTitle title="教师驾驶舱" desc="可直接查看活动概览、学生进度与作品证据" />
        <Card className="space-y-2">
          <p className="text-sm text-muted">当前为课堂预置数据，可直接进行配置与演示。</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/student/activities/demo-activity-1" className="text-primary">查看活动概览</Link>
            <Link href="/teacher/activities/demo-activity-1/students" className="text-primary">查看学生进度与作品</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <PageTitle title="教师活动管理" desc="创建活动并继续编辑点位、任务、班级成员" />
      <Card className="space-y-2">
        <input className="w-full rounded border p-2" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="活动名称" />
        <input className="w-full rounded border p-2" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="活动主题" />
        <Button onClick={create}>创建活动</Button>
      </Card>
      {activityId ? <TeacherActivityEditor activityId={activityId} /> : null}
    </div>
  );
}
