'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAdmin } from '@/components/admin/Shell';
import { Area, Card, Check, Field, Flash, ImageField, type Msg } from '@/components/admin/ui';
import { auth } from '@/lib/firebase-client';
import { SETTING_GROUPS } from '@/lib/settings-schema';
import type { Img, Site } from '@/lib/types';

export default function SettingsAdmin() {
  const { api, email } = useAdmin();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [portrait, setPortrait] = useState<Img | null>(null);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Site>('settings').then((d) => { setVals(d.s); setPortrait(d.portrait); setReady(true); }).catch((e: Error) => setMsg({ t: 'error', m: e.message }));
  }, [api]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      await api('settings', { method: 'PUT', json: { ...vals, portrait } });
      setMsg({ t: 'ok', m: 'Settings saved.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (x) { setMsg({ t: 'error', m: (x as Error).message }); }
    finally { setBusy(false); }
  }

  async function resetPassword() {
    try { await sendPasswordResetEmail(auth(), email); setMsg({ t: 'ok', m: `Password reset email sent to ${email}.` }); }
    catch { setMsg({ t: 'error', m: 'Could not send the reset email.' }); }
  }

  if (!ready) return <><Flash msg={msg} /><p className="empty">Loading…</p></>;

  return (
    <>
      <div className="head"><div><h1>Settings</h1><p className="sub">Everything on the home page that isn&apos;t a project, post or role.</p></div></div>
      <Flash msg={msg} />
      <form onSubmit={save}>
        {SETTING_GROUPS.map((g, gi) => (
          <Card key={g.title} title={g.title}>
            {gi === 0 && (
              <>
                <ImageField label="Portrait" value={portrait} onChange={setPortrait} help="Best: a transparent PNG cut-out cropped at the shoulders, taller than wide. Click Save settings to keep it." />
              </>
            )}
            <div className="formgrid two">
              {g.fields.map((fd) => {
                const v = vals[fd.key] ?? '';
                if (fd.kind === 'check') return <Check key={fd.key} label={fd.label} checked={v === '1'} onChange={(c) => setVals({ ...vals, [fd.key]: c ? '1' : '0' })} />;
                if (fd.kind === 'area') return <div key={fd.key} style={{ gridColumn: '1/-1' }}><Area label={fd.label} value={v} rows={3} help={fd.help} onChange={(x) => setVals({ ...vals, [fd.key]: x })} /></div>;
                return <Field key={fd.key} label={fd.label} value={v} help={fd.help} type={fd.kind === 'email' || fd.kind === 'url' ? fd.kind : 'text'} onChange={(x) => setVals({ ...vals, [fd.key]: x })} />;
              })}
            </div>
          </Card>
        ))}
        <div className="bar-actions" style={{ marginBottom: 28 }}><button className="btn" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button></div>
      </form>
      <Card title="Account">
        <p className="hint" style={{ marginBottom: 12 }}>Signed in as <b>{email}</b>. Passwords are managed by Firebase Authentication.</p>
        <button className="btn ghost" type="button" onClick={resetPassword}>Email me a password reset link</button>
      </Card>
    </>
  );
}
