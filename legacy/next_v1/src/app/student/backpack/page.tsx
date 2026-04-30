'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { demoSites, demoMediaAssets, demoTasks } from '@/lib/demo/store';
import { api } from '@/features/activities/activity-helpers';

function imageForEvidence(e: any) {
  const asset = demoMediaAssets.find((a) => a.id === e.resource_asset_id);
  if (asset?.type === 'image') return asset.url;
  if (typeof e.file_url === 'string' && (e.file_url.startsWith('http') || e.file_url.startsWith('data:image'))) return e.file_url;
  return '';
}

export default function BackpackPage() {
  const [evidences, setEvidences] = useState<any[]>([]);

  const load = async () => {
    setEvidences(await api<any[]>('/api/activities/demo-activity-1/evidences').catch(() => []));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    await api(`/api/evidences/${id}`, { method: 'DELETE' });
    setEvidences((x) => x.filter((e) => e.id !== id));
  };

  const patch = async (id: string, payload: any) => {
    const data = await api<any>(`/api/evidences/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    setEvidences((rows) => rows.map((r) => (r.id === id ? data : r)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <BackLink href="/student/activities" label="返回我的活动" />
      </div>
      <div className="mx-auto max-w-5xl rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5">
        <h1 className="text-2xl font-bold">证据背包</h1>
        <p className="mt-1 text-sm text-muted">这里保存草稿和过程性记录，不显示教师批改；加入学习档案后才会成为正式内容。</p>
      </div>
      <div className="mx-auto grid max-w-5xl gap-3">
        {evidences.map((e) => {
          const site = demoSites.find((s) => s.id === e.site_id);
          const task = demoTasks.find((t) => t.id === e.task_id || t.site_id === e.site_id);
          const img = imageForEvidence(e);
          return (
            <Card key={e.id} className="space-y-2">
              <div className="grid gap-3 lg:grid-cols-3">
                <div>
                  <p className="text-xs text-muted">图片预览</p>
                  {img ? <a href={img} target="_blank"><img src={img} alt="证据图片" className="mt-1 h-36 w-full rounded object-cover" /></a> : <div className="mt-1 rounded-lg bg-slate-50 p-4 text-sm text-muted">文字证据</div>}
                </div>
                <div className="space-y-2 text-sm lg:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p><span className="font-semibold">点位：</span>{site?.name ?? '活动记录'}</p>
                    <span className={e.in_portfolio ? 'rounded-full bg-sky-50 px-2 py-1 text-xs text-sky-700' : 'rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600'}>
                      {e.in_portfolio ? '已加入学习档案' : '背包草稿'}
                    </span>
                  </div>
                  <p><span className="font-semibold">任务：</span>{task?.title ?? '未关联任务'}</p>
                  <p className="text-xs text-muted">提交时间：{new Date(e.created_at).toLocaleString()}</p>
                  {e.text_content ? <p className="rounded bg-slate-50 p-2">{e.text_content}</p> : null}
                  <textarea className="w-full rounded border p-2" defaultValue={e.observation || ''} placeholder="我的观察" onBlur={(ev) => patch(e.id, { observation: ev.target.value })} />
                  <textarea className="w-full rounded border p-2" defaultValue={e.explanation || ''} placeholder="我的解释" onBlur={(ev) => patch(e.id, { explanation: ev.target.value })} />
                  <textarea className="w-full rounded border p-2" defaultValue={e.conclusion || ''} placeholder="我的结论" onBlur={(ev) => patch(e.id, { conclusion: ev.target.value })} />
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button onClick={() => patch(e.id, { in_portfolio: true })}>加入学习档案</Button>
                    <Button className="bg-slate-500" onClick={() => remove(e.id)}>删除证据</Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {!evidences.length ? <Card className="text-sm text-muted">暂无证据记录。</Card> : null}
      </div>
    </div>
  );
}
