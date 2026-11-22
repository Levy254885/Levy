import { handle, requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

export const GET = handle(async (req) => {
  const d = await requireAdmin(req);
  return Response.json({ email: d.email });
});
