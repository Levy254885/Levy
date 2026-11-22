/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import TA from '@/components/TA';
import { getProject, getSite } from '@/lib/data';
import { md } from '@/lib/md';
import { cld } from '@/lib/shared';

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.title, description: p.summary || undefined,
    openGraph: { title: p.title, description: p.summary || undefined, images: p.image ? [cld(p.image.url, 1200)] : undefined },
  };
}

export default async function ProjectPage({ params }: Props) {
  const [p, { s }] = await Promise.all([getProject((await params).slug), getSite()]);
  if (!p) notFound();
  return (
    <main className="wrap">
      <div className="page">
        <Link className="back" href="/#work"><Icon name="back" size={18} />All projects</Link>
        <div className="pagehead">
          {p.category && <small>{p.category}</small>}
          <h1>{p.title}</h1>
          {p.summary && <p className="sub">{p.summary}</p>}
        </div>
        {p.image && <div className="cover"><img src={cld(p.image.url, 1200)} alt={p.title} /></div>}
        {p.tech.length > 0 && <div className="chips" style={{ marginTop: 20 }}>{p.tech.map((t) => <span className="chip" key={t}><i />{t}</span>)}</div>}
        {p.links.length > 0 && (
          <div className="linkbtns">
            {p.links.map((l, i) => (
              <TA key={l.url} className={`lbtn${i ? ' alt' : ''}`} href={l.url} event="project_link" label={`${p.title}: ${l.label}`}>
                {l.label}<Icon name="external" size={16} />
              </TA>
            ))}
          </div>
        )}
        {p.body && <div className="prose" dangerouslySetInnerHTML={{ __html: md(p.body) }} />}
      </div>
      <footer className="foot"><span>© {new Date().getFullYear()} {s.name}</span><Link href="/">Home</Link></footer>
    </main>
  );
}
