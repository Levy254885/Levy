import { revalidatePath } from 'next/cache';
import { HttpError, handle, requireAdmin } from '@/lib/auth';
import { deleteItem, getItem, isC, patchPublished, updateItem } from '@/lib/collections';

export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function params(ctx: any) {
  const { collection, id } = (await ctx.params) as { collection: string; id: string };
  if (!isC(collection)) throw new HttpError(404, 'Not found');
  return { collection, id };
}

export const GET = handle(async (req, ctx) => {
  await requireAdmin(req);
  const { collection, id } = await params(ctx);
  return Response.json(await getItem(collection, id));
});

export const PUT = handle(async (req, ctx) => {
  await requireAdmin(req);
  const { collection, id } = await params(ctx);
  const item = await updateItem(collection, id, await req.json());
  revalidatePath('/', 'layout');
  return Response.json(item);
});

export const PATCH = handle(async (req, ctx) => {
  await requireAdmin(req);
  const { collection, id } = await params(ctx);
  const b = (await req.json()) as { published?: unknown };
  await patchPublished(collection, id, b.published === true);
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
});

export const DELETE = handle(async (req, ctx) => {
  await requireAdmin(req);
  const { collection, id } = await params(ctx);
  await deleteItem(collection, id);
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
});
