import { revalidatePath } from 'next/cache';
import { HttpError, handle, requireAdmin } from '@/lib/auth';
import { createItem, isC, listItems } from '@/lib/collections';

export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(ctx: any) {
  const { collection } = (await ctx.params) as { collection: string };
  if (!isC(collection)) throw new HttpError(404, 'Not found');
  return collection;
}

export const GET = handle(async (req, ctx) => {
  await requireAdmin(req);
  return Response.json(await listItems(await col(ctx)));
});

export const POST = handle(async (req, ctx) => {
  await requireAdmin(req);
  const item = await createItem(await col(ctx), await req.json());
  revalidatePath('/', 'layout');
  return Response.json(item, { status: 201 });
});
