import { Card } from '@/components/ui/card';
import { getSessionProfile } from '@/lib/auth/session';
import { demoSites } from '@/lib/demo/store';

export default async function TeacherRoutesPage() {
  await getSessionProfile('teacher');
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">景区 / 路线配置页</h1>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {demoSites.map((s) => <Card key={s.id}><h3 className="font-semibold">{s.order_index}. {s.name}</h3><p className="mt-1 text-sm text-muted">{s.intro}</p></Card>)}
      </div>
    </div>
  );
}
