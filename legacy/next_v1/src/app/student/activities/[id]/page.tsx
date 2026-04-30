import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { BackLink } from '@/components/ui/back-link';
import { getSessionProfile } from '@/lib/auth/session';
import { demoCases, demoSites, demoMediaAssets } from '@/lib/demo/store';

export default async function StudentActivityDetailPage() {
  await getSessionProfile('student');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <BackLink href="/student/activities" label="返回上一页" />
      </div>
      <Card className="bg-white/90">
        <h1 className="text-2xl font-bold">{demoCases[0].title}</h1>
        <p className="mt-1 text-sm text-muted">{demoCases[0].summary}</p>
        <div className="mt-3 flex flex-wrap justify-end gap-3 text-sm">
          <Link href="/student/activities/demo-activity-1/visit" className="text-primary">路线 / 地图</Link>
          <Link href="/student/tasks" className="text-primary">任务中心</Link>
          <Link href="/student/backpack" className="text-primary">证据背包</Link>
          <Link href="/student/portfolio" className="text-primary">学习档案</Link>
          <Link href="/student/class-wall" className="text-primary">班级共学</Link>
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {demoSites.map((site) => {
          const img = demoMediaAssets.find((a: any) => a.site_id === site.id && a.type === 'image');
          return (
            <Card key={site.id}>
              {img ? <img src={img.url} alt={site.name} className="h-36 w-full rounded-lg object-cover" /> : null}
              <h3 className="mt-2 font-semibold">{site.order_index}. {site.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{site.intro}</p>
              <div className="mt-2 flex justify-end">
                <Link href={`/student/sites/${site.id}`} className="inline-block text-sm text-primary">进入点位探索</Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
