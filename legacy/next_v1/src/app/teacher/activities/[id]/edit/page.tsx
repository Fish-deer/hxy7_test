import { PageTitle } from '@/components/layout/page-title';
import { TeacherActivityEditor } from '@/features/activities/teacher-editor';
import { getSessionProfile } from '@/lib/auth/session';

export default async function TeacherEditPage({ params }: { params: { id: string } }) {
  await getSessionProfile('teacher');
  return (
    <div className="space-y-3">
      <PageTitle title="活动编辑" desc="配置点位和任务，并发布" />
      <TeacherActivityEditor activityId={params.id} />
    </div>
  );
}
