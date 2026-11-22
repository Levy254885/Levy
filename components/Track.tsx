'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackView } from '@/lib/track-client';

/** Counts a page view per navigation. Works with cached/static pages because it runs in the browser. */
export default function Track() {
  const path = usePathname();
  useEffect(() => { trackView(path); }, [path]);
  return null;
}
