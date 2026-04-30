'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { api } from '@/features/activities/activity-helpers';

interface StudentTask {
  id: string;
  site_id?: string;
  phase: string;
  title: string;
  description?: string;
  required_assets?: string[];
  status?: string;
}

interface SiteItem {
  id: string;
  name: string;
}

interface MediaAsset {
  id: string;
  title: string;
}

function taskTitle(task: StudentTask) {
  if (task.site_id === 'site-2') return '矿坑结构观察';
  return task.title;
}

function siteName(site?: SiteItem) {
  if (site?.id === 'site-2') return '矿坑露天观景台';
  return site?.name ?? '';
}

export function StudentTaskList({
  initialTasks,
  doneSiteIds,
  sites,
  mediaAssets
}: {
  initialTasks: StudentTask[];
  doneSiteIds: string[];
  sites: SiteItem[];
  mediaAssets: MediaAsset[];
}) {
  const [tasks, setTasks] = useState<StudentTask[]>(initialTasks);
  const [doneIds, setDoneIds] = useState<string[]>(doneSiteIds);
  const [refreshedAt, setRefreshedAt] = useState('');
  const doneSet = useMemo(() => new Set(doneIds), [doneIds]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const [data, progressData, evidenceData] = await Promise.all([
          api<StudentTask[]>('/api/activities/demo-activity-1/tasks'),
          api<any[]>('/api/activities/demo-activity-1/progresses').catch(() => []),
          api<any[]>('/api/activities/demo-activity-1/evidences').catch(() => [])
        ]);
        if (!alive) return;
        setTasks(data);
        setDoneIds(Array.from(new Set([
          ...doneSiteIds,
          ...progressData.map((item) => item.site_id).filter(Boolean),
          ...evidenceData.map((item) => item.site_id).filter(Boolean)
        ])));
        setRefreshedAt(new Date().toLocaleTimeString());
      } catch {
        // Keep the visible list stable if a background refresh fails.
      }
    };

    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [doneSiteIds]);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-sky-50 px-3 py-2 text-sm text-sky-800">
        学生端会自动刷新任务和点位完成状态{refreshedAt ? `，最近同步 ${refreshedAt}` : '。'}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {tasks.map((task) => {
          const site = sites.find((s) => s.id === task.site_id);
          const done = task.site_id ? doneSet.has(task.site_id) : false;
          const refs = task.site_id === 'site-2'
            ? ['矿坑露天观景台']
            : (task.required_assets ?? []).map((id) => mediaAssets.find((asset) => asset.id === id)?.title).filter(Boolean);

          return (
            <Card key={task.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted">{task.phase.toUpperCase()} 阶段</p>
                <span className={`rounded-full px-2 py-1 text-xs ${done ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {done ? '已完成' : '待完成'}
                </span>
              </div>
              <h3 className="font-semibold">{taskTitle(task)}</h3>
              <p className="text-sm text-muted">{task.description}</p>
              <p className="text-xs">推荐查看资源：{refs.join('、') || '暂无指定资源'}</p>
              <div className="flex items-center justify-between text-xs">
                <span>{task.status === 'published' || !task.status ? '教师已发布' : task.status}</span>
                {site ? <Link className="text-primary" href={`/student/sites/${site.id}`}>前往{siteName(site)}</Link> : null}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
