'use client';
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState } from 'react';
import Icon from './Icon';
import { cld } from '@/lib/shared';

export type CardProject = {
  id: string; slug: string; title: string; category: string; platform: 'web' | 'mobile'; summary: string; image: string | null;
};

function Card({ p, i }: { p: CardProject; i: number }) {
  return (
    <article className="pcard pop" style={{ ['--d' as string]: `${i * 70}ms` }}>
      <div className="txt">
        {p.category && <small>{p.category}</small>}
        <h3>{p.title}</h3>
        {p.summary && <p>{p.summary}</p>}
        <Link className="more" href={`/projects/${p.slug}`}>See More<Icon name="arrow" size={14} /></Link>
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
      <div className="seg rv" data-tab={tab}>
        <i className="pill" aria-hidden="true" />
        <button type="button" className={tab === 'mobile' ? 'on' : ''} onClick={() => setTab('mobile')}>MOBILE</button>
        <button type="button" className={tab === 'web' ? 'on' : ''} onClick={() => setTab('web')}>WEB</button>
      </div>
      <div className="plist">
        {items.length ? items.map((p, i) => <Card key={`${tab}-${p.id}`} p={p} i={i} />) : <p className="empty" style={{ gridColumn: '1/-1' }}>No {tab} projects yet.</p>}
      </div>
    </>
  );
}
