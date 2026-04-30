import { fail, ok, requireProfile } from '../../../_utils';
import { deleteRuntimeClass, updateRuntimeClass } from '@/lib/demo/persist';

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function PATCH(req: Request, { params }: { params: { classId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可访问', 403);
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  if (typeof body.name === 'string') patch.name = body.name;
  if (typeof body.grade === 'string') patch.grade = body.grade;
  if (body.teacher_id) patch.teacher_id = body.teacher_id;
  if (body.reset_invite) patch.invite_code = makeInviteCode();

  if (!supabase) {
    const row = updateRuntimeClass(params.classId, patch);
    if (!row) return fail('班级不存在', 404);
    return ok(row);
  }

  const { data, error } = await supabase.from('classes').update(patch).eq('id', params.classId).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}

export async function DELETE(_: Request, { params }: { params: { classId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可访问', 403);

  if (!supabase) {
    const deleted = deleteRuntimeClass(params.classId);
    if (!deleted) return fail('班级不存在', 404);
    return ok(true);
  }

  const { error } = await supabase.from('classes').delete().eq('id', params.classId);
  if (error) return fail(error.message);
  return ok(true);
}
