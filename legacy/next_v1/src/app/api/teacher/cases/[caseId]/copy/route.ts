import { fail, ok, requireProfile } from '../../../../_utils';
import { copyRuntimeCase } from '@/lib/demo/persist';

export async function POST(_: Request, { params }: { params: { caseId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可复制', 403);
  const cloned = copyRuntimeCase(params.caseId);
  if (!cloned) return fail('案例不存在', 404);
  return ok(cloned);
}
