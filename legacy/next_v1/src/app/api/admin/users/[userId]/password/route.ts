import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { fail, ok, requireProfile } from '../../../../_utils';
import { updateRuntimeUser } from '@/lib/demo/persist';

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可访问', 403);

  const { password } = await req.json();
  const nextPassword = String(password ?? '').trim();
  if (nextPassword.length < 6) return fail('新密码至少 6 位');

  if (!supabase) return ok(updateRuntimeUser(params.userId, { password: nextPassword, password_updated_at: new Date().toISOString() }));

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && serviceKey) {
    const admin = createSupabaseAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);
    const { error } = await admin.auth.admin.updateUserById(params.userId, { password: nextPassword });
    if (error) return fail(error.message);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ temp_password: nextPassword, password_updated_at: new Date().toISOString() })
    .eq('id', params.userId)
    .select('*')
    .single();
  if (error) return fail(error.message);
  return ok(data);
}
