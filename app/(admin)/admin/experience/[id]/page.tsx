'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAdmin } from '@/components/admin/Shell';
import { Area, Field, Flash, type Msg } from '@/components/admin/ui';
import type { Experience } from '@/lib/types';

export default function ExperienceForm() {
  const { api } = useAdmin();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const [f, setF] = useState({ role: '', period: '', meta: '', details: '' });
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api<Experience>(`experience/${id}`)
      .then((e) => setF({ role: e.role, period: e.period, meta: e.meta, details: e.details }))
      .catch((e: Error) => setMsg({ t: 'error', m: e.message }));
  }, [api, id, isNew]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try { await api(isNew ? 'experience' : `experience/${id}`, { method: isNew ? 'POST' : 'PUT', json: f }); router.push('/admin/experience'); }
    catch (x) { setMsg({ t: 'error', m: (x as Error).message }); setBusy(false); }
  }
  async function remove() {
    if (!confirm('Delete this entry?')) return;
    try { await api(`experience/${id}`, { method: 'DELETE' }); router.push('/admin/experience'); }
    catch (x) { setMsg({ t: 'error', m: (x as Error).message }); }
  }

  return (
    <>
      <div className="head"><h1>{isNew ? 'New role' : 'Edit role'}</h1><Link className="mini" href="/admin/experience">Back</Link></div>
      <Flash msg={msg} />
      <form className="card" onSubmit={save}>
        <Field label="Role title" value={f.role} onChange={(v) => setF({ ...f, role: v })} required />
        <Field label="Period" value={f.period} onChange={(v) => setF({ ...f, period: v })} help="Shown as a small tag, e.g. Jan 2025 – Present" />
        <Field label="Company and tech" value={f.meta} onChange={(v) => setF({ ...f, meta: v })} help="e.g. Company • React, Node.js" />
        <Area label="What you did" value={f.details} onChange={(v) => setF({ ...f, details: v })} rows={5} />
        <div className="bar-actions"><button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
      </form>
      {!isNew && <button className="btn danger" type="button" onClick={remove}>Delete</button>}
    </>
  );
}
