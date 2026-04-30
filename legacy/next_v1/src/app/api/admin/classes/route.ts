import { fail, ok, requireProfile } from '../../_utils';
import { demoClasses, demoProfiles, demoSchools } from '@/lib/demo/store';
import { createRuntimeClass, getRuntimeClassesForProfile, getRuntimeUsers } from '@/lib/demo/persist';

function makeInviteCode(name = '') {
  const digits = name.match(/\d+/g)?.join('') ?? '';
  return `HS${digits || Math.random().toString(36).slice(2, 5).toUpperCase()}`.toUpperCase();
}

function withClassRelations(row: any) {
  return {
    ...row,
    schools: demoSchools.find((school) => school.id === row.school_id),
    profiles: Object.values(demoProfiles).filter((profile: any) => profile.class_id === row.id || profile.id === row.teacher_id)
  };
}

export async function GET() {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin' && profile.role !== 'teacher') return fail('仅管理员或教师可访问', 403);
  if (!supabase) {
    const users = getRuntimeUsers();
    const rows = getRuntimeClassesForProfile(profile)
      .map((row) => ({ ...withClassRelations(row), profiles: users.filter((user) => user.class_id === row.id) }));
    return ok(rows);
  }

  if (profile.role === 'admin') {
    const { data } = await supabase.from('classes').select('*,schools(name),profiles(id,name,role)').order('created_at', { ascending: false });
    return ok(data ?? []);
  }

  const { data } = await supabase.from('classes').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false });
  return ok(data ?? []);
}

export async function POST(req: Request) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'admin') return fail('仅管理员可访问', 403);
  const body = await req.json();
  const payload = { ...body, school_id: body.school_id || 'demo-school-1', invite_code: String(body.invite_code || makeInviteCode(body.name)).toUpperCase() };

  if (!supabase) {
    const row = createRuntimeClass(payload);
    return ok(withClassRelations(row));
  }

  const { data, error } = await supabase.from('classes').insert(payload).select('*').single();
  if (error) return fail(error.message);
  return ok(data);
}
