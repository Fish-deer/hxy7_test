import { fail, ok, requireProfile } from '../../_utils';
import { createDemoTask, getDemoTasks, getManagedClassIds } from '@/lib/demo/persist';

export async function GET(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可查看', 403);
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get('case_id');
  const tasks = getDemoTasks(profile);
  return ok(caseId ? tasks.filter((x: any) => x.case_id === caseId) : tasks);
}

export async function POST(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可新增', 403);
  const body = await req.json();
  const allowedClassIds = getManagedClassIds(profile);
  const classIds = (Array.isArray(body.class_ids) ? body.class_ids.filter(Boolean) : [profile.class_id].filter(Boolean)).filter((id: string) => allowedClassIds.includes(id));
  if (!classIds.length) return fail('请选择要发布的班级', 400);
  return ok(createDemoTask({ ...body, class_ids: classIds }));
}
