'use client';
import type { IconType } from 'react-icons';
import {
  SiAndroid, SiAndroidstudio, SiAngular, SiBootstrap, SiCloudinary, SiCss, SiDart, SiDjango, SiDocker, SiExpo, SiExpress, SiFigma, SiFirebase,
  SiFlask, SiFlutter, SiGit, SiGithub, SiGraphql, SiHtml5, SiJavascript, SiLaravel, SiMongodb, SiMysql, SiNextdotjs, SiNodedotjs, SiPhp,
  SiPostgresql, SiPython, SiReact, SiRedis, SiSass, SiSqlite, SiSupabase, SiTailwindcss, SiTypescript, SiVercel, SiVuedotjs, SiWordpress,
  SiKotlin, SiSwift, SiPrisma, SiStripe, SiNginx, SiLinux, SiPostman, SiJest, SiVite, SiRedux, SiSocketdotio, SiOpenjdk, SiGo, SiRust,
} from 'react-icons/si';
import { LuCode } from 'react-icons/lu';

const T: Record<string, IconType> = {
  android: SiAndroid, 'android studio': SiAndroidstudio, angular: SiAngular, bootstrap: SiBootstrap, cloudinary: SiCloudinary, css: SiCss, css3: SiCss,
  dart: SiDart, django: SiDjango, docker: SiDocker, expo: SiExpo, express: SiExpress, figma: SiFigma, firebase: SiFirebase, firestore: SiFirebase,
  flask: SiFlask, flutter: SiFlutter, git: SiGit, github: SiGithub, graphql: SiGraphql, html: SiHtml5, html5: SiHtml5, javascript: SiJavascript, js: SiJavascript,
  laravel: SiLaravel, mongodb: SiMongodb, mysql: SiMysql, 'next.js': SiNextdotjs, nextjs: SiNextdotjs, node: SiNodedotjs, 'node.js': SiNodedotjs, nodejs: SiNodedotjs,
  php: SiPhp, postgresql: SiPostgresql, postgres: SiPostgresql, python: SiPython, react: SiReact, 'react native': SiReact, 'react.js': SiReact, redis: SiRedis,
  sass: SiSass, sqlite: SiSqlite, supabase: SiSupabase, tailwind: SiTailwindcss, 'tailwind css': SiTailwindcss, tailwindcss: SiTailwindcss,
  typescript: SiTypescript, ts: SiTypescript, vercel: SiVercel, vue: SiVuedotjs, 'vue.js': SiVuedotjs, wordpress: SiWordpress, kotlin: SiKotlin, swift: SiSwift,
  prisma: SiPrisma, stripe: SiStripe, nginx: SiNginx, linux: SiLinux, postman: SiPostman, jest: SiJest, vite: SiVite, redux: SiRedux, 'socket.io': SiSocketdotio,
  java: SiOpenjdk, go: SiGo, golang: SiGo, rust: SiRust,
};

export default function TechIcon({ name, size = 18 }: { name: string; size?: number }) {
  const C = T[name.trim().toLowerCase()] ?? LuCode;
  return <C size={size} aria-hidden="true" />;
}
