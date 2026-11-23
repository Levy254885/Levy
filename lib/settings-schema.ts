export type FieldKind = 'text' | 'email' | 'url' | 'area' | 'check';
export type FieldDef = { key: string; label: string; kind: FieldKind; help?: string };

export const DEFAULTS: Record<string, string> = {
  name: 'Levy Makomere', short_name: 'Makomere', initials: 'LM', title: 'Software Developer',
  lead: 'I build full-stack web products, mobile apps, SaaS platforms and the business software that keeps organizations running.',
  status_show: '1', status_text: 'Open to work',
  email: '', whatsapp: '', github: '', linkedin: '', resume_url: '',
  banner_script: "I'm Levy Makomere",
  about_heading: 'Full-stack & Mobile',
  about_text: 'Full-stack web development, mobile application development, SaaS products, and business software and digital systems.',
  cta_heading: "Let's build something",
  stat1_value: '', stat1_label: '', stat2_value: '', stat2_label: '', stat3_value: '', stat3_label: '',
  site_title: 'Levy Makomere | Software Developer',
  site_description: 'Levy Makomere is a software developer building full-stack web apps, mobile apps, SaaS products and business software.',
};

export const SETTING_GROUPS: { title: string; fields: FieldDef[] }[] = [
  { title: 'Profile', fields: [
    { key: 'name', label: 'Full name', kind: 'text' },
    { key: 'short_name', label: 'Name shown in header', kind: 'text' },
    { key: 'initials', label: 'Initials (logo)', kind: 'text', help: 'Two letters' },
    { key: 'title', label: 'Professional title', kind: 'text' },
    { key: 'lead', label: 'Intro sentence under the title', kind: 'area' },
    { key: 'status_show', label: 'Show availability badge', kind: 'check' },
    { key: 'status_text', label: 'Badge text', kind: 'text' },
  ] },
  { title: 'Contact and links', fields: [
    { key: 'email', label: 'Email', kind: 'email' },
    { key: 'whatsapp', label: 'WhatsApp number', kind: 'text', help: 'Digits with country code, e.g. 2547XXXXXXXX' },
    { key: 'github', label: 'GitHub URL', kind: 'url' },
    { key: 'linkedin', label: 'LinkedIn URL', kind: 'url' },
    { key: 'resume_url', label: 'Resume / CV link', kind: 'url', help: 'Google Drive or any https link' },
  ] },
  { title: 'Home page text', fields: [
    { key: 'banner_script', label: 'Handwritten banner text', kind: 'text' },
    { key: 'about_heading', label: 'About heading', kind: 'text' },
    { key: 'about_text', label: 'About paragraph', kind: 'area' },
    { key: 'cta_heading', label: 'Contact heading', kind: 'text' },
  ] },
  { title: 'Hero stats (optional)', fields: [
    { key: 'stat1_value', label: 'Stat 1 value', kind: 'text', help: 'Leave stats empty to show your project count' },
    { key: 'stat1_label', label: 'Stat 1 label', kind: 'text' },
    { key: 'stat2_value', label: 'Stat 2 value', kind: 'text' },
    { key: 'stat2_label', label: 'Stat 2 label', kind: 'text' },
    { key: 'stat3_value', label: 'Stat 3 value', kind: 'text' },
    { key: 'stat3_label', label: 'Stat 3 label', kind: 'text' },
  ] },
  { title: 'Search engines', fields: [
    { key: 'site_title', label: 'Page title', kind: 'text' },
    { key: 'site_description', label: 'Description', kind: 'area' },
  ] },
];
