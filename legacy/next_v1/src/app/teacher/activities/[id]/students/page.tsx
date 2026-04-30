'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackLink } from '@/components/ui/back-link';
import { api } from '@/features/activities/activity-helpers';
import { demoMediaAssets } from '@/lib/demo/store';

function evidenceImage(e: any) {
  const asset = demoMediaAssets.find((a: any) => a.id === e.resource_asset_id);
  if (asset?.type === 'image') return asset.url;
  if (typeof e.file_url === 'string' && (e.file_url.startsWith('http') || e.file_url.startsWith('data:image'))) return e.file_url;
  return '';
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

export default function TeacherStudentsPage({ params }: { params: { id: string } }) {
  const [evidences, setEvidences] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Record<string, { score: number; comment: string }>>({});
  const [modal, setModal] = useState('');

  const portfolioEvidences = useMemo(() => evidences.filter((item) => item.in_portfolio), [evidences]);
  const pendingCount = useMemo(() => portfolioEvidences.filter((item) => item.review_status !== 'reviewed').length, [portfolioEvidences]);

  const load = async () => {
    const [ev, pg] = await Promise.all([
      api<any[]>(`/api/activities/${params.id}/evidences`),
      api<any[]>(`/api/activities/${params.id}/progresses`).catch(() => [])
    ]);
    setEvidences(ev);
    setProgress(pg);
    setReviews((prev) => {
      const next = { ...prev };
      ev.filter((item) => item.in_portfolio).forEach((item) => {
        if (!next[item.id]) next[item.id] = { score: item.teacher_score ?? 90, comment: item.teacher_comment ?? '证据链完整，建议补充图像说明。' };
      });
      return next;
    });
  };

  useEffect(() => { load(); }, []);

  const reviewEvidence = async (id: string) => {
    const draft = reviews[id] ?? { score: 90, comment: '' };
    await api(`/api/evidences/${id}`, { method: 'PATCH', body: JSON.stringify({ teacher_score: draft.score, teacher_comment: draft.comment }) });
    setModal('该档案已单独评价，学生端会在对应档案卡片看到分数和评语。');
    load();
  };

  const markExcellent = async (id: string) => {
    await api(`/api/evidences/${id}/excellent`, { method: 'POST' });
    setModal('已设为优秀作品。学生端班级共学页刷新后可见。');
  };

  return (
    <div className="space-y-4">
      <SuccessModal message={modal} onClose={() => setModal('')} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">档案评价</h1>
          <p className="mt-1 text-sm text-muted">待批改 {pendingCount} 条，正式档案作品 {portfolioEvidences.length} 条，证据背包草稿 {evidences.length - portfolioEvidences.length} 条。</p>
        </div>
        <BackLink href="/teacher/dashboard" label="返回教师工作台" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[0.85fr_0.75fr_1.4fr]">
        <Card>
          <h3 className="mb-2 font-semibold">学生证据背包</h3>
          <ul className="space-y-2 text-sm">
            {evidences.map((e) => {
              const img = evidenceImage(e);
              return (
                <li key={e.id} className="rounded border p-2">
                  {img ? <a href={img} target="_blank"><img src={img} alt="证据图片" className="mb-2 h-28 w-full rounded object-cover" /></a> : null}
                  <p>{e.profiles?.name ?? '学生'} / {e.note || e.text_content || '证据记录'}</p>
                  <p className="text-muted">提交时间：{new Date(e.created_at).toLocaleString()}</p>
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{e.in_portfolio ? '正式档案' : '过程草稿'}</span>
                  <div className="mt-2 flex justify-end">
                    <button className="rounded-md border px-3 py-1 text-xs text-primary" onClick={() => markExcellent(e.id)}>设为优秀作品</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">点位完成记录</h3>
          <ul className="space-y-1 text-sm">{progress.map((p) => <li key={p.id}>{p.profiles?.name ?? '学生'} / {p.activity_sites?.name ?? '点位'} / {new Date(p.completed_at).toLocaleString()}</li>)}</ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="font-semibold">逐条档案评价</h3>
          {portfolioEvidences.map((work) => {
            const review = reviews[work.id] ?? { score: work.teacher_score ?? 90, comment: work.teacher_comment ?? '' };
            return (
              <div key={work.id} className="rounded-xl border bg-slate-50 p-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{work.profiles?.name ?? '学生'} / {work.note || work.text_content || work.observation || '作品记录'}</p>
                    <p className="mt-1 text-xs text-muted">状态：已提交 · {work.review_status === 'reviewed' ? '已批改' : '待批改'}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${work.review_status === 'reviewed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {work.review_status === 'reviewed' ? '已批改' : '待批改'}
                  </span>
                </div>
                <input className="mt-2 w-full rounded border bg-white p-2" type="number" value={review.score} onChange={(e) => setReviews((prev) => ({ ...prev, [work.id]: { ...review, score: Number(e.target.value) } }))} />
                <textarea className="mt-2 w-full rounded border bg-white p-2" value={review.comment} onChange={(e) => setReviews((prev) => ({ ...prev, [work.id]: { ...review, comment: e.target.value } }))} />
                <div className="mt-2 flex justify-end">
                  <Button onClick={() => reviewEvidence(work.id)}>提交本条评价</Button>
                </div>
              </div>
            );
          })}
          {!portfolioEvidences.length ? <p className="text-sm text-muted">暂无正式加入学习档案的作品。</p> : null}
        </Card>
      </div>
    </div>
  );
}
