import { fail, ok, requireProfile } from '../../_utils';

export async function GET() {
  const { profile, supabase } = await requireProfile();
  if (!['admin', 'teacher'].includes(profile.role)) return fail('权限不足', 403);
  const { data } = await supabase.from('resource_templates').select('*').order('created_at', { ascending: false });
  return ok(data ?? []);
}

export async function POST(req: Request) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可新增模板', 403);
  const body = await req.json();
  const { data, error } = await supabase.from('resource_templates').insert({ ...body, created_by: profile.id }).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}
