// LugAI 앱 아이콘/스플래시 생성 — SVG → PNG (sharp)
// 마크: 브랜드 블루 배경 + 흰 캐리어 + 그린 체크 배지("짐 통과")
import { mkdirSync } from 'node:fs';

import sharp from 'sharp';

const OUT = new URL('../assets/images/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const MARK = (s = 1) => `
  <g transform="translate(${512 * (1 - s)} ${512 * (1 - s)}) scale(${s})">
    <path d="M416 392 v-40 a96 96 0 0 1 192 0 v40" fill="none" stroke="#ffffff" stroke-width="44" stroke-linecap="round"/>
    <rect x="304" y="380" width="416" height="372" rx="60" fill="#ffffff"/>
    <circle cx="668" cy="680" r="112" fill="#16B364"/>
    <circle cx="668" cy="680" r="112" fill="none" stroke="#ffffff" stroke-width="18"/>
    <path d="M620 684 l34 34 l74 -80" fill="none" stroke="#ffffff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;

const iconFull = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3B78FF"/><stop offset="1" stop-color="#1F54E6"/>
  </linearGradient></defs>
  <rect width="1024" height="1024" fill="url(#g)"/>${MARK(1)}</svg>`;

const markTransparent = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${MARK(1)}</svg>`;
const markSafe = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${MARK(0.64)}</svg>`;

const png = (svg) => sharp(Buffer.from(svg)).png();

await png(iconFull).toFile(OUT + 'icon.png');
await png(markSafe).toFile(OUT + 'android-icon-foreground.png');
await png(markTransparent).resize(512, 512).toFile(OUT + 'splash-icon.png');
await png(iconFull).resize(196, 196).toFile(OUT + 'favicon.png');

console.log('✅ icons generated in', OUT);
