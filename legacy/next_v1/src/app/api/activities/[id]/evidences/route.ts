import { ok, requireProfile } from '../../../_utils';
import { isDemoMode } from '@/lib/demo/mode';
import { getDemoEvidences, getManagedClassIds, getRuntimeUsers } from '@/lib/demo/persist';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();

  if (isDemoMode()) {
    const users = getRuntimeUsers();
    const managedClassIds = profile.role === 'teacher' ? getManagedClassIds(profile) : [];
    const list = getDemoEvidences(params.id, profile.role === 'student' ? profile.id : undefined)
      .filter((x) => profile.role !== 'teacher' || managedClassIds.includes(x.class_id))
      .map((x) => {
        const user = users.find((item) => item.id === x.student_id);
        return { ...x, profiles: { name: user?.name ?? '学生' } };
      });
    return ok(list);
  }

  const query = supabase!.from('evidences').select('*,profiles(name)').eq('activity_id', params.id).order('created_at', { ascending: false });
  if (profile.role === 'student') query.eq('student_id', profile.id);
  const { data } = await query;
  return ok(data ?? []);
}
