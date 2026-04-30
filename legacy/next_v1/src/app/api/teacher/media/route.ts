import { fail, ok, requireProfile } from '../../_utils';
import { demoMediaAssets } from '@/lib/demo/store';

export async function GET(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可查看', 403);
  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get('case_id');
  return ok(caseId ? demoMediaAssets.filter((x: any) => x.case_id === caseId) : demoMediaAssets);
}


export async function POST(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可新增', 403);
  const body = await req.json();
  const item = { id: `m-${Date.now()}`, ...body };
  demoMediaAssets.push(item as any);
  return ok(item);
}
