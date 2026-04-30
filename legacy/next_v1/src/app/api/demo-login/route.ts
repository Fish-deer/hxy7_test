import { fail, ok } from '../_utils';
import { findRuntimeUserByAccount } from '@/lib/demo/persist';

export async function POST(req: Request) {
  const body = await req.json();
  const account = String(body.account ?? body.email ?? '').trim();
  const password = String(body.password ?? '').trim();
  const user = findRuntimeUserByAccount(account);
  if (!user || String(user.password ?? '123456') !== password) return fail('账号或密码不正确', 401);
  if (user.role === 'student' && !user.class_id) return fail('该账号尚未绑定班级，请联系管理员', 403);
  if (user.role === 'teacher' && !(user.class_id || user.class_ids?.length)) return fail('该账号尚未绑定班级，请联系管理员', 403);
  return ok({ id: user.id, role: user.role, name: user.name, class_id: user.class_id });
}
