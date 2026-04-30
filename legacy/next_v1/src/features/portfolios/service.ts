import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo/mode';
import { demoState } from '@/lib/demo/store';

export async function generatePortfolio(activityId: string, studentId: string) {
  if (isDemoMode()) {
    const questions = demoState.questions.filter((x) => x.activity_id === activityId && x.student_id === studentId);
    const evidences = demoState.evidences.filter((x) => x.activity_id === activityId && x.student_id === studentId);
    const progresses = demoState.progresses.filter((x) => x.activity_id === activityId && x.student_id === studentId);
    const summary = `提出问题${questions.length}条，提交证据${evidences.length}条，完成点位${progresses.length}个；已生成学习档案。`;

    const pf = {
      id: `pf-${Date.now()}`,
      activity_id: activityId,
      student_id: studentId,
      summary,
      teacher_score: 88,
      teacher_comment: '可继续补充证据提升质量。',
      status: 'draft',
      updated_at: new Date().toISOString()
    };

    demoState.portfolios = demoState.portfolios.filter((x) => !(x.activity_id === activityId && x.student_id === studentId));
    demoState.portfolios.unshift(pf as any);
    return pf;
  }

  const supabase = createClient();

  const [{ data: questions }, { data: evidences }, { data: tasks }, { data: progresses }] = await Promise.all([
    supabase.from('question_items').select('*').eq('activity_id', activityId).eq('student_id', studentId),
    supabase.from('evidences').select('*').eq('activity_id', activityId).eq('student_id', studentId),
    supabase.from('tasks').select('*').eq('activity_id', activityId).order('sort_order'),
    supabase.from('site_progresses').select('site_id').eq('activity_id', activityId).eq('student_id', studentId)
  ]);

  const completedSiteCount = progresses?.length ?? 0;
  const summary = `提出问题${questions?.length ?? 0}条，提交证据${evidences?.length ?? 0}条，完成点位${completedSiteCount}个；请结合证据补充结论。`;

  const { data: portfolio } = await supabase
    .from('portfolios')
    .upsert({ activity_id: activityId, student_id: studentId, summary, status: 'draft' }, { onConflict: 'activity_id,student_id' })
    .select('*')
    .single();

  if (portfolio) {
    await supabase.from('portfolio_items').delete().eq('portfolio_id', portfolio.id);

    const items = [
      ...(questions ?? []).map((q: any, i: number) => ({
        portfolio_id: portfolio.id,
        item_type: 'question',
        sort_order: i + 1,
        content: { phase: q.phase, content: q.content }
      })),
      ...(tasks ?? []).map((t: any, i: number) => ({
        portfolio_id: portfolio.id,
        item_type: 'task',
        sort_order: 50 + i,
        content: { phase: t.phase, title: t.title, required: t.required }
      })),
      ...(evidences ?? []).map((e: any, i: number) => ({
        portfolio_id: portfolio.id,
        item_type: 'evidence',
        sort_order: 100 + i,
        content: { type: e.evidence_type, note: e.note, text: e.text_content, file_url: e.file_url }
      })),
      {
        portfolio_id: portfolio.id,
        item_type: 'conclusion',
        sort_order: 999,
        content: { completed_sites: completedSiteCount }
      }
    ];

    if (items.length) await supabase.from('portfolio_items').insert(items);
  }

  return portfolio;
}
