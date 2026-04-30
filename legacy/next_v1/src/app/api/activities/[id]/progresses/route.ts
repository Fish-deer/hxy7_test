import { fail, ok, requireProfile } from '../../../_utils';
import { isDemoMode } from '@/lib/demo/mode';
import { demoSites } from '@/lib/demo/store';
import { getDemoProgresses, getManagedClassIds, getRuntimeUsers } from '@/lib/demo/persist';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();

  if (isDemoMode()) {
    const users = getRuntimeUsers();
    const managedClassIds = profile.role === 'teacher' ? getManagedClassIds(profile) : [];
    const data = getDemoProgresses(params.id, profile.role === 'student' ? profile.id : undefined)
      .filter((x) => profile.role !== 'teacher' || managedClassIds.includes(users.find((user) => user.id === x.student_id)?.class_id))
      .map((x) => {
        const user = users.find((item) => item.id === x.student_id);
        return { ...x, profiles: { name: user?.name ?? '学生' }, activity_sites: { name: demoSites.find((s) => s.id === x.site_id)?.name ?? '点位' } };
      });
    return ok(data);
  }

  if (profile.role === 'teacher') {
    const { data: activity } = await supabase!.from('activities').select('teacher_id').eq('id', params.id).single();
    if (!activity || activity.teacher_id !== profile.id) return fail('权限不足', 403);
  }

  const query = supabase!.from('site_progresses').select('*,profiles(name),activity_sites(name)').eq('activity_id', params.id).order('completed_at', { ascending: false });
  if (profile.role === 'student') query.eq('student_id', profile.id);
  const { data } = await query;
  return ok(data ?? []);
}
