import { Card } from '@/components/ui/card';
import { BackLink } from '@/components/ui/back-link';
import { getSessionProfile } from '@/lib/auth/session';
import { demoSites } from '@/lib/demo/store';

export default async function TeacherConsolePage() {
  await getSessionProfile('teacher');
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">课堂控制台</h1>
        <BackLink href="/teacher/dashboard" label="返回教师工作台" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card><h3 className="font-semibold">一键推送全班</h3><p className="mt-1 text-sm text-muted">将全班切换到指定点位</p><select className="mt-2 w-full rounded border p-2 text-sm">{demoSites.map((s) => <option key={s.id}>{s.name}</option>)}</select></Card>
        <Card><h3 className="font-semibold">学生完成率</h3><p className="mt-1 text-2xl font-bold text-emerald-600">84%</p><p className="text-xs text-muted">已完成 30 / 36</p></Card>
      </div>
      <Card><h3 className="font-semibold">点名展示优秀作品</h3><p className="mt-2 text-sm">刘同学《矿坑结构图》、张同学《工人故事口述卡》</p><p className="mt-1 text-xs text-muted">可在学生端实时预览：/student/activities</p></Card>
    </div>
  );
}
