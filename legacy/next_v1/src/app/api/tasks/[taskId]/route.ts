import { fail, ok, requireProfile } from '../../_utils';
import { demoTasks } from '@/lib/demo/store';

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('权限不足', 403);
  const body = await req.json();
  if (!supabase) {
    const idx = demoTasks.findIndex((task: any) => task.id === params.taskId);
    if (idx < 0) return fail('任务不存在', 404);
    demoTasks[idx] = { ...demoTasks[idx], ...body } as any;
    return ok(demoTasks[idx]);
  }
  const { data, error } = await supabase.from('tasks').update(body).eq('id', params.taskId).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}

export async function DELETE(_: Request, { params }: { params: { taskId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('权限不足', 403);
  if (!supabase) {
    const idx = demoTasks.findIndex((task: any) => task.id === params.taskId);
    if (idx < 0) return fail('任务不存在', 404);
    demoTasks.splice(idx, 1);
    return ok({ id: params.taskId });
  }
  const { error } = await supabase.from('tasks').delete().eq('id', params.taskId);
  if (error) return fail(error.message);
  return ok({ id: params.taskId });
}
