/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { getPosts, getSite } from '@/lib/data';
import { cld, fmtDate } from '@/lib/shared';

export const revalidate = 60;
export const metadata: Metadata = { title: 'Blog', description: 'Articles and notes.' };

export default async function BlogList() {
  const [posts, { s }] = await Promise.all([getPosts(), getSite()]);
  return (
    <main className="wrap">
      <div className="page" style={{ maxWidth: 'none' }}>
        <Link className="back" href="/"><Icon name="back" size={18} />Home</Link>
        <h2 className="h2">Writing,</h2>
        <div className="h2s">Blog</div>
        {posts.length ? (
          <div className="plist" style={{ marginTop: 22 }}>
            {posts.map((p) => (
              <article className="pcard" key={p.id}>
                <div className="txt">
                  <small>{fmtDate(p.publishedAt)}{p.tags[0] ? ` · ${p.tags[0]}` : ''}</small>
                  <h3 style={{ textTransform: 'none', letterSpacing: 0 }}>{p.title}</h3>
                  {p.excerpt && <p>{p.excerpt}</p>}
                  <Link className="more" href={`/blog/${p.slug}`}>Read</Link>
                </div>
                {p.cover && <div className="shot"><img src={cld(p.cover.url, 400)} alt="" loading="lazy" /></div>}
              </article>
            ))}
          </div>
        ) : <p className="empty-state">No posts yet.</p>}
      </div>
      <footer className="foot"><span>© {new Date().getFullYear()} {s.name}</span><Link href="/">Home</Link></footer>
    </main>
  );
}
