import { fail, ok, requireProfile } from '../../../_utils';
import { isDemoMode } from '@/lib/demo/mode';
import { reviewDemoPortfolio } from '@/lib/demo/persist';

export async function PATCH(req: Request, { params }: { params: { portfolioId: string } }) {
  const { profile, supabase } = await requireProfile();
  if (profile.role !== 'teacher') return fail('仅教师可评价', 403);
  const body = await req.json();

  if (isDemoMode()) {
    const portfolio = reviewDemoPortfolio(params.portfolioId, body);
    if (!portfolio) return fail('档案不存在', 404);
    return ok(portfolio);
  }

  const { data, error } = await supabase!
    .from('portfolios')
    .update({ ...body, status: 'reviewed', updated_at: new Date().toISOString() })
    .eq('id', params.portfolioId)
    .select('*')
    .single();
  if (error) return fail(error.message);
  return ok(data);
}
