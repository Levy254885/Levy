import 'server-only';
import { db } from './firebase-admin';
import { DEFAULTS } from './settings-schema';
import type { Experience, Post, Project, Site } from './types';

// Public read helpers. Every one falls back to empty/defaults so a missing database never breaks the build.
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (e) { console.error(e); return fallback; }
}

export const getSite = (): Promise<Site> =>
  safe(async () => {
    const d = (await db().doc('settings/site').get()).data() ?? {};
    const s = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS)) if (typeof d[k] === 'string') s[k] = d[k];
    return { s, portrait: d.portrait ?? null };
  }, { s: { ...DEFAULTS }, portrait: null });

export const getProjects = (): Promise<Project[]> =>
  safe(async () => {
    const snap = await db().collection('projects').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project)
      .filter((p) => p.published).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, []);

export const getProject = async (slug: string) => (await getProjects()).find((p) => p.slug === slug) ?? null;

export const getPosts = (): Promise<Post[]> =>
  safe(async () => {
    const snap = await db().collection('posts').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post)
      .filter((p) => p.published).sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  }, []);

export const getPost = async (slug: string) => (await getPosts()).find((p) => p.slug === slug) ?? null;

export const getExperience = (): Promise<Experience[]> =>
  safe(async () => {
    const snap = await db().collection('experience').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Experience).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, []);

export const getStack = (): Promise<string[]> =>
  safe(async () => ((await db().doc('meta/stack').get()).data()?.items as string[] | undefined) ?? [], []);
