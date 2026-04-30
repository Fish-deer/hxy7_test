'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type Role = 'student' | 'teacher' | 'admin';

const ROLE_NAVS: Record<Role, Array<{ href: string; label: string; match?: string[] }>> = {
  student: [
    { href: '/student/activities', label: '我的活动', match: ['/student/activities', '/student/sites'] },
    { href: '/student/tasks', label: '我的任务' },
    { href: '/student/class-wall', label: '班级共学页' },
    { href: '/student/backpack', label: '证据背包' },
    { href: '/student/portfolio', label: '学习档案' }
  ],
  teacher: [
    { href: '/teacher/dashboard', label: '教师工作台' },
    { href: '/teacher/activities/demo-activity-1/students', label: '查看学生作品', match: ['/teacher/activities'] },
    { href: '/teacher/cases', label: '案例工作台', match: ['/teacher/cases', '/teacher/routes'] },
    { href: '/teacher/tasks', label: '任务发布' }
  ],
  admin: [
    { href: '/admin/users', label: '账号管理' },
    { href: '/admin/schools-classes', label: '班级管理' }
  ]
};

function roleFromPath(pathname: string): Role {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/teacher')) return 'teacher';
  return 'student';
}

function isActive(pathname: string, item: { href: string; match?: string[] }) {
  return (item.match ?? [item.href]).some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function TopNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>(() => roleFromPath(pathname));

  useEffect(() => {
    setRole(roleFromPath(pathname));
    fetch('/api/me')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.role) setRole(json.data.role as Role);
      })
      .catch(() => setRole(roleFromPath(pathname)));
  }, [pathname]);

  const navs = useMemo(() => ROLE_NAVS[role] ?? ROLE_NAVS.student, [role]);

  return (
    <nav className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur">
      <div className="container-mobile flex items-center justify-between gap-4 py-3">
        <Link href={role === 'teacher' ? '/teacher/dashboard' : role === 'admin' ? '/admin/users' : '/student/activities'} className="flex items-center gap-3">
          <img src="/icon.png" alt="黄小游" className="h-9 w-9 rounded-lg object-cover shadow-sm" />
          <div>
            <p className="text-sm font-semibold leading-4">黄小游 V3</p>
            <p className="text-xs text-muted">课堂云游学习平台</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
          {navs.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link key={item.href} href={item.href} className={active ? 'rounded-full bg-sky-50 px-3 py-1.5 font-semibold text-primary' : 'px-1.5 text-muted'}>
                {item.label}
              </Link>
            );
          })}
          <Link href="/login" className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
            切换身份 / 退出
          </Link>
        </div>
      </div>
    </nav>
  );
}
