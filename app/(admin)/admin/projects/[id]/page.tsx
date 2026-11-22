'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAdmin } from '@/components/admin/Shell';
import { Area, Check, Field, Flash, ImageField, type Msg } from '@/components/admin/ui';
import { csvList, linksToText, parseLinks } from '@/lib/shared';
import type { Img, Project } from '@/lib/types';

const EMPTY = { title: '', platform: 'web', category: '', summary: '', tech: '', links: '', body: '', published: true, image: null as Img | null };

export default function ProjectForm() {
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
    api<Project>(`projects/${id}`)
      .then((p) => setF({ title: p.title, platform: p.platform, category: p.category, summary: p.summary, tech: p.tech.join(', '), links: linksToText(p.links), body: p.body, published: p.published, image: p.image }))
      .catch((e: Error) => setMsg({ t: 'error', m: e.message }));
  }, [api, id, isNew]);

  async function save(e: FormEvent) {
    e.preventDefault();
    const { links, bad } = parseLinks(f.links);
    if (bad) return setMsg({ t: 'error', m: `${bad} link line(s) are not valid. Use: Label | https://url` });
    setBusy(true); setMsg(null);
    try {
      await api(isNew ? 'projects' : `projects/${id}`, { method: isNew ? 'POST' : 'PUT', json: { ...f, tech: csvList(f.tech), links } });
      router.push('/admin/projects');
    } catch (x) { setMsg({ t: 'error', m: (x as Error).message }); setBusy(false); }
  }

  async function remove() {
    if (!confirm('Delete this project permanently?')) return;
    try { await api(`projects/${id}`, { method: 'DELETE' }); router.push('/admin/projects'); }
    catch (x) { setMsg({ t: 'error', m: (x as Error).message }); }
  }

  return (
    <>
      <div className="head"><h1>{isNew ? 'New project' : 'Edit project'}</h1><Link className="mini" href="/admin/projects">Back</Link></div>
      <Flash msg={msg} />
      <form className="card" onSubmit={save}>
        <div className="formgrid two">
          <Field label="Project name" value={f.title} onChange={(v) => set('title', v)} required />
          <label className="f"><span>Type</span>
            <select value={f.platform} onChange={(e) => set('platform', e.target.value)}><option value="web">Web</option><option value="mobile">Mobile</option></select>
            <small>Decides which tab it appears under.</small></label>
        </div>
        <Field label="Category label" value={f.category} onChange={(v) => set('category', v)} help="Small blue label on the card, e.g. SaaS, Marketplace" />
        <Area label="Short description (shown on the card)" value={f.summary} onChange={(v) => set('summary', v)} rows={3} help="One or two sentences." />
        <Field label="Technologies" value={f.tech} onChange={(v) => set('tech', v)} help="Comma separated, e.g. Next.js, PostgreSQL, Tailwind" />
        <Area label="Links" value={f.links} onChange={(v) => set('links', v)} rows={3} help="One per line as: Label | https://url   e.g. Live site | https://example.com" />
        <ImageField label="Screenshot / cover image" value={f.image} onChange={(v) => set('image', v)} />
        <Area label="Full story (project page)" value={f.body} onChange={(v) => set('body', v)} rows={12} code help="Markdown: ## Heading, **bold**, - lists, [text](https://link), ![alt](https://image). Leave empty for a card-only project." />
        <Check label="Published (visible on the site)" checked={f.published} onChange={(v) => set('published', v)} />
        <div className="bar-actions"><button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save project'}</button></div>
      </form>
      {!isNew && <button className="btn danger" type="button" onClick={remove}>Delete project</button>}
    </>
  );
}
