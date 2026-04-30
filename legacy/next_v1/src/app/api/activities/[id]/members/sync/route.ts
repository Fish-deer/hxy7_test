import { fail, ok, requireProfile } from '../../../../_utils';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可同步学生', 403);
  if (!supabase) return ok({ synced: 1 });

  const { data: activity } = await supabase.from('activities').select('teacher_id').eq('id', params.id).single();
  if (!activity || activity.teacher_id !== profile.id) return fail('权限不足', 403);

  const { data: activityClasses } = await supabase.from('activity_classes').select('class_id').eq('activity_id', params.id);
  const classIds = (activityClasses ?? []).map((x: any) => x.class_id);
  if (!classIds.length) return fail('请先绑定班级');

  const { data: students } = await supabase.from('profiles').select('id').eq('role', 'student').in('class_id', classIds);
  const inserts = (students ?? []).map((s: any) => ({ activity_id: params.id, student_id: s.id }));
  if (inserts.length) {
    const { error } = await supabase.from('activity_members').upsert(inserts, { onConflict: 'activity_id,student_id' });
    if (error) return fail(error.message);
  }

  return ok({ synced: inserts.length });
}
