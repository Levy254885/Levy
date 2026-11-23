'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/admin/Shell';
import { Flash, type Msg } from '@/components/admin/ui';
import { cld, fmtDate } from '@/lib/shared';
import type { Post } from '@/lib/types';

export default function PostsAdmin() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<Post[] | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const load = useCallback(() => api<Post[]>('posts').then(setRows).catch((e: Error) => setMsg({ t: 'error', m: e.message })), [api]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (p: Post) => {
    try { await api(`posts/${p.id}`, { method: 'PATCH', json: { published: !p.published } }); await load(); }
    catch (e) { setMsg({ t: 'error', m: (e as Error).message }); }
  };

  return (
    <>
      <div className="head"><div><h1>Blog</h1><p className="sub">Drafts stay hidden until you publish them.</p></div><Link className="btn" href="/admin/posts/new">+ New post</Link></div>
      <Flash msg={msg} />
      {rows === null ? <p className="empty">Loading…</p> : rows.length === 0 ? <p className="empty">No posts yet. Write your first one.</p> : rows.map((p) => (
        <div className={`item${p.published ? '' : ' draft'}`} key={p.id}>
          <div className="thumb">{p.cover ? <img src={cld(p.cover.url, 120)} alt="" /> : p.title.slice(0, 2).toUpperCase()}</div>
          <div className="info"><b>{p.title}</b><span><span className={`badge${p.published ? '' : ' draft'}`}>{p.published ? 'Live' : 'Draft'}</span>{fmtDate(p.publishedAt || p.createdAt)}</span></div>
          <div className="acts">
            <button className="mini" onClick={() => toggle(p)}>{p.published ? 'Unpublish' : 'Publish'}</button>
            {p.published && <a className="mini" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer">View</a>}
            <Link className="mini" href={`/admin/posts/${p.id}`}>Edit</Link>
          </div>
        </div>
      ))}
    </>
  );
}
