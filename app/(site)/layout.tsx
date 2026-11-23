import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './site.css';
import Header from '@/components/Header';
import Reveal from '@/components/Reveal';
import Track from '@/components/Track';
import { getPosts, getSite } from '@/lib/data';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { s } = await getSite();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: { default: s.site_title, template: `%s | ${s.name}` },
    description: s.site_description,
    openGraph: { title: s.site_title, description: s.site_description, type: 'website' },
  };
}

const THEME_SCRIPT = `document.documentElement.classList.add('js');try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}`;

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [{ s }, posts] = await Promise.all([getSite(), getPosts()]);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header shortName={s.short_name} initials={s.initials} whatsapp={s.whatsapp} hasBlog={posts.length > 0} />
        {children}
        <Track />
        <Reveal />
      </body>
    </html>
  );
}
