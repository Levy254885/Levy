'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/admin/Shell';
import { Flash, type Msg } from '@/components/admin/ui';
import { cld } from '@/lib/shared';
import type { Project } from '@/lib/types';

export default function ProjectsAdmin() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<Project[] | null>(null);
  const [msg, setMsg] = useState<Msg>(null);

  const load = useCallback(() => api<Project[]>('projects').then(setRows).catch((e: Error) => setMsg({ t: 'error', m: e.message })), [api]);
  useEffect(() => { load(); }, [load]);

  const act = async (fn: () => Promise<unknown>) => {
    try { await fn(); await load(); } catch (e) { setMsg({ t: 'error', m: (e as Error).message }); }
  };

  return (
    <>
      <div className="head"><div><h1>Projects</h1><p className="sub">Order here is the order shown on your site.</p></div><Link className="btn" href="/admin/projects/new">+ Add project</Link></div>
      <Flash msg={msg} />
      {rows === null ? <p className="empty">Loading…</p> : rows.length === 0 ? <p className="empty">No projects yet.</p> : rows.map((p) => (
        <div className={`item${p.published ? '' : ' draft'}`} key={p.id}>
          <div className="thumb">{p.image ? <img src={cld(p.image.url, 120)} alt="" /> : p.title.slice(0, 2).toUpperCase()}</div>
          <div className="info"><b>{p.title}</b><span><span className={`badge${p.published ? '' : ' draft'}`}>{p.published ? 'Live' : 'Draft'}</span>{p.platform === 'web' ? 'Web' : 'Mobile'}{p.category ? ` · ${p.category}` : ''}</span></div>
          <div className="acts">
            <button className="mini" aria-label="Move up" onClick={() => act(() => api(`projects/${p.id}/move`, { method: 'POST', json: { dir: 'up' } }))}>↑</button>
            <button className="mini" aria-label="Move down" onClick={() => act(() => api(`projects/${p.id}/move`, { method: 'POST', json: { dir: 'down' } }))}>↓</button>
            <button className="mini" onClick={() => act(() => api(`projects/${p.id}`, { method: 'PATCH', json: { published: !p.published } }))}>{p.published ? 'Hide' : 'Publish'}</button>
            {p.published && <a className="mini" href={`/projects/${p.slug}`} target="_blank" rel="noreferrer">View</a>}
            <Link className="mini" href={`/admin/projects/${p.id}`}>Edit</Link>
          </div>
        </div>
      ))}
    </>
  );
}
