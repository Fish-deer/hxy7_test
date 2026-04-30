import { fail, ok, requireProfile } from '../../../_utils';
import { isDemoMode } from '@/lib/demo/mode';
import { demoState } from '@/lib/demo/store';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();

  if (isDemoMode()) {
    const list = demoState.questions.filter((x) => x.activity_id === params.id && (profile.role === 'student' ? x.student_id === profile.id : true));
    return ok(list);
  }

  const query = supabase!.from('question_items').select('*').eq('activity_id', params.id).order('created_at', { ascending: false });
  if (profile.role === 'student') query.eq('student_id', profile.id);
  const { data } = await query;
  return ok(data ?? []);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'student') return fail('仅学生可提交问题', 403);
  const body = await req.json();

  if (isDemoMode()) {
    const item = { id: `q-${Date.now()}`, ...body, activity_id: params.id, student_id: profile.id };
    demoState.questions.unshift(item);
    return ok(item);
  }

  const { data, error } = await supabase!
    .from('question_items')
    .insert({ ...body, activity_id: params.id, student_id: profile.id, source: body.source ?? 'student_manual' })
    .select('*')
    .single();
  if (error) return fail(error.message);
  return ok(data);
}
