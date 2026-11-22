'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from './Icon';
import { trackEvent } from '@/lib/track-client';

export default function Header({ shortName, initials, whatsapp, hasBlog }: {
  shortName: string; initials: string; whatsapp: string; hasBlog: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => { setDark(document.documentElement.dataset.theme === 'dark'); }, []);
  useEffect(() => {
    document.body.classList.toggle('open', open);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  const toggleTheme = () => {
    const t = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* private mode */ }
    setDark(!dark);
  };
  const close = () => setOpen(false);

  return (
    <>
      <header className="header" id="home">
        <div className="wrap">
          <Link className="brand" href="/"><span className="logo">{initials}</span>{shortName}</Link>
          <nav className="dnav">
            <Link href="/#about">About</Link><Link href="/#stack">Stack</Link><Link href="/#work">Work</Link>
            <Link href="/#experience">Experience</Link>{hasBlog && <Link href="/blog">Blog</Link>}<Link href="/#contact">Contact</Link>
          </nav>
          <div className="hbtns">
            <button className="ibtn" type="button" onClick={toggleTheme} aria-label="Toggle dark mode"><Icon name={dark ? 'sun' : 'moon'} /></button>
            <button className="ibtn menubtn" type="button" onClick={() => setOpen(!open)} aria-label="Open menu"><Icon name="grid" size={22} /></button>
          </div>
        </div>
      </header>

      <div className="scrim" onClick={close} />
      <div className="menu" id="menu">
        <div className="mgrid">
          <Link href="/#home" onClick={close}><Icon name="home" />Home</Link>
          <Link href="/#about" onClick={close}><Icon name="user" />About</Link>
          <Link href="/#stack" onClick={close}><Icon name="layers" />Stack</Link>
          <Link href="/#work" onClick={close}><Icon name="briefcase" />Work</Link>
          <Link href="/#experience" onClick={close}><Icon name="clock" />Experience</Link>
          <Link href="/#contact" onClick={close}><Icon name="mail" />Contact</Link>
        </div>
        {whatsapp && (
          <a className="mwa" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp', 'menu')}>
            <Icon name="whatsapp" size={22} />WhatsApp Me
          </a>
        )}
      </div>
    </>
  );
}
