import { fail, ok, requireProfile } from '../../_utils';
import { demoSites } from '@/lib/demo/store';

export async function GET(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可查看', 403);
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get('case_id');
  return ok(caseId ? demoSites.filter((x: any) => x.case_id === caseId) : demoSites);
}


export async function POST(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可创建', 403);
  const body = await req.json();
  const item = { id: `site-${Date.now()}`, order_index: body.order_index || demoSites.length + 1, intro: '', ai_context: '', teacher_hint: '', ...body };
  demoSites.push(item as any);
  return ok(item);
}
