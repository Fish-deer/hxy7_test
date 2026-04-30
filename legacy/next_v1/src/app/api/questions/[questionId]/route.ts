import { fail, ok, requireProfile } from '../../_utils';

export async function DELETE(_: Request, { params }: { params: { questionId: string } }) {
  const { profile, supabase } = await requireProfile();
  const { data } = await supabase.from('question_items').select('student_id').eq('id', params.questionId).single();
  if (!data || (profile.role === 'student' && data.student_id !== profile.id)) return fail('权限不足', 403);
  await supabase.from('question_items').delete().eq('id', params.questionId);
  return ok(true);
}
