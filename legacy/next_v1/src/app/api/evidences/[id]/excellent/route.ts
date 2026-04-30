import { fail, ok, requireProfile } from '../../../_utils';
import { setExcellentEvidence } from '@/lib/demo/persist';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可设置优秀作品', 403);
  const item = setExcellentEvidence(params.id);
  if (!item) return fail('证据不存在', 404);
  return ok(item);
}
