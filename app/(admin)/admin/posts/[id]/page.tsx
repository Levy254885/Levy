'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAdmin } from '@/components/admin/Shell';
import { Area, Check, Field, Flash, ImageField, type Msg } from '@/components/admin/ui';
import { csvList } from '@/lib/shared';
import type { Img, Post } from '@/lib/types';

const EMPTY = { title: '', excerpt: '', tags: '', body: '', published: false, regenSlug: false, cover: null as Img | null };

export default function PostForm() {
  const { api } = useAdmin();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const [f, setF] = useState(EMPTY);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((o) => ({ ...o, [k]: v }));

  useEffect(() => {
    if (isNew) return;
    api<Post>(`posts/${id}`)
      .then((p) => setF({ title: p.title, excerpt: p.excerpt, tags: p.tags.join(', '), body: p.body, published: p.published, regenSlug: false, cover: p.cover }))
      .catch((e: Error) => setMsg({ t: 'error', m: e.message }));
  }, [api, id, isNew]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api(isNew ? 'posts' : `posts/${id}`, { method: isNew ? 'POST' : 'PUT', json: { ...f, tags: csvList(f.tags) } });
      router.push('/admin/posts');
    } catch (x) { setMsg({ t: 'error', m: (x as Error).message }); setBusy(false); }
  }

  async function remove() {
    if (!confirm('Delete this post permanently?')) return;
    try { await api(`posts/${id}`, { method: 'DELETE' }); router.push('/admin/posts'); }
    catch (x) { setMsg({ t: 'error', m: (x as Error).message }); }
  }

  return (
    <>
      <div className="head"><h1>{isNew ? 'New post' : 'Edit post'}</h1><Link className="mini" href="/admin/posts">Back</Link></div>
      <Flash msg={msg} />
      <form className="card" onSubmit={save}>
        <Field label="Title" value={f.title} onChange={(v) => set('title', v)} required />
        <Area label="Summary (shown in lists and search results)" value={f.excerpt} onChange={(v) => set('excerpt', v)} rows={3} />
        <Field label="Tags" value={f.tags} onChange={(v) => set('tags', v)} help="Comma separated" />
        <ImageField label="Cover image" value={f.cover} onChange={(v) => set('cover', v)} />
        <Area label="Content" value={f.body} onChange={(v) => set('body', v)} rows={18} code help="Markdown: ## Heading, **bold**, *italic*, - lists, 1. numbered, > quote, `code`, ``` code blocks, [text](https://link), ![alt](https://image)." />
        {!isNew && <Check label="Update the URL to match the new title (breaks old links)" checked={f.regenSlug} onChange={(v) => set('regenSlug', v)} />}
        <Check label="Published" checked={f.published} onChange={(v) => set('published', v)} />
        <div className="bar-actions"><button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save post'}</button></div>
      </form>
      {!isNew && <button className="btn danger" type="button" onClick={remove}>Delete post</button>}
    </>
  );
}
