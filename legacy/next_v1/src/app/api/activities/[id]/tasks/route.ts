import { fail, ok, requireProfile } from '../../../_utils';
import { createDemoTask, getDemoTasks } from '@/lib/demo/persist';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (!supabase) return ok(getDemoTasks(profile).filter((task: any) => task.activity_id === params.id || task.case_id === 'case-hs-001').sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
  const { data } = await supabase.from('tasks').select('*').eq('activity_id', params.id).order('sort_order');
  return ok(data ?? []);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('权限不足', 403);
  const body = await req.json();
  if (!supabase) {
    return ok(createDemoTask({ activity_id: params.id, case_id: body.case_id ?? 'case-hs-001', ...body }));
  }
  const { data, error } = await supabase.from('tasks').insert({ ...body, activity_id: params.id }).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}
