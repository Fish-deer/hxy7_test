import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getSessionProfile } from '@/lib/auth/session';
import { demoRoutes, demoSites } from '@/lib/demo/store';
import { getClassWallData, getDemoProgresses, getDemoTasks, getRuntimeCases } from '@/lib/demo/persist';

function siteName(site: any) {
  return site.id === 'site-2' ? '矿坑露天观景台' : site.name;
}

function taskTitle(task: any) {
  return task.site_id === 'site-2' ? '矿坑结构观察' : task.title;
}

export default async function StudentActivitiesPage() {
  const { profile } = await getSessionProfile('student');
  const demoCase = getRuntimeCases(profile)[0];
  const route = demoRoutes[0];
  const tasks = getDemoTasks(profile);
  const finished = getDemoProgresses('demo-activity-1', profile.id).length;
  const wall = getClassWallData(profile.class_id);

  if (!demoCase) {
    return <Card><h1 className="text-xl font-semibold">暂无可见活动</h1><p className="mt-1 text-sm text-muted">当前账号尚未绑定到已发布活动的班级，请联系教师或管理员。</p></Card>;
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl p-8 text-white" style={{ backgroundImage: `linear-gradient(120deg,rgba(15,23,42,.78),rgba(30,64,175,.62)),url(${demoCase.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <p className="text-sm text-sky-100">信息技术课堂云游专题</p>
        <h1 className="mt-2 text-3xl font-bold lg:text-4xl">{demoCase.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-100 lg:text-base">{demoCase.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/student/activities/demo-activity-1/visit" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900">开始云游</Link>
          <Link href="/student/tasks" className="rounded-lg border border-white/70 px-4 py-2 text-sm">进入任务中心</Link>
          <Link href="/student/backpack" className="rounded-lg border border-white/70 px-4 py-2 text-sm">证据背包</Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2">
        <Card className="xl:col-span-2 border-sky-100 bg-gradient-to-br from-white to-sky-50">
          <h3 className="font-semibold">路线概览 · {route.title}</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {demoSites.map((site) => <div key={site.id} className="rounded-lg border bg-white/80 p-2 text-sm">{site.order_index}. {siteName(site)}</div>)}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold">今日任务</h3>
          <ul className="mt-2 space-y-2 text-sm">{tasks.slice(0, 3).map((t: any) => <li key={t.id}>• {taskTitle(t)}</li>)}</ul>
        </Card>
        <Card>
          <h3 className="font-semibold">学习进度</h3>
          <p className="mt-3 text-3xl font-bold text-primary">{Math.round((finished / demoSites.length) * 100)}%</p>
          <p className="text-sm text-muted">已完成 {finished}/{demoSites.length} 个点位</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h3 className="font-semibold">推荐点位</h3>
          <p className="mt-2 text-sm">矿坑露天观景台</p>
          <p className="mt-1 text-xs text-muted">当前任务：矿坑结构观察</p>
          <Link className="mt-3 inline-block text-sm text-primary" href="/student/sites/site-2">进入探索</Link>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-semibold">班级热榜 / 优秀作品</h3>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {wall.highlights.map((x: any) => (
              <div key={x.id} className="overflow-hidden rounded-lg border bg-white text-sm">
                {x.image_url ? <img src={x.image_url} alt={x.title} className="h-28 w-full object-cover" /> : null}
                <div className="p-2">
                  <p className="font-medium">{x.title}</p>
                  <p className="mt-1 text-xs text-muted">{x.student} · 赞 {x.likes}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/student/class-wall" className="mt-3 inline-block text-sm text-primary">查看班级共学页</Link>
        </Card>
      </section>
    </div>
  );
}
