'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { BackLink } from '@/components/ui/back-link';
import { ChatBox } from '@/features/ai/chat-box';
import { EvidenceUpload } from '@/features/evidences/evidence-upload';
import { api } from '@/features/activities/activity-helpers';

const resourceTabs = [
  { id: 'image', label: '图集' },
  { id: 'video', label: '视频' },
  { id: 'audio', label: '音频' },
  { id: 'text', label: '文本' },
  { id: 'ppt', label: '附件' }
] as const;

function displaySiteName(site: any) {
  return site.id === 'site-2' ? '矿坑露天观景台' : site.name;
}

function displayTaskTitle(task: any) {
  return task.site_id === 'site-2' ? '矿坑结构观察' : task.title;
}

function assetImage(evidence: any, mediaAssets: any[]) {
  const asset = mediaAssets.find((item) => item.id === evidence.resource_asset_id);
  if (asset?.type === 'image') return asset.url;
  if (typeof evidence.file_url === 'string' && (evidence.file_url.startsWith('http') || evidence.file_url.startsWith('data:image'))) return evidence.file_url;
  return '';
}

export function SiteExplorer({ site, sites, tasks, mediaAssets, evidences }: any) {
  const [assetType, setAssetType] = useState<'image' | 'video' | 'audio' | 'text' | 'ppt'>('image');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [done, setDone] = useState(evidences.length > 0);
  const [notice, setNotice] = useState('');
  const [viewedTypes, setViewedTypes] = useState<string[]>([]);

  const filtered = useMemo(() => mediaAssets.filter((x: any) => x.type === assetType), [mediaAssets, assetType]);
  const firstVideo = mediaAssets.find((x: any) => x.type === 'video');
  const firstAudio = mediaAssets.find((x: any) => x.type === 'audio');
  const textAssets = mediaAssets.filter((x: any) => x.type === 'text');
  const attachmentAssets = mediaAssets.filter((x: any) => x.type === 'ppt' || x.type === 'pdf' || x.type === 'link');

  const openType = (type: typeof assetType) => {
    setAssetType(type);
    setViewedTypes((prev) => Array.from(new Set([...prev, type])));
  };

  const quoteToBackpack = async (assetId: string) => {
    await api('/api/evidences', {
      method: 'POST',
      body: JSON.stringify({
        activity_id: 'demo-activity-1',
        case_id: site.case_id,
        site_id: site.id,
        task_id: tasks[0]?.id ?? null,
        evidence_type: 'resource_image',
        resource_asset_id: assetId,
        note: '引用案例资源作为证据',
        in_portfolio: false,
        review_status: 'draft'
      })
    });
    setDone(true);
    setNotice('点位已完成');
  };

  const onSubmitted = () => {
    setDone(true);
    setNotice('点位已完成');
  };

  return (
    <div className="app-grid app-grid-3">
      <aside className="space-y-3">
        <div className="flex justify-end">
          <BackLink href="/student/activities/demo-activity-1/visit" label="返回上一级页面" />
        </div>
        <Card>
          <h3 className="font-semibold">路线导航</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {sites.map((s: any) => <li key={s.id}><Link className={s.id === site.id ? 'font-semibold text-primary' : 'text-muted'} href={`/student/sites/${s.id}`}>{s.order_index}. {displaySiteName(s)}</Link></li>)}
          </ul>
        </Card>
        <Card>
          <h3 className="font-semibold">当前任务</h3>
          <ul className="mt-2 space-y-2 text-sm">{tasks.map((t: any) => <li key={t.id}><p className="font-medium">{displayTaskTitle(t)}</p><p className="text-xs text-muted">{t.description}</p></li>)}</ul>
        </Card>
      </aside>

      <section className="space-y-3">
        <Card className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{displaySiteName(site)}</h1>
              <p className="mt-1 text-sm text-muted">{site.intro}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{done ? '已完成' : '待完成'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {resourceTabs.map((tab) => (
              <button key={tab.id} onClick={() => openType(tab.id as any)} className={`rounded-full px-3 py-1 text-xs ${assetType === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {assetType === 'image' ? (
            <div className="grid gap-2 md:grid-cols-2">
              {filtered.map((img: any) => (
                <div key={img.id} className="space-y-1 rounded-xl border bg-white p-2">
                  <img src={img.url} alt={img.title} className="h-44 w-full cursor-zoom-in rounded-lg object-cover" onClick={() => setPreviewImage(img.url)} />
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate">{site.id === 'site-2' ? '矿坑露天观景台' : img.title}</span>
                    <button className="shrink-0 text-primary" onClick={() => quoteToBackpack(img.id)}>引用到证据背包</button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {assetType === 'video' && firstVideo ? <video controls src={firstVideo.url} onPlay={() => openType('video')} className="h-64 w-full rounded-lg bg-black" /> : null}
          {assetType === 'audio' && firstAudio ? <audio controls src={firstAudio.url} onPlay={() => openType('audio')} className="w-full" /> : null}
          {assetType === 'text' ? <div className="space-y-2">{textAssets.map((x: any) => <p key={x.id} className="rounded bg-slate-50 p-3 text-sm">{x.content}</p>)}</div> : null}
          {assetType === 'ppt' ? <div className="grid gap-2">{attachmentAssets.map((x: any) => <a key={x.id} className="rounded-xl border bg-slate-50 p-3 text-sm text-primary" href={x.url} target="_blank">{x.title}</a>)}</div> : null}

          <p className="rounded bg-indigo-50 p-2 text-sm"><span className="font-semibold">观察点：</span>{site.teacher_hint}</p>
          <p className="text-xs text-muted">已浏览资源类型：{viewedTypes.length ? viewedTypes.map((type) => resourceTabs.find((tab) => tab.id === type)?.label).filter(Boolean).join('、') : '等待浏览'}</p>
        </Card>

        <EvidenceUpload activityId="demo-activity-1" siteId={site.id} onSubmitted={onSubmitted} />
      </section>

      <aside className="space-y-3">
        <ChatBox title="AI 导游" activityId="demo-activity-1" siteId={site.id} phase="visit" />
        <ChatBox title="AI 探究教练" activityId="demo-activity-1" siteId={site.id} phase="research" />
        <Card>
          <h3 className="font-semibold">已提交证据</h3>
          <div className="mt-2 space-y-2 text-sm">
            {evidences.map((e: any) => {
              const img = assetImage(e, mediaAssets);
              return (
                <div key={e.id} className="rounded-xl border bg-slate-50 p-2">
                  {img ? <img src={img} alt="证据图片" className="mb-2 h-24 w-full cursor-zoom-in rounded-lg object-cover" onClick={() => setPreviewImage(img)} /> : null}
                  <p>{e.note || e.text_content || '文本证据'}</p>
                  <p className="mt-1 text-xs text-muted">提交时间：{new Date(e.created_at).toLocaleString()}</p>
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{e.in_portfolio ? '已加入学习档案' : '证据背包草稿'}</span>
                </div>
              );
            })}
            {!evidences.length ? <p className="text-sm text-muted">暂无提交记录。</p> : null}
          </div>
        </Card>
      </aside>

      {notice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-white p-5 text-center shadow-xl">
            <p className="text-lg font-semibold">{notice}</p>
            <p className="mt-2 text-sm text-muted">任务中心和我的活动会同步显示该点位为已完成。</p>
            <button className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white" onClick={() => setNotice('')}>确定</button>
          </div>
        </div>
      ) : null}

      {previewImage ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-6" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-h-full max-w-full rounded-xl object-contain" alt="预览" />
        </div>
      ) : null}
    </div>
  );
}
