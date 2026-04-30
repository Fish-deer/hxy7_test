import { BackLink } from '@/components/ui/back-link';
import { getSessionProfile } from '@/lib/auth/session';
import { demoMediaAssets, demoSites } from '@/lib/demo/store';
import { getDemoProgresses, getDemoTasks } from '@/lib/demo/persist';
import { StudentTaskList } from '@/features/student/student-task-list';

export default async function StudentTasksPage() {
  const { profile } = await getSessionProfile('student');
  const doneSet = new Set(getDemoProgresses('demo-activity-1', profile.id).map((x) => x.site_id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">任务中心</h1>
        <BackLink href="/student/activities" label="返回我的活动" />
      </div>
      <StudentTaskList
        initialTasks={getDemoTasks(profile) as any}
        doneSiteIds={Array.from(doneSet)}
        sites={demoSites}
        mediaAssets={demoMediaAssets as any}
      />
    </div>
  );
}
