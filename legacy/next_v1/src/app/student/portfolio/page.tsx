import { BackLink } from '@/components/ui/back-link';
import { Card } from '@/components/ui/card';
import { getSessionProfile } from '@/lib/auth/session';
import { demoMediaAssets, demoSites, demoTasks } from '@/lib/demo/store';
import { getDemoEvidences, getDemoNotifications } from '@/lib/demo/persist';

function evidenceImage(evidence: any) {
  const asset = demoMediaAssets.find((a: any) => a.id === evidence.resource_asset_id);
  if (asset?.type === 'image') return asset.url;
  if (typeof evidence.file_url === 'string' && (evidence.file_url.startsWith('http') || evidence.file_url.startsWith('data:image'))) return evidence.file_url;
  return '';
}

function statusText(e: any) {
  if (!e.in_portfolio) return '待提交';
  return e.review_status === 'reviewed' ? '已提交 · 已批改' : '已提交 · 待批改';
}

export default async function StudentPortfolioPage() {
  const { profile } = await getSessionProfile('student');
  const evidences = getDemoEvidences('demo-activity-1', profile.id).filter((item: any) => item.in_portfolio);
  const reviewNotice = getDemoNotifications(profile.id)[0];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">学习档案</h1>
            <p className="mt-1 text-sm text-muted">每条档案都是独立作业，单独显示提交、批改、分数和评价状态。</p>
          </div>
          <BackLink href="/student/activities" label="返回学生主页" />
        </div>
      </div>

      {reviewNotice ? (
        <Card className="border-green-200 bg-green-50 text-sm text-green-700">
          <p className="font-medium">{reviewNotice.title}</p>
          <p className="mt-1">{reviewNotice.content}</p>
        </Card>
      ) : null}

      <Card>
        <h3 className="font-semibold">正式档案内容</h3>
        <ol className="mt-3 space-y-3 text-sm">
          {evidences.map((e: any) => {
            const site = demoSites.find((s) => s.id === e.site_id);
            const task = demoTasks.find((t) => t.id === e.task_id || t.site_id === e.site_id);
            const img = evidenceImage(e);
            const reviewed = e.review_status === 'reviewed';
            return (
              <li key={e.id} className="rounded-xl border bg-slate-50 p-3">
                <div className="flex flex-wrap items-start gap-3">
                  {img ? <a href={img} target="_blank"><img src={img} alt="证据图片" className="h-24 w-32 rounded-lg object-cover" /></a> : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{site?.name ?? '活动证据'}</p>
                      <span className={`rounded-full px-2 py-1 text-xs ${reviewed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{statusText(e)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">所属任务：{task?.title ?? '点位记录'} · 提交时间：{new Date(e.created_at).toLocaleString()}</p>
                    <p className="mt-1">{e.text_content || e.observation || e.explanation || e.conclusion || e.note || '图片证据'}</p>
                    <div className="mt-2 grid gap-2 rounded-lg bg-white p-2 text-xs sm:grid-cols-2">
                      <p>分数：{e.teacher_score ?? '暂无分数'}</p>
                      <p>评价：{e.teacher_comment ?? '等待教师评价'}</p>
                      <p>评分状态：{e.teacher_score == null ? '暂无分数' : '已有分数'}</p>
                      <p>评语状态：{e.teacher_comment ? '已有评价' : '暂无评价'}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
          {!evidences.length ? <p className="text-sm text-muted">暂无正式档案内容。请先在证据背包中选择“加入学习档案”。</p> : null}
        </ol>
      </Card>
    </div>
  );
}
