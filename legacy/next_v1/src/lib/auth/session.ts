import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { Profile, UserRole } from '@/types/domain';
import { isDemoMode } from '@/lib/demo/mode';
import { getDemoRoleFromCookie, getDemoUserIdFromCookie } from '@/lib/demo/store';
import { getRuntimeUserById } from '@/lib/demo/persist';

export async function getSessionProfile(requiredRole?: UserRole) {
  if (isDemoMode()) {
    const headerStore = headers();
    const roleFromCookie = getDemoRoleFromCookie(headerStore.get('cookie'));
    const userId = getDemoUserIdFromCookie(headerStore.get('cookie'));
    const profile = getRuntimeUserById(userId, requiredRole ?? roleFromCookie);

    if (requiredRole && profile.role !== requiredRole) {
      if (requiredRole === 'student') redirect('/student/activities');
      if (requiredRole === 'teacher') redirect('/teacher/dashboard');
      redirect('/admin/users');
    }

    return { user: { id: profile.id, email: profile.email ?? `${profile.role}@demo.local` }, profile, supabase: null };
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single<Profile>();
  if (!profile) redirect('/login');
  if (requiredRole && profile.role !== requiredRole) {
    if (profile.role === 'student') redirect('/student/activities');
    if (profile.role === 'teacher') redirect('/teacher/dashboard');
    redirect('/admin/users');
  }

  return { user, profile, supabase };
}

export function ensureRole(role: UserRole, allowed: UserRole[]) {
  if (!allowed.includes(role)) throw new Error('权限不足');
}
