'use client';

import { useEffect, useState } from 'react';
import { BackLink } from '@/components/ui/back-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/features/activities/activity-helpers';

export default function PortfolioPage({ params }: { params: { id: string } }) {
  const [portfolio, setPortfolio] = useState<any>(null);

  const load = async () => {
    const data = await api<any>(`/api/activities/${params.id}/portfolio`);
    setPortfolio(data);
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    await api(`/api/activities/${params.id}/portfolio/generate`, { method: 'POST' });
    load();
  };

  return (
    <div className="space-y-3">
      <BackLink href={`/student/activities/${params.id}`} label="返回活动" />
      <Button onClick={generate}>生成 / 更新学习档案</Button>
      {portfolio ? (
        <Card className="space-y-2 text-sm">
          <h3 className="font-semibold">档案明细</h3>
          {(portfolio.portfolio_items ?? []).map((item: any) => {
            const content = item.content ?? {};
            const img = content.file_url?.startsWith('http') || content.file_url?.startsWith('data:image') ? content.file_url : '';
            const reviewed = content.review_status === 'reviewed';
            return (
              <div key={item.id} className="rounded border bg-slate-50 p-3">
                {img ? <img src={img} alt="证据图片" className="mb-2 h-28 w-40 rounded-lg object-cover" /> : null}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{content.note || content.type || '证据记录'}</p>
                  <span className={`rounded-full px-2 py-1 text-xs ${reviewed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    已提交 · {reviewed ? '已批改' : '待批改'}
                  </span>
                </div>
                <p className="mt-1 text-muted">{content.text || content.text_content || content.observation || '已加入学习档案'}</p>
                <div className="mt-2 grid gap-2 rounded bg-white p-2 text-xs sm:grid-cols-2">
                  <p>分数：{content.teacher_score ?? '暂无分数'}</p>
                  <p>评价：{content.teacher_comment ?? '等待教师评价'}</p>
                </div>
              </div>
            );
          })}
          {!(portfolio.portfolio_items ?? []).length ? <p className="text-sm text-muted">暂无正式档案内容。</p> : null}
        </Card>
      ) : null}
    </div>
  );
}
