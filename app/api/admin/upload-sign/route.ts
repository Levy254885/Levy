import { handle, requireAdmin } from '@/lib/auth';
import { cfg, signUpload } from '@/lib/cloudinary';

export const runtime = 'nodejs';

export const POST = handle(async (req) => {
  await requireAdmin(req);
  const c = cfg();
  const missing = [!c.cloud && 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', !c.key && 'CLOUDINARY_API_KEY', !c.secret && 'CLOUDINARY_API_SECRET'].filter(Boolean);
  if (missing.length) return Response.json({ error: `Cloudinary is missing: ${missing.join(', ')}. Add them in .env.local / Vercel, then restart or redeploy.` }, { status: 500 });
  const p = signUpload('portfolio');
  return Response.json(p);
});
