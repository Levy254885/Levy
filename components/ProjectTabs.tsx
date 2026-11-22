'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState } from 'react';
import { cld } from '@/lib/shared';

export type CardProject = {
  id: string; slug: string; title: string; category: string; platform: 'web' | 'mobile'; summary: string; image: string | null;
};

function Card({ p }: { p: CardProject }) {
  return (
    <article className="pcard">
      <div className="txt">
        {p.category && <small>{p.category}</small>}
        <h3>{p.title}</h3>
        {p.summary && <p>{p.summary}</p>}
        <Link className="more" href={`/projects/${p.slug}`}>See More</Link>
      </div>
      <div className={`shot${p.image ? '' : ' mono'}`}>
        {p.image ? <img src={cld(p.image, 400)} alt={p.title} loading="lazy" /> : p.title.slice(0, 2).toUpperCase()}
      </div>
    </article>
  );
}

export default function ProjectTabs({ projects }: { projects: CardProject[] }) {
  const hasMobile = projects.some((p) => p.platform === 'mobile');
  const [tab, setTab] = useState<'mobile' | 'web'>(hasMobile ? 'mobile' : 'web');
  const items = projects.filter((p) => p.platform === tab);
  return (
    <>
      <div className="seg">
        <button type="button" className={tab === 'mobile' ? 'on' : ''} onClick={() => setTab('mobile')}>MOBILE</button>
        <button type="button" className={tab === 'web' ? 'on' : ''} onClick={() => setTab('web')}>WEB</button>
      </div>
      <div className="plist">
        {items.length ? items.map((p) => <Card key={p.id} p={p} />) : <p className="empty" style={{ gridColumn: '1/-1' }}>No {tab} projects yet.</p>}
      </div>
    </>
  );
}
