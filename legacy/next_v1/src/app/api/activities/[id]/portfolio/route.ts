import { fail, ok, requireProfile } from '../../../_utils';
import { isDemoMode } from '@/lib/demo/mode';
import { getDemoEvidences, getDemoPortfolios } from '@/lib/demo/persist';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'student') return fail('仅学生可查看个人档案', 403);

  if (isDemoMode()) {
    const data = getDemoPortfolios(params.id, profile.id)[0] ?? null;
    const items = getDemoEvidences(params.id, profile.id)
      .filter((x: any) => x.in_portfolio)
      .map((x: any, i: number) => ({ id: `item-${i}`, item_type: 'evidence', content: x }));
    return ok({ ...data, portfolio_items: items });
  }

  const { data } = await supabase!
    .from('portfolios')
    .select('*,portfolio_items(*)')
    .eq('activity_id', params.id)
    .eq('student_id', profile.id)
    .single();
  return ok(data);
}
