import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { fail, ok, requireProfile } from '../../_utils';
import { createRuntimeUser, getRuntimeUsers } from '@/lib/demo/persist';

export async function GET() {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可访问', 403);
  if (!supabase) return ok(getRuntimeUsers());
  const { data } = await supabase.from('profiles').select('*,schools(name),classes(name)');
  return ok(data ?? []);
}

export async function POST(req: Request) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可访问', 403);
  const body = await req.json();
  const account = String(body.account ?? body.email ?? '').trim();
  const email = account.includes('@') ? account : `${account}@demo.local`;
  const password = String(body.password ?? '').trim();
  const role = body.role === 'teacher' ? 'teacher' : 'student';
  const name = String(body.name ?? '').trim();
  const classIds = role === 'teacher' ? (Array.isArray(body.class_ids) ? body.class_ids.filter(Boolean) : [body.class_id].filter(Boolean)) : [body.class_id].filter(Boolean);

  if (!account || !password || !name) return fail('请填写姓名、账号和初始密码');
  if (!classIds.length) return fail('学生和教师账号必须绑定班级');
  if (!supabase) return ok(createRuntimeUser({ ...body, account, email, role, class_id: classIds[0], class_ids: classIds }));

  let userId = crypto.randomUUID();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && serviceKey) {
    const admin = createSupabaseAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) return fail(error.message);
    userId = data.user.id;
  }
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, role, name, school_id: profile.school_id, class_id: classIds[0], student_no: body.student_no || null, account, class_ids: classIds })
    .select('*')
    .single();
  if (error) return fail(error.message);
  return ok(data);
}
