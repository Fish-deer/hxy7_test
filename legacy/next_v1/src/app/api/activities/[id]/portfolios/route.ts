import { fail, ok, requireProfile } from '../../../_utils';
import { isDemoMode } from '@/lib/demo/mode';
import { getDemoPortfolios, getManagedClassIds, getRuntimeUsers } from '@/lib/demo/persist';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可查看', 403);

  if (isDemoMode()) {
    const users = getRuntimeUsers();
    const managedClassIds = getManagedClassIds(profile);
    const list = getDemoPortfolios(params.id)
      .filter((x) => managedClassIds.includes(x.class_id))
      .map((x) => {
        const user = users.find((item) => item.id === x.student_id);
        return { ...x, profiles: { name: user?.name ?? '学生' } };
      });
    return ok(list);
  }

  const { data } = await supabase!.from('portfolios').select('*,profiles(name)').eq('activity_id', params.id).order('updated_at', { ascending: false });
  return ok(data ?? []);
}
