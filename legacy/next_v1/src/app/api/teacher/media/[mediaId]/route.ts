import { fail, ok, requireProfile } from '../../../_utils';
import { demoMediaAssets } from '@/lib/demo/store';

export async function PATCH(req: Request, { params }: { params: { mediaId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可修改', 403);
  const body = await req.json();
  const idx = demoMediaAssets.findIndex((x: any) => x.id === params.mediaId);
  if (idx < 0) return fail('资源不存在', 404);
  demoMediaAssets[idx] = { ...demoMediaAssets[idx], ...body } as any;
  return ok(demoMediaAssets[idx]);
}

export async function DELETE(_: Request, { params }: { params: { mediaId: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可删除', 403);
  const idx = demoMediaAssets.findIndex((x: any) => x.id === params.mediaId);
  if (idx < 0) return fail('资源不存在', 404);
  demoMediaAssets.splice(idx, 1);
  return ok({ id: params.mediaId });
}
