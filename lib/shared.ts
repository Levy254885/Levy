import type { Link } from './types';

export const slugify = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

export function safeUrl(u: string, mailto = false): string | null {
  u = (u || '').trim();
  try {
    const p = new URL(u);
    if ((p.protocol === 'http:' || p.protocol === 'https:') && p.host) return u;
    if (mailto && p.protocol === 'mailto:' && p.pathname) return u;
  } catch { /* not a URL */ }
  return null;
}

export function parseLinks(text: string): { links: Link[]; bad: number } {
  const links: Link[] = [];
  let bad = 0;
  for (let line of (text || '').split(/\r?\n/)) {
    line = line.trim();
    if (!line) continue;
    const i = line.lastIndexOf('|');
    const label = i >= 0 ? line.slice(0, i).trim() : '';
    const url = safeUrl(i >= 0 ? line.slice(i + 1) : line);
    if (!url) { bad++; continue; }
    links.push({ label: (label || 'View project').slice(0, 40), url });
  }
  return { links, bad };
}

export const linksToText = (l: Link[]) => l.map((x) => `${x.label} | ${x.url}`).join('\n');
export const csvList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
export const readingTime = (t: string) => Math.max(1, Math.ceil(t.split(/\s+/).filter(Boolean).length / 200));
export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/** Cloudinary delivery URL with automatic format/quality and a max width. */
export function cld(url: string, width = 800): string {
  return url.includes('/upload/') ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`) : url;
}
