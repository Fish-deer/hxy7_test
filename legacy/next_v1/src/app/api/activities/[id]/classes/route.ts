import { fail, ok, requireProfile } from '../../../_utils';
import { demoCases } from '@/lib/demo/store';

const demoActivityClasses: Record<string, string[]> = {
  'demo-activity-1': ['class-7a']
};

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { supabase } = await requireProfile();
  if (!supabase) return ok((demoActivityClasses[params.id] ?? demoCases[0]?.published_class_ids ?? []).map((class_id) => ({ class_id })));
  const { data } = await supabase.from('activity_classes').select('class_id').eq('activity_id', params.id);
  return ok(data ?? []);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可配置班级', 403);

  const { class_ids } = await req.json();
  if (!Array.isArray(class_ids) || !class_ids.length) return fail('class_ids 不能为空');

  if (!supabase) {
    demoActivityClasses[params.id] = class_ids;
    const idx = demoCases.findIndex((item: any) => item.id === 'case-hs-001');
    if (idx >= 0) demoCases[idx] = { ...demoCases[idx], published_class_ids: class_ids } as any;
    return ok(true);
  }

  await supabase.from('activity_classes').delete().eq('activity_id', params.id);
  const rows = class_ids.map((class_id: string) => ({ activity_id: params.id, class_id }));
  const { error } = await supabase.from('activity_classes').upsert(rows, { onConflict: 'activity_id,class_id' });
  if (error) return fail(error.message);

  return ok(true);
}
