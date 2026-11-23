export type Img = { url: string; publicId: string };
export type Link = { label: string; url: string };

export type Project = {
  id: string; slug: string; title: string; category: string; platform: 'web' | 'mobile';
  summary: string; body: string; tech: string[]; links: Link[]; image: Img | null;
  published: boolean; order: number; createdAt: string; updatedAt: string;
};
export type Post = {
  id: string; slug: string; title: string; excerpt: string; body: string; tags: string[];
  cover: Img | null; published: boolean; publishedAt: string | null; createdAt: string; updatedAt: string;
};
export type Experience = { id: string; period: string; role: string; meta: string; details: string; order: number };
export type Site = { s: Record<string, string>; portrait: Img | null };

export type Analytics = {
  series: { day: string; views: number; visitors: number }[];
  views: number; visitors: number; today: number; change: number | null;
  topPages: { path: string; title: string; views: number }[];
  referrers: { name: string; views: number }[];
  devices: { name: string; views: number }[];
  countries: { name: string; views: number }[];
  events: { name: string; label: string; count: number }[];
};
