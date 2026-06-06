// 개인정보처리방침·이용약관 정적 HTML 생성 (스토어 제출용 공개 URL).
// 단일 소스: src/lib/legal-content.json (ko/en) → docs/legal/*.html
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/lib/legal-content.json', import.meta.url)));
const OUT = new URL('../docs/legal/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const page = (doc, lang) => `<!doctype html>
<html lang="${lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>LugAI · ${esc(doc.title)}</title>
<style>
:root{color-scheme:light}*{box-sizing:border-box}
body{margin:0;background:#EFF1F4;color:#12151A;font:16px/1.65 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",Pretendard,"Segoe UI",Roboto,sans-serif}
.wrap{max-width:720px;margin:0 auto;padding:40px 20px 80px}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:28px;font-weight:800;font-size:18px}
.dot{width:28px;height:28px;border-radius:9px;background:linear-gradient(180deg,#3B78FF,#1F54E6)}
h1{font-size:28px;letter-spacing:-.6px;margin:0 0 4px}
.upd{color:#868D99;font-size:13px;margin-bottom:24px}
.intro{color:#5C6470;margin-bottom:28px}
.card{background:#fff;border-radius:20px;padding:22px 24px;margin-bottom:14px}
h2{font-size:17px;margin:0 0 8px;letter-spacing:-.2px}
p{white-space:pre-wrap;color:#3A414B;margin:0}
a{color:#2D6BFF;text-decoration:none}
footer{margin-top:32px;color:#868D99;font-size:13px;text-align:center}
</style></head><body><div class="wrap">
<div class="brand"><span class="dot"></span>LugAI</div>
<h1>${esc(doc.title)}</h1>
<div class="upd">${lang === 'en' ? 'Last updated' : '최종 업데이트'} · ${esc(doc.updated)}</div>
<p class="intro">${esc(doc.intro)}</p>
${doc.sections.map((s) => `<div class="card"><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></div>`).join('\n')}
<footer>© 2026 LugAI</footer>
</div></body></html>`;

const index = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LugAI · Legal</title>
<style>body{font:16px/1.6 -apple-system,sans-serif;max-width:600px;margin:60px auto;padding:0 20px;color:#12151A}a{color:#2D6BFF;display:block;padding:10px 0}h2{margin-top:28px;font-size:15px;color:#868D99}</style></head>
<body><h1>LugAI</h1>
<h2>한국어</h2><a href="./privacy.html">개인정보처리방침</a><a href="./terms.html">이용약관</a>
<h2>English</h2><a href="./privacy.en.html">Privacy Policy</a><a href="./terms.en.html">Terms of Service</a>
</body></html>`;

writeFileSync(OUT + 'privacy.html', page(data.ko.privacy, 'ko'));
writeFileSync(OUT + 'terms.html', page(data.ko.terms, 'ko'));
writeFileSync(OUT + 'privacy.en.html', page(data.en.privacy, 'en'));
writeFileSync(OUT + 'terms.en.html', page(data.en.terms, 'en'));
writeFileSync(OUT + 'index.html', index);
console.log('✅ legal html (ko/en) generated in', OUT);
