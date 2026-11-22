import 'server-only';
import { db } from './firebase-admin';
import { HttpError } from './auth';
import { destroyImage, isCloudinaryUrl } from './cloudinary';
import { csvList, safeUrl, slugify } from './shared';
import type { Img, Link } from './types';

export type CName = 'projects' | 'posts' | 'experience';
export const isC = (x: string): x is CName => x === 'projects' || x === 'posts' || x === 'experience';
const ORDERED: CName[] = ['projects', 'experience'];
const IMAGE_FIELD: Partial<Record<CName, string>> = { projects: 'image', posts: 'cover' };

type Doc = Record<string, unknown> & { id: string };
type Body = Record<string, unknown>;

const nowIso = () => new Date().toISOString();
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

export function cleanImage(v: unknown): Img | null {
  if (!v) return null;
  const o = v as Partial<Img>;
  if (typeof o.url !== 'string' || typeof o.publicId !== 'string' || !isCloudinaryUrl(o.url) || !o.publicId.startsWith('portfolio/')) {
    throw new HttpError(400, 'Invalid image');
  }
  return { url: o.url, publicId: o.publicId };
}

async function uniqueSlug(col: CName, base: string, excludeId?: string) {
  let slug = base;
  for (let i = 2; ; i++) {
    const q = await db().collection(col).where('slug', '==', slug).limit(2).get();
    if (q.docs.every((d) => d.id === excludeId)) return slug;
    slug = `${base}-${i}`;
  }
}

function cleanLinks(v: unknown): Link[] {
  if (!Array.isArray(v)) return [];
  const out: Link[] = [];
  for (const l of v.slice(0, 12)) {
    const url = safeUrl(String((l as Link)?.url ?? ''));
    if (url) out.push({ label: str((l as Link).label, 40) || 'View project', url });
  }
  return out;
}

const cleanList = (v: unknown, max = 30): string[] =>
  (Array.isArray(v) ? v : typeof v === 'string' ? csvList(v) : [])
    .map((x) => String(x).trim().slice(0, 40)).filter(Boolean).slice(0, max);

async function clean(col: CName, b: Body, existing?: Doc): Promise<Body> {
  if (col === 'projects') {
    const title = str(b.title, 200);
    if (!title) throw new HttpError(400, 'Title is required.');
    return {
      title, category: str(b.category, 60), platform: b.platform === 'mobile' ? 'mobile' : 'web',
      summary: str(b.summary, 600), body: text(b.body, 60000), tech: cleanList(b.tech), links: cleanLinks(b.links),
      image: cleanImage(b.image), published: b.published !== false,
      slug: await uniqueSlug(col, slugify(title), existing?.id),
    };
  }
  if (col === 'posts') {
    const title = str(b.title, 200);
    if (!title) throw new HttpError(400, 'Title is required.');
    const published = b.published === true;
    const keepSlug = existing && b.regenSlug !== true ? String(existing.slug) : null;
    return {
      title, excerpt: str(b.excerpt, 400), body: text(b.body, 100000), tags: cleanList(b.tags, 10), cover: cleanImage(b.cover),
      published, publishedAt: (existing?.publishedAt as string | null) || (published ? nowIso() : null),
      slug: keepSlug ?? (await uniqueSlug(col, slugify(title), existing?.id)),
    };
  }
  const role = str(b.role, 200);
  if (!role) throw new HttpError(400, 'Role is required.');
  return { role, period: str(b.period, 80), meta: str(b.meta, 200), details: str(b.details, 2000) };
}

export async function listItems(col: CName): Promise<Doc[]> {
  const snap = await db().collection(col).get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Doc);
  if (ORDERED.includes(col)) return items.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
  return items.sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));
}

export async function getItem(col: CName, id: string): Promise<Doc> {
  const d = await db().collection(col).doc(id).get();
  if (!d.exists) throw new HttpError(404, 'Not found');
  return { id: d.id, ...d.data() } as Doc;
}

export async function createItem(col: CName, body: Body) {
  const data = await clean(col, body);
  const ts = nowIso();
  if (ORDERED.includes(col)) {
    const all = await listItems(col);
    data.order = col === 'projects'
      ? Math.max(0, ...all.map((x) => Number(x.order ?? 0))) + 1
      : Math.min(1, ...all.map((x) => Number(x.order ?? 0))) - 1;
  }
  const ref = await db().collection(col).add({ ...data, createdAt: ts, updatedAt: ts });
  return { id: ref.id, ...data };
}

export async function updateItem(col: CName, id: string, body: Body) {
  const existing = await getItem(col, id);
  const data = await clean(col, body, existing);
  await db().collection(col).doc(id).update({ ...data, updatedAt: nowIso() });
  const f = IMAGE_FIELD[col];
  if (f) {
    const oldImg = existing[f] as Img | null;
    const newImg = data[f] as Img | null;
    if (oldImg && oldImg.publicId !== newImg?.publicId) await destroyImage(oldImg.publicId);
  }
  return { id, ...data };
}

export async function patchPublished(col: CName, id: string, published: boolean) {
  if (col === 'experience') throw new HttpError(400, 'Not supported');
  const existing = await getItem(col, id);
  const upd: Body = { published, updatedAt: nowIso() };
  if (col === 'posts' && published && !existing.publishedAt) upd.publishedAt = nowIso();
  await db().collection(col).doc(id).update(upd);
}

export async function deleteItem(col: CName, id: string) {
  const existing = await getItem(col, id);
  const f = IMAGE_FIELD[col];
  if (f) await destroyImage((existing[f] as Img | null)?.publicId);
  await db().collection(col).doc(id).delete();
}

export async function moveItem(col: CName, id: string, dir: 'up' | 'down') {
  if (!ORDERED.includes(col)) throw new HttpError(400, 'Not supported');
  const ids = (await listItems(col)).map((x) => x.id);
  const i = ids.indexOf(id);
  if (i < 0) throw new HttpError(404, 'Not found');
  const j = dir === 'up' ? i - 1 : i + 1;
  if (j >= 0 && j < ids.length) [ids[i], ids[j]] = [ids[j], ids[i]];
  const batch = db().batch();
  ids.forEach((x, n) => batch.update(db().collection(col).doc(x), { order: n + 1 }));
  await batch.commit();
}

/** One-time starter content: your three named projects as empty cards. */
export async function seedIfNeeded() {
  const flag = db().doc('meta/seeded');
  if ((await flag.get()).exists) return;
  const any = await db().collection('projects').limit(1).get();
  if (any.empty) {
    const ts = nowIso();
    const names = ['LOOK AFRICA Lead Hunter', 'PataKeja', 'AACL Digital'];
    for (const [i, title] of names.entries()) {
      await db().collection('projects').add({
        title, slug: slugify(title), category: '', platform: 'web', summary: '', body: '', tech: [], links: [],
        image: null, published: true, order: i + 1, createdAt: ts, updatedAt: ts,
      });
    }
  }
  await flag.set({ at: nowIso() });
}
