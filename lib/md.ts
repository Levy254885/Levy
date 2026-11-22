import { safeUrl } from './shared';

// Small, safe Markdown -> HTML. Everything is escaped first, so the output is safe
// to inject with dangerouslySetInnerHTML.
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const unesc = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function inline(raw: string): string {
  let s = esc(raw);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, '<em>$1</em>');
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt: string, url: string) => {
    const u = unesc(url);
    return safeUrl(u) ? `<img src="${esc(u)}" alt="${alt}" loading="lazy">` : m;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
    const u = unesc(url);
    if (safeUrl(u, true)) return `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    if ((u.startsWith('/') && !u.startsWith('//')) || u.startsWith('#')) return `<a href="${esc(u)}">${label}</a>`;
    return m;
  });
  return s;
}

export function md(text: string): string {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (ln.trim().startsWith('```')) {
      flush(); i++;
      const code: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
    } else if (/^#{1,3}\s/.test(ln)) {
      flush();
      const n = ln.length - ln.replace(/^#+/, '').length;
      const lvl = Math.max(2, n);
      out.push(`<h${lvl}>${inline(ln.slice(n).trim())}</h${lvl}>`);
    } else if (/^\s*[-*]\s+/.test(ln) || /^\s*\d+\.\s+/.test(ln)) {
      flush();
      const ordered = /^\s*\d+\.\s+/.test(ln);
      const pat = ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/;
      const items: string[] = [];
      while (i < lines.length && pat.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(pat, ''))}</li>`);
      i--;
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.join('')}</${tag}>`);
    } else if (ln.startsWith('>')) {
      flush();
      const q: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) q.push(lines[i++].replace(/^>\s*/, ''));
      i--;
      out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`);
    } else if (/^-{3,}\s*$/.test(ln)) {
      flush(); out.push('<hr>');
    } else if (!ln.trim()) {
      flush();
    } else {
      para.push(ln.trim());
    }
    i++;
  }
  flush();
  return out.join('\n');
}
