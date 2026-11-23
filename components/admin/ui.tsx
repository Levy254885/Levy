'use client';
/* eslint-disable @next/next/no-img-element */
import { useState, type ChangeEvent, type ReactNode } from 'react';
import { cld } from '@/lib/shared';
import type { Img } from '@/lib/types';
import { useAdmin } from './Shell';

export type Msg = { t: 'ok' | 'error'; m: string } | null;
export const Flash = ({ msg }: { msg: Msg }) => (msg ? <div className={`flash ${msg.t}`}>{msg.m}</div> : null);

export function Field({ label, value, onChange, type = 'text', help, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; help?: string; required?: boolean;
}) {
  return (
    <label className="f"><span>{label}</span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} />
      {help && <small>{help}</small>}
    </label>
  );
}

export function Area({ label, value, onChange, rows = 4, help, code }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; help?: string; code?: boolean;
}) {
  return (
    <label className="f"><span>{label}</span>
      <textarea rows={rows} value={value} className={code ? 'code' : ''} onChange={(e) => onChange(e.target.value)} />
      {help && <small>{help}</small>}
    </label>
  );
}

export const Check = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>
);

export const Card = ({ children, title }: { children: ReactNode; title?: string }) => (
  <div className="card">{title && <h2>{title}</h2>}{children}</div>
);

type Sign = { cloudName: string; apiKey: string; timestamp: number; folder: string; allowed_formats: string; signature: string };

/** Uploads straight from the browser to Cloudinary using a signature from our server. */
export function ImageField({ label, value, onChange, help }: { label: string; value: Img | null; onChange: (v: Img | null) => void; help?: string }) {
  const { api } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr('');
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return setErr('Use a PNG, JPG, WEBP or GIF image.');
    if (file.size > 10 * 1024 * 1024) return setErr('Max 10 MB.');
    setBusy(true);
    try {
      const s = await api<Sign>('upload-sign', { method: 'POST' });
      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', s.apiKey);
      fd.append('timestamp', String(s.timestamp));
      fd.append('signature', s.signature);
      fd.append('folder', s.folder);
      fd.append('allowed_formats', s.allowed_formats);
      const r = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error?.message || 'Upload failed');
      onChange({ url: j.secure_url, publicId: j.public_id });
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="f">
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</span>
      {value && (
        <div className="preview">
          <img src={cld(value.url, 200)} alt="" />
          <button type="button" className="mini danger" onClick={() => onChange(null)}>Remove</button>
        </div>
      )}
      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pick} disabled={busy} />
      <small>{busy ? 'Uploading…' : help || 'PNG, JPG, WEBP or GIF, up to 10 MB. Click Save to keep the change.'}</small>
      {err && <small style={{ color: 'var(--danger)' }}>{err}</small>}
    </div>
  );
}
