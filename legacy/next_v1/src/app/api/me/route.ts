import { ok, requireProfile } from '../_utils';

export async function GET() {
  const { profile } = await requireProfile();
  return ok(profile);
}
