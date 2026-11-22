/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Fragment } from 'react';
import Icon from '@/components/Icon';
import ProjectTabs from '@/components/ProjectTabs';
import TA from '@/components/TA';
import { getExperience, getPosts, getProjects, getSite, getStack } from '@/lib/data';
import { cld, fmtDate } from '@/lib/shared';

export const revalidate = 60;

export default async function Home() {
  const [{ s, portrait }, projects, posts, stack, experience] = await Promise.all([
    getSite(), getProjects(), getPosts(), getStack(), getExperience(),
  ]);
  const stats = [1, 2, 3]
    .map((i) => ({ value: s[`stat${i}_value`], label: s[`stat${i}_label`] }))
    .filter((x) => x.value && x.label);
  if (!stats.length && projects.length) stats.push({ value: String(projects.length), label: 'Projects' });
  const hasSocial = !!(s.github || s.linkedin || s.email);
  const portraitUrl = portrait ? cld(portrait.url, 700) : '';

  return (
    <main>
      <div className="heroimg">
        <div className="circle" />
        {portraitUrl ? <img className="portrait" src={portraitUrl} alt={s.name} /> : <div className="ph">{s.initials}</div>}
        {stats.length > 0 && (
          <div className="statcard">{stats.map((x) => (<Fragment key={x.label}><b>{x.value}</b><span>{x.label}</span></Fragment>))}</div>
        )}
        {s.email && (
          <TA className="emailchip" href={`mailto:${s.email}`} event="email" label="hero" external={false}>
            <Icon name="mailf" size={18} /><span>{s.email}</span>
          </TA>
        )}
      </div>

      <div className="wrap">
        {s.status_show === '1' && s.status_text ? <span className="status"><i />{s.status_text}</span> : <div style={{ height: 30 }} />}
        <div className="hello">{s.name}</div>
        <h1 className="title">{s.title}</h1>
        {s.lead && <p className="lead">{s.lead}</p>}
        <div className="ctas">
          {s.resume_url && (
            <TA className="resume" href={s.resume_url} event="resume"><span>Resume</span><em><Icon name="arrow" size={22} /></em></TA>
          )}
          {s.whatsapp ? (
            <TA className="wa" href={`https://wa.me/${s.whatsapp}`} event="whatsapp" label="hero"><b><Icon name="whatsapp" /></b>WhatsApp Me</TA>
          ) : s.email ? (
            <TA className="wa" href={`mailto:${s.email}`} event="email" label="hero-cta" external={false}><b><Icon name="mail" /></b>Email Me</TA>
          ) : null}
        </div>
      </div>
      <div className="hr" />

      <div className="wrap">
        <div className="banner">
          {s.banner_script && (
            <>
              <div className="sig">{s.banner_script}</div>
              <svg className="line" viewBox="0 0 210 40" fill="none" aria-hidden="true"><path d="M3 36C60 14 130 6 205 6" stroke="#1f7aff" strokeWidth="3" strokeLinecap="round" /></svg>
            </>
          )}
          {portraitUrl && <img src={portraitUrl} alt="" aria-hidden="true" />}
        </div>
        <div className="socials">
          {s.github && <TA href={s.github} event="github"><b><Icon name="github" size={19} />GitHub</b><span>Follow Me</span></TA>}
          {s.linkedin && <TA href={s.linkedin} event="linkedin"><b><Icon name="linkedin" size={19} />LinkedIn</b><span>Connect</span></TA>}
          {s.email && <TA href={`mailto:${s.email}`} event="email" label="banner" external={false}><b><Icon name="mailf" size={19} />Email</b><span>Say Hello</span></TA>}
        </div>

        <section id="about" style={{ paddingTop: hasSocial ? 30 : 46 }}>
          <h2 className="h2">{s.about_heading}</h2>
          {s.about_text && <p className="p">{s.about_text}</p>}
          <a className="btn" href="#experience">More about Me</a>
        </section>

        {stack.length > 0 && (
          <section id="stack">
            <h2 className="h2">My Toolkit,</h2>
            <div className="h2s">Stack</div>
            <p className="p sm">The languages, frameworks and services I reach for most.</p>
            <div className="chips">{stack.map((t) => <span className="chip" key={t}><i />{t}</span>)}</div>
          </section>
        )}

        <section id="work">
          <h2 className="h2">All Projects,</h2>
          <div className="h2s">Selected Work</div>
          <p className="p sm">Apps and platforms I&apos;ve built and shipped. Tap a project for the full story, stack and links.</p>
          <ProjectTabs projects={projects.map((p) => ({
            id: p.id, slug: p.slug, title: p.title, category: p.category, platform: p.platform, summary: p.summary, image: p.image?.url ?? null,
          }))} />
        </section>

        {posts.length > 0 && (
          <section id="writing">
            <h2 className="h2">Latest Writing,</h2>
            <div className="h2s">Blog</div>
            <div className="plist">
              {posts.slice(0, 3).map((p) => (
                <article className="pcard" key={p.id}>
                  <div className="txt">
                    <small>{fmtDate(p.publishedAt)}</small>
                    <h3 style={{ textTransform: 'none', letterSpacing: 0 }}>{p.title}</h3>
                    {p.excerpt && <p>{p.excerpt}</p>}
                    <Link className="more" href={`/blog/${p.slug}`}>Read</Link>
                  </div>
                  {p.cover && <div className="shot"><img src={cld(p.cover.url, 400)} alt="" loading="lazy" /></div>}
                </article>
              ))}
            </div>
            <Link className="more-link" href="/blog">All posts</Link>
          </section>
        )}

        {experience.length > 0 && (
          <section id="experience">
            <h2 className="h2">Where I&apos;ve Worked,</h2>
            <div className="h2s">Experience</div>
            <p className="p sm">Roles and work that shaped how I build software.</p>
            <div className="tl">
              {experience.map((e) => (
                <div className="tcard" key={e.id}>
                  {e.period && <span className="tag">— {e.period}</span>}
                  <h3>{e.role}</h3>
                  {e.meta && <div className="meta">{e.meta}</div>}
                  {e.details && <p>{e.details}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="contact" className="cta">
          <h2>{s.cta_heading}<i /></h2>
          {s.email && <TA className="mail" href={`mailto:${s.email}`} event="email" label="footer" external={false}>{s.email}</TA>}
        </section>
        <footer className="foot">
          <span>© {new Date().getFullYear()} {s.name}</span>
          {posts.length > 0 && <Link href="/blog">Blog</Link>}
          <a href="#home">Back to top ↑</a>
        </footer>
      </div>
    </main>
  );
}
