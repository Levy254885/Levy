/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { getPost, getSite } from '@/lib/data';
import { md } from '@/lib/md';
import { cld, fmtDate, readingTime } from '@/lib/shared';

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.title, description: p.excerpt || undefined,
    openGraph: { title: p.title, description: p.excerpt || undefined, type: 'article', images: p.cover ? [cld(p.cover.url, 1200)] : undefined },
  };
}

export default async function BlogPost({ params }: Props) {
  const [p, { s }] = await Promise.all([getPost((await params).slug), getSite()]);
  if (!p) notFound();
  return (
    <main className="wrap">
      <article className="page">
        <Link className="back" href="/blog"><Icon name="back" size={18} />All posts</Link>
        <div className="pagehead">
          <small>{fmtDate(p.publishedAt)} · {readingTime(p.body)} min read</small>
          <h1>{p.title}</h1>
          {p.excerpt && <p className="sub">{p.excerpt}</p>}
        </div>
        {p.tags.length > 0 && <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>}
        {p.cover && <div className="cover"><img src={cld(p.cover.url, 1200)} alt="" /></div>}
        <div className="prose" dangerouslySetInnerHTML={{ __html: md(p.body) }} />
      </article>
      <footer className="foot"><span>© {new Date().getFullYear()} {s.name}</span><Link href="/">Home</Link></footer>
    </main>
  );
}
