'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useAdmin } from '@/components/admin/Shell';
import { Area, Card, Flash, type Msg } from '@/components/admin/ui';

export default function StackAdmin() {
  const { api } = useAdmin();
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  useEffect(() => {
    api<{ items: string[] }>('stack').then((d) => { setText(d.items.join('\n')); setLoaded(true); }).catch((e: Error) => setMsg({ t: 'error', m: e.message }));
  }, [api]);

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      const items = text.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
      const r = await api<{ items: string[] }>('stack', { method: 'PUT', json: { items } });
      setText(r.items.join('\n'));
      setMsg({ t: 'ok', m: `Saved ${r.items.length} items.` });
    } catch (x) { setMsg({ t: 'error', m: (x as Error).message }); }
  }

  return (
    <>
      <div className="head"><div><h1>Tech stack</h1><p className="sub">Shown as chips on your home page. An empty list hides the section.</p></div></div>
      <Flash msg={msg} />
      <form onSubmit={save}>
        <Card>
          <Area label="Technologies" value={text} onChange={setText} rows={12} help={loaded ? 'One per line (or comma separated). Order is kept.' : 'Loading…'} />
          <div className="bar-actions"><button className="btn" type="submit">Save stack</button></div>
        </Card>
      </form>
    </>
  );
}
