import { fail, ok, requireProfile } from '../../../_utils';
import { demoSites, demoMediaAssets, demoTasks } from '@/lib/demo/store';

export async function PATCH(req: Request, { params }: { params: { siteId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可修改', 403);
  const body = await req.json();
  const idx = demoSites.findIndex((x: any) => x.id === params.siteId);
  if (idx < 0) return fail('点位不存在', 404);
  demoSites[idx] = { ...demoSites[idx], ...body } as any;
  return ok(demoSites[idx]);
}

export async function DELETE(_: Request, { params }: { params: { siteId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可删除', 403);
  const idx = demoSites.findIndex((x: any) => x.id === params.siteId);
  if (idx < 0) return fail('点位不存在', 404);
  demoSites.splice(idx, 1);
  for (let i = demoMediaAssets.length - 1; i >= 0; i--) if ((demoMediaAssets[i] as any).site_id === params.siteId) demoMediaAssets.splice(i, 1);
  for (let i = demoTasks.length - 1; i >= 0; i--) if ((demoTasks[i] as any).site_id === params.siteId) demoTasks.splice(i, 1);
  return ok({ id: params.siteId });
}
