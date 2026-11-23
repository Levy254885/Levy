/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Fragment } from 'react';
import Icon from '@/components/Icon';
import ProjectTabs from '@/components/ProjectTabs';
import TA from '@/components/TA';
import TechIcon from '@/components/TechIcon';
import { getExperience, getPosts, getProjects, getSite, getStack } from '@/lib/data';
import { cld, fmtDate } from '@/lib/shared';

export const revalidate = 60;

const DEFAULT_PORTRAIT = '/levy.webp';
const delay = (n: number) => ({ ['--d' as string]: `${n * 70}ms` });

export default async function Home() {
  const [{ s, portrait }, projects, posts, stack, experience] = await Promise.all([
    getSite(), getProjects(), getPosts(), getStack(), getExperience(),
  ]);
  const stats = [1, 2, 3]
    .map((i) => ({ value: s[`stat${i}_value`], label: s[`stat${i}_label`] }))
    .filter((x) => x.value && x.label);
  if (!stats.length && projects.length) stats.push({ value: String(projects.length), label: projects.length === 1 ? 'Project' : 'Projects' });
  const hasSocial = !!(s.github || s.linkedin || s.email);
  const portraitUrl = portrait ? cld(portrait.url, 900) : DEFAULT_PORTRAIT;

  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-in">
          <div className="hero-art">
            <div className="circle">
              <svg viewBox="0 0 100 100" aria-hidden="true" className="arcs">
                <circle cx="50" cy="50" r="47" pathLength="100" strokeDasharray="22 78" />
                <circle cx="50" cy="50" r="38" pathLength="100" strokeDasharray="30 70" />
                <circle cx="50" cy="50" r="29" pathLength="100" strokeDasharray="38 62" />
                <circle cx="50" cy="50" r="20" pathLength="100" strokeDasharray="46 54" />
              </svg>
            </div>
            <img className="portrait" src={portraitUrl} alt={s.name} fetchPriority="high" />
            {stats.length > 0 && (
              <div className="statcard">{stats.map((x) => (<Fragment key={x.label}><b>{x.value}</b><span>{x.label}</span></Fragment>))}</div>
            )}
            {s.email && (
              <TA className="emailchip" href={`mailto:${s.email}`} event="email" label="hero" external={false}>
                <Icon name="mailf" size={20} /><span>{s.email}</span>
              </TA>
            )}
          </div>

          <div className="hero-copy">
            {s.status_show === '1' && s.status_text && <span className="status rv"><i />{s.status_text}</span>}
            <div className="hello rv" style={delay(1)}>{s.name}</div>
            <h1 className="title rv" style={delay(2)}>{s.title}</h1>
            {s.lead && <p className="lead rv" style={delay(3)}>{s.lead}</p>}
            <div className="ctas rv" style={delay(4)}>
              {s.resume_url && (
                <TA className="resume" href={s.resume_url} event="resume"><span>Resume</span><em><Icon name="arrow" size={22} /></em></TA>
              )}
              {s.whatsapp ? (
                <TA className="wa" href={`https://wa.me/${s.whatsapp}`} event="whatsapp" label="hero"><b><Icon name="whatsapp" size={24} /></b>WhatsApp Me</TA>
              ) : s.email ? (
                <TA className="wa" href={`mailto:${s.email}`} event="email" label="hero-cta" external={false}><b><Icon name="mail" size={24} /></b>Email Me</TA>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="banner-wrap">
        <div className="banner rv">
          {s.banner_script && (
            <>
              <div className="sig">{s.banner_script}</div>
              <svg className="line" viewBox="0 0 210 40" fill="none" aria-hidden="true"><path d="M3 36C60 14 130 6 205 6" stroke="#1f7aff" strokeWidth="3" strokeLinecap="round" /></svg>
            </>
          )}
          <img src={portraitUrl} alt="" aria-hidden="true" loading="lazy" />
        </div>
        {hasSocial && (
          <div className="socials rv" style={delay(1)}>
            {s.github && <TA href={s.github} event="github"><b><Icon name="github" size={19} />GitHub</b><span>Follow Me</span></TA>}
            {s.linkedin && <TA href={s.linkedin} event="linkedin"><b><Icon name="linkedin" size={19} />LinkedIn</b><span>Connect</span></TA>}
            {s.email && <TA href={`mailto:${s.email}`} event="email" label="banner" external={false}><b><Icon name="mailf" size={19} />Email</b><span>Say Hello</span></TA>}
          </div>
        )}
        </div>

        <div className="duo">
          <section id="about" className="rv">
            <h2 className="h2">{s.about_heading}</h2>
            {s.about_text && <p className="p">{s.about_text}</p>}
            <a className="btn" href="#experience">More about Me<Icon name="arrow" size={18} /></a>
          </section>

          {stack.length > 0 && (
            <section id="stack" className="rv" style={delay(1)}>
              <h2 className="h2">My Toolkit,</h2>
              <div className="h2s">Stack</div>
              <p className="p sm">The languages, frameworks and services I reach for most.</p>
              <div className="chips">{stack.map((t, i) => <span className="chip" key={t} style={{ ['--i' as string]: i }}><TechIcon name={t} />{t}</span>)}</div>
            </section>
          )}
        </div>

        <section id="work">
          <h2 className="h2 rv">All Projects,</h2>
          <div className="h2s rv">Selected Work</div>
          <p className="p sm rv">Apps and platforms I&apos;ve built and shipped. Tap a project for the full story, stack and links.</p>
          <ProjectTabs projects={projects.map((p) => ({
            id: p.id, slug: p.slug, title: p.title, category: p.category, platform: p.platform, summary: p.summary, image: p.image?.url ?? null,
          }))} />
        </section>

        {posts.length > 0 && (
          <section id="writing">
            <h2 className="h2 rv">Latest Writing,</h2>
            <div className="h2s rv">Blog</div>
            <div className="plist">
              {posts.slice(0, 3).map((p, i) => (
                <article className="pcard rv" key={p.id} style={delay(i)}>
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
            <Link className="more-link" href="/blog">All posts<Icon name="arrow" size={16} /></Link>
          </section>
        )}

        {experience.length > 0 && (
          <section id="experience" className="split">
            <div className="split-head rv">
              <h2 className="h2">Where I&apos;ve Worked,</h2>
              <div className="h2s">Experience</div>
              <p className="p sm">Roles and work that shaped how I build software.</p>
            </div>
            <div className="tl">
              {experience.map((e, i) => (
                <div className="tcard rv" key={e.id} style={delay(i % 3)}>
                  {e.period && <span className="tag">— {e.period}</span>}
                  <h3>{e.role}</h3>
                  {e.meta && <div className="meta">{e.meta}</div>}
                  {e.details && <p>{e.details}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="contact" className="cta rv">
          <h2>{s.cta_heading}<i /></h2>
          {s.email && <TA className="mail" href={`mailto:${s.email}`} event="email" label="footer" external={false}><Icon name="mail" size={20} />{s.email}</TA>}
        </section>
        <footer className="foot">
          <span>© {new Date().getFullYear()} {s.name}</span>
          {posts.length > 0 && <Link href="/blog">Blog</Link>}
          <a href="#home"><Icon name="up" size={14} />Back to top</a>
        </footer>
      </div>
    </main>
  );
}
