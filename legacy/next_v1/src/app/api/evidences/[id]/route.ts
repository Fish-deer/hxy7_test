import { fail, ok, requireProfile } from '../../_utils';
import { isDemoMode } from '@/lib/demo/mode';
import { deleteDemoEvidence, reviewDemoEvidence, updateDemoEvidence } from '@/lib/demo/persist';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { profile } = await requireProfile();
  const body = await req.json();

  if (isDemoMode()) {
    if (profile.role === 'teacher') {
      const evidence = reviewDemoEvidence(params.id, profile, body);
      if (!evidence) return fail('档案不存在或无权评价', 404);
      return ok(evidence);
    }
    if (profile.role !== 'student') return fail('权限不足', 403);
    const evidence = updateDemoEvidence(params.id, profile.id, body);
    if (!evidence) return fail('证据不存在', 404);
    return ok(evidence);
  }

  return fail('仅演示模式实现', 501);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'student') return fail('仅学生可删除', 403);

  if (isDemoMode()) {
    deleteDemoEvidence(params.id, profile.id);
    return ok({ id: params.id });
  }

  return fail('仅演示模式实现', 501);
}
