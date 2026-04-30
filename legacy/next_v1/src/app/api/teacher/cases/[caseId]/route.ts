import { fail, ok, requireProfile } from '../../../_utils';
import { deleteRuntimeCase, updateRuntimeCase } from '@/lib/demo/persist';

export async function PATCH(req: Request, { params }: { params: { caseId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可修改', 403);
  const body = await req.json();
  const item = updateRuntimeCase(params.caseId, body);
  if (!item) return fail('案例不存在', 404);
  return ok(item);
}

export async function DELETE(_: Request, { params }: { params: { caseId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可删除', 403);
  if (!deleteRuntimeCase(params.caseId)) return fail('案例不存在', 404);
  return ok({ id: params.caseId });
}
