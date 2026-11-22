import { revalidatePath } from 'next/cache';
import { handle, requireAdmin } from '@/lib/auth';
import { seedIfNeeded } from '@/lib/collections';

export const runtime = 'nodejs';

export const POST = handle(async (req) => {
  await requireAdmin(req);
  await seedIfNeeded();
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
});
