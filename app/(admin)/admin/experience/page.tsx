'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/admin/Shell';
import { Flash, type Msg } from '@/components/admin/ui';
import type { Experience } from '@/lib/types';

export default function ExperienceAdmin() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<Experience[] | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const load = useCallback(() => api<Experience[]>('experience').then(setRows).catch((e: Error) => setMsg({ t: 'error', m: e.message })), [api]);
  useEffect(() => { load(); }, [load]);

  const move = async (id: string, dir: 'up' | 'down') => {
    try { await api(`experience/${id}/move`, { method: 'POST', json: { dir } }); await load(); }
    catch (e) { setMsg({ t: 'error', m: (e as Error).message }); }
  };

  return (
    <>
      <div className="head"><div><h1>Experience</h1><p className="sub">Top of the list appears first on the timeline.</p></div><Link className="btn" href="/admin/experience/new">+ Add role</Link></div>
      <Flash msg={msg} />
      {rows === null ? <p className="empty">Loading…</p> : rows.length === 0 ? <p className="empty">No entries yet. The Experience section stays hidden on your site until you add one.</p> : rows.map((e) => (
        <div className="item" key={e.id}>
          <div className="info"><b>{e.role}</b><span>{e.period}{e.meta ? ` · ${e.meta}` : ''}</span></div>
          <div className="acts">
            <button className="mini" aria-label="Move up" onClick={() => move(e.id, 'up')}>↑</button>
            <button className="mini" aria-label="Move down" onClick={() => move(e.id, 'down')}>↓</button>
            <Link className="mini" href={`/admin/experience/${e.id}`}>Edit</Link>
          </div>
        </div>
      ))}
    </>
  );
}
