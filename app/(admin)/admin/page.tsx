'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Chart from '@/components/admin/Chart';
import { useAdmin } from '@/components/admin/Shell';
import { Card } from '@/components/admin/ui';
import type { Analytics } from '@/lib/types';

const pretty = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function List({ rows, empty }: { rows: { name: string; v: number }[]; empty: string }) {
  if (!rows.length) return <p className="empty">{empty}</p>;
  return <>{rows.map((r) => <div className="rowline" key={r.name}><span className="n">{r.name}</span><span className="v">{r.v}</span></div>)}</>;
}

export default function Dashboard() {
  const { api } = useAdmin();
  const [days, setDays] = useState(30);
  const [a, setA] = useState<Analytics | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setErr('');
    api<Analytics>(`analytics?range=${days}`).then(setA).catch((e: Error) => setErr(e.message));
  }, [api, days]);

  if (err) return <div className="flash error">{err}</div>;
  if (!a) return <p className="empty">Loading analytics…</p>;
  const devTotal = a.devices.reduce((s, d) => s + d.views, 0) || 1;

  return (
    <>
      <div className="head">
        <div><h1>Analytics</h1><p className="sub">Privacy-friendly: no cookies, no stored IP addresses, bots and your own visits excluded.</p></div>
        <div className="seg">{[7, 30, 90].map((d) => <a key={d} href="#" className={d === days ? 'on' : ''} onClick={(e) => { e.preventDefault(); setDays(d); }}>{d}d</a>)}</div>
      </div>

      <div className="stats">
        <div className="stat"><span>Page views</span><b>{a.views}</b>
          {a.change !== null && <em className={a.change < 0 ? 'neg' : ''}>{a.change >= 0 ? '+' : ''}{a.change}% vs previous {days}d</em>}</div>
        <div className="stat"><span>Visitors</span><b>{a.visitors}</b><em style={{ color: 'var(--muted)' }}>daily unique</em></div>
        <div className="stat"><span>Today</span><b>{a.today}</b><em style={{ color: 'var(--muted)' }}>views</em></div>
        <div className="stat"><span>Top country</span><b>{a.countries[0]?.name ?? '–'}</b><em style={{ color: 'var(--muted)' }}>{a.countries[0] ? `${a.countries[0].views} views` : 'no data yet'}</em></div>
      </div>

      <Card title="Views per day">
        <Chart series={a.series} />
        <div className="legend"><span><i style={{ background: 'var(--tint)', border: '1px solid var(--line)' }} />Page views</span><span><i style={{ background: 'var(--blue)' }} />Visitors</span></div>
      </Card>

      <div className="cols">
        <Card title="Top pages"><List empty="No views yet. Open your site in another browser to test." rows={a.topPages.map((p) => ({ name: p.title, v: p.views }))} /></Card>
        <Card title="Where visitors come from"><List empty="No data yet." rows={a.referrers.map((r) => ({ name: r.name, v: r.views }))} /></Card>
        <Card title="Devices">
          {a.devices.length ? a.devices.map((d) => {
            const pct = Math.round((d.views / devTotal) * 100);
            return (
              <div key={d.name} style={{ padding: '8px 0' }}>
                <div className="rowline" style={{ border: 0, padding: 0 }}><span className="n" style={{ textTransform: 'capitalize' }}>{d.name}</span><span className="v">{pct}%</span></div>
                <div className="bar-h"><i style={{ width: `${pct}%` }} /></div>
              </div>
            );
          }) : <p className="empty">No data yet.</p>}
        </Card>
        <Card title="Countries"><List empty="No data yet." rows={a.countries.map((c) => ({ name: c.name, v: c.views }))} /></Card>
        <Card title="Clicks"><List empty="No clicks recorded yet (WhatsApp, résumé, GitHub, project links)."
          rows={a.events.map((e) => ({ name: pretty(e.name) + (e.label ? ` · ${e.label}` : ''), v: e.count }))} /></Card>
      </div>

      <div className="bar-actions">
        <Link className="btn" href="/admin/projects/new">Add project</Link>
        <Link className="btn ghost" href="/admin/posts/new">Write post</Link>
      </div>
    </>
  );
}
