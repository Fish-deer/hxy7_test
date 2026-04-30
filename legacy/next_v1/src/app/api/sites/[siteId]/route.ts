import { fail, ok, requireProfile } from '../../_utils';

export async function GET(_: Request, { params }: { params: { siteId: string } }) {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase.from('activity_sites').select('*').eq('id', params.siteId).single();
  if (error) return fail(error.message);
  return ok(data);
}

export async function PATCH(req: Request, { params }: { params: { siteId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('权限不足', 403);
  const body = await req.json();
  const { data, error } = await supabase.from('activity_sites').update(body).eq('id', params.siteId).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}
