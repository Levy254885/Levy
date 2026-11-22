import { revalidatePath } from 'next/cache';
import { handle, requireAdmin } from '@/lib/auth';
import { getStack } from '@/lib/data';
import { db } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export const GET = handle(async (req) => {
  await requireAdmin(req);
  return Response.json({ items: await getStack() });
});

export const PUT = handle(async (req) => {
  await requireAdmin(req);
  const b = (await req.json()) as { items?: unknown };
  const seen = new Set<string>();
  const items: string[] = [];
  for (const raw of Array.isArray(b.items) ? b.items : []) {
    const n = String(raw).trim().slice(0, 40);
    if (n && !seen.has(n.toLowerCase())) { seen.add(n.toLowerCase()); items.push(n); }
  }
  await db().doc('meta/stack').set({ items: items.slice(0, 80) });
  revalidatePath('/', 'layout');
  return Response.json({ items });
});
