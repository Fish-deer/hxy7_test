import { fail, ok, requireProfile } from '../../../_utils';
import { deleteDemoTask, getManagedClassIds, updateDemoTask } from '@/lib/demo/persist';

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可修改', 403);
  const body = await req.json();
  const allowedClassIds = getManagedClassIds(profile);
  const classIds = Array.isArray(body.class_ids) ? body.class_ids.filter((id: string) => allowedClassIds.includes(id)) : undefined;
  if (Array.isArray(body.class_ids) && !classIds?.length) return fail('请选择要发布的班级', 400);
  const task = updateDemoTask(params.taskId, classIds ? { ...body, class_ids: classIds } : body);
  if (!task) return fail('任务不存在', 404);
  return ok(task);
}

export async function DELETE(_: Request, { params }: { params: { taskId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可删除', 403);
  if (!deleteDemoTask(params.taskId)) return fail('任务不存在', 404);
  return ok({ id: params.taskId });
}
