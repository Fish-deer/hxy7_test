import { generatePortfolio } from '@/features/portfolios/service';
import { fail, ok, requireProfile } from '../../../../_utils';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { profile } = await requireProfile();
  if (profile.role !== 'student') return fail('仅学生可生成', 403);
  const data = await generatePortfolio(params.id, profile.id);
  return ok(data);
}
