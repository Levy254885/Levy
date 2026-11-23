'use client';
import type { IconType } from 'react-icons';
import { LuArrowLeft, LuArrowRight, LuArrowUpRight, LuBriefcase, LuClock, LuHouse, LuLayers, LuMail, LuMoon, LuSun, LuUser, LuLayoutGrid, LuX, LuArrowUp } from 'react-icons/lu';
import { FaGithub, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6';

const MAP = {
  home: LuHouse, user: LuUser, layers: LuLayers, briefcase: LuBriefcase, clock: LuClock, mail: LuMail, mailf: LuMail,
  arrow: LuArrowRight, moon: LuMoon, sun: LuSun, back: LuArrowLeft, external: LuArrowUpRight, grid: LuLayoutGrid, close: LuX, up: LuArrowUp,
  whatsapp: FaWhatsapp, github: FaGithub, linkedin: FaLinkedinIn,
} satisfies Record<string, IconType>;

export type IconName = keyof typeof MAP;

export default function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const C = MAP[name];
  return <C size={size} aria-hidden="true" />;
}
