import { fail, ok, requireProfile } from '../../_utils';
import { createRuntimeCase, getRuntimeCases } from '@/lib/demo/persist';

export async function GET() {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可查看', 403);
  return ok(getRuntimeCases(profile));
}

export async function POST(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可创建', 403);
  const body = await req.json();
  return ok(createRuntimeCase(body, profile.id));
}
