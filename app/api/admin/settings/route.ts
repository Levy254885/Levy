import { revalidatePath } from 'next/cache';
import { HttpError, handle, requireAdmin } from '@/lib/auth';
import { destroyImage } from '@/lib/cloudinary';
import { cleanImage } from '@/lib/collections';
import { db } from '@/lib/firebase-admin';
import { getSite } from '@/lib/data';
import { safeUrl } from '@/lib/shared';
import { SETTING_GROUPS } from '@/lib/settings-schema';

export const runtime = 'nodejs';

export const GET = handle(async (req) => {
  await requireAdmin(req);
  return Response.json(await getSite());
});

export const PUT = handle(async (req) => {
  await requireAdmin(req);
  const b = (await req.json()) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const g of SETTING_GROUPS) {
    for (const f of g.fields) {
      let v = typeof b[f.key] === 'string' ? (b[f.key] as string).trim().slice(0, 2000) : '';
      if (f.kind === 'check') v = b[f.key] === '1' ? '1' : '0';
      else if (f.kind === 'url' && v && !safeUrl(v)) throw new HttpError(400, `${f.label} must start with https://`);
      else if (f.kind === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) throw new HttpError(400, `${f.label} is not a valid email.`);
      else if (f.key === 'whatsapp') v = v.replace(/\D/g, '');
      out[f.key] = v;
    }
  }
  const portrait = cleanImage(b.portrait);
  const old = (await getSite()).portrait;
  await db().doc('settings/site').set({ ...out, portrait, updatedAt: new Date().toISOString() }, { merge: true });
  if (old && old.publicId !== portrait?.publicId) await destroyImage(old.publicId);
  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
});
