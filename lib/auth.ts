import 'server-only';
import { adminAuth } from './firebase-admin';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Verifies the Firebase ID token and that the account is on the ADMIN_EMAILS allow-list. */
export async function requireAdmin(req: Request) {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) throw new HttpError(401, 'Not signed in');
  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(token);
  } catch {
    throw new HttpError(401, 'Session expired. Sign in again.');
  }
  const allow = (process.env.ADMIN_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!decoded.email || !allow.includes(decoded.email.toLowerCase())) throw new HttpError(403, 'This account is not an admin.');
  return decoded;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handle(fn: (req: Request, ctx: any) => Promise<Response>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: Request, ctx: any) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
      console.error(e);
      return Response.json({ error: 'Server error' }, { status: 500 });
    }
  };
}
