import { countable, recordView } from '@/lib/analytics';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (!countable(req)) return new Response(null, { status: 204 });
    const b = (await req.json().catch(() => ({}))) as { path?: unknown; referrer?: unknown };
    const path = typeof b.path === 'string' ? b.path.slice(0, 200) : '';
    if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return new Response(null, { status: 204 });
    await recordView(req, path, typeof b.referrer === 'string' ? b.referrer.slice(0, 300) : '');
  } catch (e) {
    console.error('track failed', e);
  }
  return new Response(null, { status: 204 });
}
