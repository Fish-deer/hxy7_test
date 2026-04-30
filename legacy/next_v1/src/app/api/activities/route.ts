import { z } from 'zod';
import { listActivitiesForRole } from '@/features/activities/service';
import { fail, ok, requireProfile } from '../_utils';
import { isDemoMode } from '@/lib/demo/mode';
import { demoCases } from '@/lib/demo/store';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  theme: z.string().optional(),
  target_grade: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

export async function GET() {
  const { profile } = await requireProfile();
  return ok(await listActivitiesForRole(profile.id, profile.role));
}

export async function POST(req: Request) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可创建活动', 403);

  const payload = schema.safeParse(await req.json());
  if (!payload.success) return fail(payload.error.issues[0]?.message ?? '参数错误');

  if (isDemoMode()) {
    const c = demoCases[0];
    return ok({ id: 'demo-activity-1', title: payload.data.title || c.title, description: payload.data.description || c.summary, teacher_id: profile.id, status: 'draft' });
  }

  const { data, error } = await supabase!.from('activities').insert({ ...payload.data, teacher_id: profile.id, status: 'draft' }).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}
