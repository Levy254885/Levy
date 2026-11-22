'use client';

function send(url: string, payload: unknown) {
  try {
    if (localStorage.getItem('noTrack') === '1') return; // set when you are signed in to /admin
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    else fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
  } catch { /* analytics must never break the page */ }
}

export const trackEvent = (name: string, label = '') => send('/api/event', { name, label });
export const trackView = (path: string) => send('/api/track', { path, referrer: document.referrer });
