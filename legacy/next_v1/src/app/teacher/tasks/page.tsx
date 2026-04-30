import { BackLink } from '@/components/ui/back-link';
import { TeacherTaskWorkbench } from '@/features/teacher/task-workbench';

export default function TeacherTasksPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">任务管理</h1>
          <p className="mt-1 text-sm text-muted">创建、编辑、删除任务，并发布到绑定班级。</p>
        </div>
        <BackLink href="/teacher/dashboard" label="返回教师工作台" />
      </div>
      <TeacherTaskWorkbench />
    </div>
  );
}
