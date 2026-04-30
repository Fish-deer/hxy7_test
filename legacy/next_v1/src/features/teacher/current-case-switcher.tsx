'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/features/activities/activity-helpers';

export function CurrentCaseSwitcher({ cases, currentCaseId }: { cases: any[]; currentCaseId: string }) {
  const router = useRouter();

  const switchCase = async (caseId: string) => {
    await api(`/api/teacher/cases/${caseId}`, { method: 'PATCH', body: JSON.stringify({ set_current: true }) });
    router.refresh();
  };

  return (
    <div className="grid gap-2 text-sm md:grid-cols-2">
      {cases.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => switchCase(item.id)}
          className={`rounded-lg border p-2 text-left ${item.id === currentCaseId ? 'border-primary bg-sky-50 text-primary' : 'bg-slate-50'}`}
        >
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted">{item.status} · 点击切换当前案例</p>
        </button>
      ))}
    </div>
  );
}
