import { countable, EVENT_NAMES, recordEvent } from '@/lib/analytics';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (!countable(req)) return new Response(null, { status: 204 });
    const b = (await req.json().catch(() => ({}))) as { name?: unknown; label?: unknown };
    const name = String(b.name ?? '');
    if (EVENT_NAMES.has(name)) await recordEvent(name, String(b.label ?? '').slice(0, 80));
  } catch (e) {
    console.error('event failed', e);
  }
  return new Response(null, { status: 204 });
}
