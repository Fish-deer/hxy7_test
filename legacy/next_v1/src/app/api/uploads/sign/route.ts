import { fail, ok, requireProfile } from '../../_utils';

export async function POST(req: Request) {
  const { profile } = await requireProfile();
  if (profile.role !== 'student') return fail('仅学生可上传', 403);
  const { activity_id, file_name } = await req.json();
  const path = `${activity_id}/${profile.id}/${Date.now()}-${file_name}`;
  return ok({ bucket: 'evidences', path });
}
