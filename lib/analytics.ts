import 'server-only';
import crypto from 'crypto';
import { FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from './firebase-admin';
import type { Analytics } from './types';

const TZ = process.env.SITE_TZ || 'Africa/Nairobi';
export const BOT_RE = /bot|crawl|spider|slurp|preview|monitor|curl|wget|python-requests|headless|lighthouse|facebookexternalhit|vercel-screenshot/i;
export const EVENT_NAMES = new Set(['whatsapp', 'resume', 'github', 'linkedin', 'email', 'project_link']);

// Firestore map keys are encoded so paths/URLs with dots or slashes are safe.
const enc = (s: string) => 'k' + Buffer.from(s).toString('base64url');
const dec = (k: string) => Buffer.from(k.slice(1), 'base64url').toString();

export const dayStr = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const addDays = (day: string, n: number) => {
  const d = new Date(day + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export function deviceOf(ua: string) {
  const u = ua.toLowerCase();
  if (u.includes('ipad') || (u.includes('android') && !u.includes('mobile'))) return 'tablet';
  if (u.includes('mobi') || u.includes('iphone')) return 'mobile';
  return 'desktop';
}

/** Daily-rotating anonymous id. No cookie, and the IP address is never stored. */
function visitorId(req: Request, day: string) {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const salt = process.env.ANALYTICS_SALT || process.env.FIREBASE_PROJECT_ID || 'salt';
  return crypto.createHash('sha256').update(`${day}|${ip}|${req.headers.get('user-agent') || ''}|${salt}`).digest('hex').slice(0, 20);
}

export const countable = (req: Request) => {
  const ua = req.headers.get('user-agent') || '';
  return !!ua && !BOT_RE.test(ua) && req.headers.get('dnt') !== '1';
};

export async function recordView(req: Request, path: string, referrer: string) {
  const day = dayStr();
  const ref = db().doc(`stats/${day}`);
  let isNew = true;
  try {
    await ref.collection('visitors').doc(visitorId(req, day)).create({ expireAt: Timestamp.fromMillis(Date.now() + 8 * 864e5) });
  } catch (e) {
    const err = e as { code?: number | string; message?: string };
    if (err.code === 6 || err.code === 'already-exists' || String(err.message).includes('ALREADY_EXISTS')) isNew = false;
    else throw e;
  }
  let refHost = '';
  try { refHost = new URL(referrer).host.replace(/^www\./, ''); } catch { /* none */ }
  const own = (req.headers.get('host') || '').replace(/^www\./, '');
  if (refHost === own) refHost = '';
  const inc = FieldValue.increment;
  await ref.set({
    views: inc(1), visitors: inc(isNew ? 1 : 0),
    paths: { [enc(path)]: inc(1) },
    referrers: { [enc(refHost || '(direct)')]: inc(1) },
    devices: { [deviceOf(req.headers.get('user-agent') || '')]: inc(1) },
    countries: { [req.headers.get('x-vercel-ip-country') || 'unknown']: inc(1) },
  }, { merge: true });
}

export async function recordEvent(name: string, label: string) {
  await db().doc(`stats/${dayStr()}`).set({ events: { [enc(`${name}|${label}`)]: FieldValue.increment(1) } }, { merge: true });
}

type Counts = Record<string, number>;
const sumMaps = (docs: Record<string, unknown>[], key: string): Counts => {
  const out: Counts = {};
  for (const d of docs) for (const [k, v] of Object.entries((d[key] as Counts) || {})) out[k] = (out[k] || 0) + v;
  return out;
};
const top = (c: Counts, n = 8) => Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n);

export async function readAnalytics(days: number): Promise<Analytics> {
  const today = dayStr();
  const start = addDays(today, -(days - 1));
  const prevStart = addDays(start, -days);
  const snap = await db().collection('stats').where(FieldPath.documentId(), '>=', prevStart).get();
  const byDay = new Map(snap.docs.map((d) => [d.id, d.data()]));

  const series = Array.from({ length: days }, (_, i) => {
    const day = addDays(start, i);
    const d = byDay.get(day);
    return { day, views: Number(d?.views ?? 0), visitors: Number(d?.visitors ?? 0) };
  });
  const views = series.reduce((a, s) => a + s.views, 0);
  const prev = Array.from({ length: days }, (_, i) => Number(byDay.get(addDays(prevStart, i))?.views ?? 0)).reduce((a, b) => a + b, 0);
  const cur = series.map((s) => byDay.get(s.day)).filter(Boolean) as Record<string, unknown>[];

  const titles: Record<string, string> = { '/': 'Home', '/blog': 'Blog' };
  const [pr, po] = await Promise.all([db().collection('projects').get(), db().collection('posts').get()]);
  pr.docs.forEach((d) => { titles[`/projects/${d.data().slug}`] = String(d.data().title); });
  po.docs.forEach((d) => { titles[`/blog/${d.data().slug}`] = String(d.data().title); });

  const paths = sumMaps(cur, 'paths');
  const refs = sumMaps(cur, 'referrers');
  return {
    series, views, visitors: series.reduce((a, s) => a + s.visitors, 0), today: series[series.length - 1].views,
    change: prev === 0 ? null : Math.round(((views - prev) / prev) * 100),
    topPages: top(paths).map(([k, v]) => ({ path: dec(k), title: titles[dec(k)] ?? dec(k), views: v })),
    referrers: top(refs).map(([k, v]) => ({ name: dec(k) === '(direct)' ? 'Direct / none' : dec(k), views: v })),
    devices: top(sumMaps(cur, 'devices')).map(([name, v]) => ({ name, views: v })),
    countries: top(sumMaps(cur, 'countries')).map(([name, v]) => ({ name, views: v })),
    events: top(sumMaps(cur, 'events'), 12).map(([k, v]) => {
      const [name, ...rest] = dec(k).split('|');
      return { name, label: rest.join('|'), count: v };
    }),
  };
}
