import Link from 'next/link';
import { BackLink } from '@/components/ui/back-link';
import { Card } from '@/components/ui/card';
import { getSessionProfile } from '@/lib/auth/session';
import { demoSites, demoMediaAssets } from '@/lib/demo/store';
import { getDemoProgresses } from '@/lib/demo/persist';

export default async function VisitPage({ params }: { params: { id: string } }) {
  const { profile } = await getSessionProfile('student');
  const sites = demoSites;
  const doneSet = new Set(getDemoProgresses(params.id, profile.id).map((x) => x.site_id));
  const teacherSiteId = 'site-2';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <BackLink href="/student/activities" label="返回我的活动" />
      </div>
      <Card className="bg-slate-900 text-white">
        <h1 className="text-2xl font-bold">路线 / 景区页</h1>
        <p className="mt-1 text-sm text-slate-200">按路线推进课堂云游，也可以自由进入任意点位。</p>
        <p className="mt-2 inline-block rounded bg-amber-300/20 px-2 py-1 text-xs text-amber-200">教师当前讲解点位：{sites.find((x) => x.id === teacherSiteId)?.name}</p>
      </Card>

      <div className="grid gap-3 xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2">
        {sites.map((site) => {
          const img = demoMediaAssets.find((a: any) => a.site_id === site.id && a.type === 'image');
          return (
            <Card key={site.id} className="space-y-2">
              {img ? <img src={img.url} alt={site.name} className="h-36 w-full rounded-lg object-cover" /> : null}
              <p className="text-xs text-muted">第 {site.order_index} 站</p>
              <h3 className="font-semibold">{site.name}</h3>
              <p className="line-clamp-2 text-sm text-muted">{site.intro}</p>
              <div className="flex items-center justify-between text-xs">
                <span className={doneSet.has(site.id) ? 'text-emerald-600' : 'text-amber-600'}>{doneSet.has(site.id) ? '已完成' : '进行中'}</span>
                {site.id === teacherSiteId ? <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-600">教师讲解中</span> : null}
              </div>
              <div className="flex justify-end">
                <Link href={`/student/sites/${site.id}`} className="inline-block text-sm text-primary">进入点位</Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
