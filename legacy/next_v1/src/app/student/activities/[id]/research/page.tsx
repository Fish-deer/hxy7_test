import { PageTitle } from '@/components/layout/page-title';
import { BackLink } from '@/components/ui/back-link';
import { QuestionList } from '@/features/questions/question-list';
import { getSessionProfile } from '@/lib/auth/session';
import { Card } from '@/components/ui/card';
import { isDemoMode } from '@/lib/demo/mode';
import { demoTasks } from '@/lib/demo/store';

export default async function ResearchPage({ params }: { params: { id: string } }) {
  const { supabase } = await getSessionProfile('student');
  const tasks = isDemoMode()
    ? (demoTasks as any[]).filter((x) => (x.activity_id === params.id || x.case_id === 'case-hs-001') && x.phase === 'research').sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : await supabase!.from('tasks').select('*').eq('activity_id', params.id).eq('phase', 'research').order('sort_order').then((r) => r.data ?? []);

  return (
    <div className="space-y-3">
      <BackLink href={`/student/activities/${params.id}`} label="返回活动" />
      <PageTitle title="研板块：家庭探究" desc="完成资料卡并补充待验证问题" />
      <Card>
        <h3 className="mb-2 font-semibold">家庭任务</h3>
        <ul className="list-disc pl-5 text-sm">{(tasks ?? []).map((t: any) => <li key={t.id}>{t.title}：{t.description}</li>)}</ul>
      </Card>
      <QuestionList activityId={params.id} phase="research" />
    </div>
  );
}
