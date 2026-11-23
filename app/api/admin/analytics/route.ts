import { handle, requireAdmin } from '@/lib/auth';
import { readAnalytics } from '@/lib/analytics';

export const runtime = 'nodejs';

export const GET = handle(async (req) => {
  await requireAdmin(req);
  const r = Number(new URL(req.url).searchParams.get('range'));
  return Response.json(await readAnalytics([7, 30, 90].includes(r) ? r : 30));
});
