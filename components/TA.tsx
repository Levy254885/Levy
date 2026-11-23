'use client';
import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/track-client';

/** Anchor that records an anonymous click event (WhatsApp, résumé, GitHub, ...). */
export default function TA({ href, event, label = '', className, external = true, children }: {
  href: string; event: string; label?: string; className?: string; external?: boolean; children: ReactNode;
}) {
  return (
    <a href={href} className={className} onClick={() => trackEvent(event, label)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}
