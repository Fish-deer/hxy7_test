import { askLearningAI } from '@/features/ai/service';
import { fail, ok, requireProfile } from '../../_utils';

export async function POST(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'student') return fail('仅学生可调用', 403);
  const body = await req.json();
  const reply = await askLearningAI({ ...body, student_id: profile.id });
  return ok({ reply });
}
