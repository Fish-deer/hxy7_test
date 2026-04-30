import { fail, ok, requireProfile } from '../../../_utils';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('权限不足', 403);
  const { data, error } = await supabase
    .from('activities')
    .update({ status: 'published' })
    .eq('id', params.id)
    .eq('teacher_id', profile.id)
    .select('*')
    .single();
  if (error) return fail(error.message);
  return ok(data);
}
