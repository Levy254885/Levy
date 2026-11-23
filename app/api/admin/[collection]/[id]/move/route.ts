import { revalidatePath } from 'next/cache';
import { HttpError, handle, requireAdmin } from '@/lib/auth';
import { isC, moveItem } from '@/lib/collections';

export const runtime = 'nodejs';

export const POST = handle(async (req, ctx) => {
  await requireAdmin(req);
  const { collection, id } = (await ctx.params) as { collection: string; id: string };
  if (!isC(collection)) throw new HttpError(404, 'Not found');
  const b = (await req.json()) as { dir?: unknown };
  await moveItem(collection, id, b.dir === 'up' ? 'up' : 'down');
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
});
