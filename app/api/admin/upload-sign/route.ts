import { handle, requireAdmin } from '@/lib/auth';
import { signUpload } from '@/lib/cloudinary';

export const runtime = 'nodejs';

export const POST = handle(async (req) => {
  await requireAdmin(req);
  const p = signUpload('portfolio');
  if (!p.cloudName || !p.apiKey) return Response.json({ error: 'Cloudinary env vars are not set.' }, { status: 500 });
  return Response.json(p);
});
