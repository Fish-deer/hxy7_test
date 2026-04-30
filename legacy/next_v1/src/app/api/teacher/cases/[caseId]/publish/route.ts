import { fail, ok, requireProfile } from '../../../../_utils';
import { demoCases } from '@/lib/demo/store';

export async function POST(req: Request, { params }: { params: { caseId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可发布', 403);
  const body = await req.json().catch(() => ({}));
  const idx = demoCases.findIndex((c: any) => c.id === params.caseId);
  if (idx < 0) return fail('案例不存在', 404);
  demoCases[idx] = { ...demoCases[idx], status: body.status || 'published', published_class_ids: body.class_ids || demoCases[idx].published_class_ids } as any;
  return ok(demoCases[idx]);
}
