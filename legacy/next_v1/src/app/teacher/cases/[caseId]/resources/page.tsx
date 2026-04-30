'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { api } from '@/features/activities/activity-helpers';
import { demoSites } from '@/lib/demo/store';

export default function TeacherCaseResourcesPage({ params }: { params: { caseId: string } }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [siteId, setSiteId] = useState('site-1');
  const [type, setType] = useState('image');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');

  const load = async () => setAssets(await api<any[]>(`/api/teacher/media?case_id=${params.caseId}`));
  useEffect(() => { load(); }, [params.caseId]);

  const add = async () => {
    await api('/api/teacher/media', { method: 'POST', body: JSON.stringify({ case_id: params.caseId, site_id: siteId, type, title, url, content }) });
    setTitle(''); setUrl(''); setContent('');
    load();
  };

  const update = async (id: string, patch: any) => { await api(`/api/teacher/media/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }); load(); };
  const remove = async (id: string) => { await api(`/api/teacher/media/${id}`, { method: 'DELETE' }); load(); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">资源管理页（图片/视频/音频/文本/PPT）</h1>
        <BackLink href="/teacher/cases" label="返回上一页" />
      </div>
      <Card className="space-y-2">
        <div className="grid gap-2 md:grid-cols-3">
          <select className="rounded border p-2" value={siteId} onChange={(e) => setSiteId(e.target.value)}>{demoSites.filter((s: any) => s.case_id === params.caseId).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select className="rounded border p-2" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="image">image</option><option value="video">video</option><option value="audio">audio</option><option value="text">text</option><option value="ppt">ppt/pdf/link</option>
          </select>
          <input className="rounded border p-2" placeholder="资源标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <input className="w-full rounded border p-2" placeholder="资源URL（文本可留空）" value={url} onChange={(e) => setUrl(e.target.value)} />
        <textarea className="w-full rounded border p-2" rows={2} placeholder="文本内容或图注说明" value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={add}>新增资源</Button>
        </div>
      </Card>
      <div className="grid gap-3 lg:grid-cols-2">
        {assets.map((a: any) => (
          <Card key={a.id} className="space-y-1">
            <p className="text-xs text-muted">{a.type} / {a.site_id}</p>
            {a.type === 'image' && a.url ? <img src={a.url} alt={a.title} className="h-36 w-full rounded-lg object-cover" /> : null}
            {a.type === 'video' && a.url ? <video controls src={a.url} className="h-36 w-full rounded-lg bg-black" /> : null}
            {a.type === 'audio' && a.url ? <audio controls src={a.url} className="w-full" /> : null}
            <input className="w-full rounded border p-2" value={a.title} onChange={(e) => update(a.id, { title: e.target.value })} />
            <input className="w-full rounded border p-2" value={a.url || ''} onChange={(e) => update(a.id, { url: e.target.value })} />
            <textarea className="w-full rounded border p-2" rows={2} value={a.content || ''} onChange={(e) => update(a.id, { content: e.target.value })} />
            <div className="flex justify-end">
              <Button className="bg-rose-600" onClick={() => remove(a.id)}>删除资源</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
