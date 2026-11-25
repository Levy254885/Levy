'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';

type ApiInit = { method?: string; json?: unknown };
type Ctx = { api: <T = unknown>(path: string, init?: ApiInit) => Promise<T>; email: string };
const AdminCtx = createContext<Ctx | null>(null);

export function useAdmin(): Ctx {
  const c = useContext(AdminCtx);
  if (!c) throw new Error('useAdmin must be used inside the admin shell');
  return c;
}

const NAV = [
  ['/admin', 'Dashboard'], ['/admin/projects', 'Projects'], ['/admin/posts', 'Blog'],
  ['/admin/experience', 'Experience'], ['/admin/stack', 'Stack'], ['/admin/settings', 'Settings'],
] as const;

function Login({ denied }: { denied: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    try { await signInWithEmailAndPassword(auth(), email.trim(), password); }
    catch { setError('Wrong email or password.'); }
    finally { setBusy(false); }
  }
  async function reset() {
    if (!email.trim()) return setError('Enter your email first.');
    try { await sendPasswordResetEmail(auth(), email.trim()); setInfo('If that account exists, a reset email is on its way.'); setError(''); }
    catch { setError('Could not send the reset email.'); }
  }

  return (
    <div className="login">
      <form className="card" onSubmit={submit}>
        <div className="brand" style={{ marginBottom: 18 }}><span className="logo">LM</span>Admin login</div>
        {denied && <div className="flash error">This account is not allowed to manage the site.</div>}
        {error && <div className="flash error">{error}</div>}
        {info && <div className="flash ok">{info}</div>}
        <label className="f"><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></label>
        <label className="f"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        <button className="btn" style={{ width: '100%' }} type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
        <p className="hint" style={{ marginTop: 14 }}><button type="button" className="linkbtn" onClick={reset}>Forgot password?</button></p>
      </form>
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [status, setStatus] = useState<'checking' | 'ok' | 'denied'>('checking');
  const [dark, setDark] = useState(false);
  const [fatal, setFatal] = useState('');

  const resolved = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (!resolved.current) setFatal('The sign-in service did not respond. Check the NEXT_PUBLIC_FIREBASE_* variables, add this domain under Firebase Authentication > Settings > Authorized domains, and make sure no browser extension or firewall blocks googleapis.com.');
    }, 8000);
    try {
      const off = onAuthStateChanged(auth(), (u) => { resolved.current = true; clearTimeout(t); setUser(u); setStatus('checking'); }, (e) => { resolved.current = true; setFatal(e.message); });
      return () => { clearTimeout(t); off(); };
    } catch (e) { clearTimeout(t); setFatal((e as Error).message); setUser(null); }
  }, []);
  useEffect(() => { setDark(document.documentElement.dataset.theme === 'dark'); }, []);

  useEffect(() => {
    if (!user) return;
    let live = true;
    (async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!live) return;
        if (r.ok) {
          try { localStorage.setItem('noTrack', '1'); } catch { /* ignore */ }
          setStatus('ok');
          fetch('/api/admin/seed', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        } else if (r.status === 401 || r.status === 403) {
          await signOut(auth());
          setStatus('denied');
        } else {
          const d = await r.json().catch(() => ({} as { error?: string }));
          setFatal(d.error || `Server error (${r.status}). Check the environment variables on the server.`);
        }
      } catch (e) { if (live) setFatal((e as Error).message || 'Could not reach the server.'); }
    })();
    return () => { live = false; };
  }, [user]);

  const api = useCallback(async <T,>(path: string, init: ApiInit = {}): Promise<T> => {
    const u = auth().currentUser;
    if (!u) throw new Error('Not signed in');
    const token = await u.getIdToken();
    const res = await fetch(`/api/admin/${path}`, {
      method: init.method ?? 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(init.json !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText);
    return data as T;
  }, []);

  const ctx = useMemo(() => ({ api, email: user?.email ?? '' }), [api, user]);

  if (fatal) return (
    <div className="login"><div className="card" style={{ maxWidth: 460 }}>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Admin can&apos;t start</h1>
      <div className="flash error">{fatal}</div>
      <p className="hint">Check that every variable from <code>.env.example</code> is set (locally in <code>.env.local</code>, on Vercel under Environment Variables), then restart or redeploy. Also add your domain under Firebase Authentication &gt; Settings &gt; Authorized domains.</p>
    </div></div>
  );
  if (user === undefined) return <div className="login"><p className="hint">Loading…</p></div>;
  if (!user) return <Login denied={status === 'denied'} />;
  if (status !== 'ok') return <div className="login"><p className="hint">{status === 'denied' ? 'Not allowed.' : 'Checking access…'}</p></div>;

  const toggleTheme = () => {
    const t = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* ignore */ }
    setDark(!dark);
  };

  return (
    <AdminCtx.Provider value={ctx}>
      <div className="top">
        <div className="in">
          <Link className="brand" href="/admin"><span className="logo">LM</span><span>Admin</span></Link>
          <div className="right">
            <a className="mini" href="/" target="_blank" rel="noreferrer">View site</a>
            <button className="ibtn" type="button" onClick={toggleTheme} aria-label="Toggle theme">{dark ? '☀' : '☾'}</button>
            <button className="mini" type="button" onClick={() => signOut(auth())}>Log out</button>
          </div>
        </div>
        <nav className="nav">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className={(href === '/admin' ? pathname === href : pathname.startsWith(href)) ? 'on' : ''}>{label}</Link>
          ))}
        </nav>
      </div>
      <main>{children}</main>
    </AdminCtx.Provider>
  );
}
