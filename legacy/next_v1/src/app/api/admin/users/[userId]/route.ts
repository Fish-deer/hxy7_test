import { fail, ok, requireProfile } from '../../../_utils';
import { deleteRuntimeUser, updateRuntimeUser } from '@/lib/demo/persist';

export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可访问', 403);
  const body = await req.json();
  const role = body.role === 'teacher' ? 'teacher' : body.role === 'student' ? 'student' : body.role;
  const classIds = role === 'teacher' ? (Array.isArray(body.class_ids) ? body.class_ids.filter(Boolean) : [body.class_id].filter(Boolean)) : [body.class_id].filter(Boolean);
  if ((role === 'student' || role === 'teacher') && !classIds.length) return fail('学生和教师账号必须绑定班级');
  const patch = role === 'teacher' ? { ...body, class_id: classIds[0], class_ids: classIds } : body;
  if (!supabase) {
    const user = updateRuntimeUser(params.userId, patch);
    if (!user) return fail('账号不存在', 404);
    return ok(user);
  }
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', params.userId).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}

export async function DELETE(_: Request, { params }: { params: { userId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可访问', 403);
  if (!supabase) return ok({ id: params.userId, deleted: deleteRuntimeUser(params.userId) });
  const { error } = await supabase.from('profiles').delete().eq('id', params.userId);
  if (error) return fail(error.message);
  return ok({ id: params.userId });
}
