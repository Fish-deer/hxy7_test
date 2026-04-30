import { fail, ok, requireProfile } from '../../_utils';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  const { data, error } = await supabase.from('activities').select('*').eq('id', params.id).single();
  if (error || !data) return fail('活动不存在', 404);
  if (profile.role === 'teacher' && data.teacher_id !== profile.id) return fail('权限不足', 403);
  return ok(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('权限不足', 403);
  const body = await req.json();
  const { data: act } = await supabase.from('activities').select('teacher_id').eq('id', params.id).single();
  if (!act || act.teacher_id !== profile.id) return fail('权限不足', 403);
  const { data, error } = await supabase.from('activities').update(body).eq('id', params.id).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}
