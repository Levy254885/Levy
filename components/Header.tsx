'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon, { type IconName } from './Icon';
import { trackEvent } from '@/lib/track-client';

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: '/#home', label: 'Home', icon: 'home' },
  { href: '/#about', label: 'About', icon: 'user' },
  { href: '/#stack', label: 'Stack', icon: 'layers' },
  { href: '/#work', label: 'Work', icon: 'briefcase' },
  { href: '/#experience', label: 'Experience', icon: 'clock' },
  { href: '/#contact', label: 'Contact', icon: 'mail' },
];

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
      <header className="header">
        <div className="wrap">
          <Link className="brand" href="/"><span className="logo">{initials}</span><span className="bname">{shortName}</span></Link>
          <nav className="dnav" aria-label="Primary">
            {ITEMS.slice(1, 5).map((i) => <Link key={i.href} href={i.href}>{i.label}</Link>)}
            {hasBlog && <Link href="/blog">Blog</Link>}
            <Link href="/#contact">Contact</Link>
          </nav>
          <div className="hbtns">
            <button className="ibtn themebtn" type="button" onClick={toggleTheme} aria-label="Toggle dark mode">
              <span className={`swap${dark ? ' flip' : ''}`}><Icon name="moon" size={22} /><Icon name="sun" size={22} /></span>
            </button>
            {whatsapp && (
              <a className="dwa" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp', 'header')}>
                <Icon name="whatsapp" size={18} />WhatsApp
              </a>
            )}
            <button className="ibtn menubtn" type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
              <span className={`swap${open ? ' flip' : ''}`}><Icon name="grid" size={22} /><Icon name="close" size={22} /></span>
            </button>
          </div>
        </div>
      </header>

      <div className="scrim" onClick={close} />
      <div className="menu" id="menu">
        <div className="mgrid">
          {ITEMS.map((i, n) => (
            <Link key={i.href} href={i.href} onClick={close} style={{ ['--i' as string]: n }}><Icon name={i.icon} size={26} />{i.label}</Link>
          ))}
        </div>
        {whatsapp && (
          <a className="mwa" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" onClick={() => { trackEvent('whatsapp', 'menu'); close(); }}>
            <Icon name="whatsapp" size={22} />WhatsApp Me
          </a>
        )}
      </div>
    </>
  );
}
