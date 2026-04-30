import { fail, ok, requireProfile } from '../../../_utils';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { supabase } = await requireProfile();
  const { data } = await supabase.from('activity_sites').select('*').eq('activity_id', params.id).order('order_index');
  return ok(data ?? []);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('权限不足', 403);
  const body = await req.json();
  const { data, error } = await supabase.from('activity_sites').insert({ ...body, activity_id: params.id }).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}
