import { Card } from '@/components/ui/card';
import { getSessionProfile } from '@/lib/auth/session';
import { getCurrentRuntimeCase, getDemoPortfolios, getDemoTasks, getManagedClassIds, getRuntimeCases, getRuntimeClassesForProfile, getRuntimeSites } from '@/lib/demo/persist';
import { CurrentCaseSwitcher } from '@/features/teacher/current-case-switcher';

function classNameFor(item: any) {
  const names: Record<string, string> = {
    'class-7a': '七年级 1 班',
    'class-7b': '七年级 2 班',
    'class-8a': '八年级 1 班'
  };
  return names[item.id] ?? item.name;
}

export default async function TeacherDashboardPage() {
  const { profile } = await getSessionProfile('teacher');
  const currentCase = getCurrentRuntimeCase();
  const cases = getRuntimeCases(profile);
  const classes = getRuntimeClassesForProfile(profile);
  const sites = getRuntimeSites().filter((site: any) => !currentCase?.id || site.case_id === currentCase.id);
  const recentTasks = getDemoTasks(profile).slice(0, 4);
  const managedClassIds = getManagedClassIds(profile);
  const pendingPortfolios = getDemoPortfolios().filter((item) => managedClassIds.includes(item.class_id) && item.status !== 'reviewed');

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5">
        <p className="text-sm text-sky-700">教师工作台</p>
        <h1 className="mt-1 text-2xl font-bold">课堂云游驾驶舱</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">集中查看班级、当前案例、任务发布与学生作品，发布任务和案例工作台入口由顶部导航承担。</p>
      </section>

      <div className="grid gap-3 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-white to-sky-50"><p className="text-xs text-muted">我管理的班级</p><p className="text-3xl font-bold">{classes.length}</p></Card>
        <Card><p className="text-xs text-muted">当前案例</p><p className="font-semibold">{currentCase.title}</p></Card>
        <Card className="bg-gradient-to-br from-white to-emerald-50"><p className="text-xs text-muted">点位数量</p><p className="text-3xl font-bold">{sites.length}</p></Card>
        <Card className="bg-gradient-to-br from-white to-amber-50"><p className="text-xs text-muted">待批改档案</p><p className="text-3xl font-bold">{pendingPortfolios.length}</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-3">
          <h3 className="font-semibold">我管理的班级</h3>
          <div className="space-y-2 text-sm">
            {classes.map((item: any) => (
              <div key={item.id} className="rounded-xl border bg-slate-50 p-3">
                <p className="font-medium">{classNameFor(item)}</p>
                <p className="mt-1 text-xs text-muted">{item.grade ?? '未设置年级'} · 邀请码 {item.invite_code}</p>
              </div>
            ))}
            {!classes.length ? <p className="text-sm text-muted">当前教师账号尚未绑定班级。</p> : null}
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-semibold">当前案例 / 当前活动</h3>
          <div className="rounded-xl border bg-white p-3">
            <p className="font-medium">{currentCase.title}</p>
            <p className="mt-1 text-sm text-muted">{currentCase.summary}</p>
            <p className="mt-2 text-xs text-muted">发布班级：{currentCase.published_class_ids?.length ?? 0} 个</p>
          </div>
          <CurrentCaseSwitcher cases={cases as any} currentCaseId={currentCase.id} />
        </Card>
      </div>

      <Card className="space-y-3">
        <h3 className="font-semibold">最近任务</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {recentTasks.map((task: any) => (
            <div key={task.id} className="rounded-xl border bg-slate-50 p-3 text-sm">
              <p className="text-xs text-muted">{task.phase}</p>
              <p className="font-medium">{task.site_id === 'site-2' ? '矿坑结构观察' : task.title}</p>
              <p className="mt-1 text-xs text-muted">{task.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
