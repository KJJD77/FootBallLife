import type { Club, Look, Nation, TrophyKind } from './types';

let uidSeq = 0;
const uid = (p: string) => `${p}${++uidSeq}`;

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 170;
};

/** 球员头像：随年龄长胡子、白发、皱纹，随士气改变表情 */
export function avatarSVG(look: Look, age: number, colors: [string, string], num: number, mood = 60, size = 160): string {
  const id = uid('av');
  const skin = look.skin, skinD = shade(skin, -0.12);
  const grey = Math.max(0, Math.min(1, (age - 33) / 8));
  const hair = mix(look.hair, '#b9b9b9', grey);
  const style = age >= 37 && look.style !== 3 ? 5 : look.style;
  const [c1, c2] = colors;
  const hairBack = style === 3 ? `<path d="M52 90 Q48 150 62 172 L138 172 Q152 150 148 90 Q100 60 52 90Z" fill="${hair}"/>` : '';
  const hairTop = [
    `<path d="M56 88 Q58 40 100 38 Q142 40 144 88 Q138 62 100 58 Q62 62 56 88Z" fill="${hair}" opacity=".85"/>`,
    `<path d="M54 92 Q50 36 100 32 Q152 34 146 92 Q142 66 120 60 Q96 70 70 62 Q58 70 54 92Z" fill="${hair}"/>`,
    `<g fill="${hair}">${[[62, 62], [76, 46], [94, 38], [112, 40], [128, 48], [140, 64], [70, 54], [104, 34], [120, 36], [86, 42], [134, 56], [58, 76], [142, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15"/>`).join('')}</g>`,
    `<path d="M52 96 Q46 34 100 30 Q154 34 148 96 Q140 58 100 56 Q62 58 52 96Z" fill="${hair}"/>`,
    `<path d="M88 64 Q86 22 100 18 Q114 22 112 64 Q100 58 88 64Z" fill="${hair}"/><path d="M58 88 Q60 60 88 56 L88 64 Q66 68 58 88Z M142 88 Q140 60 112 56 L112 64 Q134 68 142 88Z" fill="${hair}" opacity=".35"/>`,
    ``,
  ][style];
  const beard = look.beard && age >= 20
    ? `<path d="M58 108 Q62 160 100 164 Q138 160 142 108 Q136 140 118 142 Q100 132 82 142 Q64 140 58 108Z" fill="${hair}" opacity="${Math.min(0.92, 0.5 + (age - 20) * 0.05)}"/>`
    : age >= 18 ? `<path d="M64 118 Q70 156 100 158 Q130 156 136 118 Q128 146 100 148 Q72 146 64 118Z" fill="${hair}" opacity=".18"/>` : '';
  const wrinkles = age >= 31 ? `<g stroke="${skinD}" stroke-width="1.6" fill="none" opacity="${Math.min(1, (age - 30) / 6)}"><path d="M78 70 Q100 64 122 70"/><path d="M82 77 Q100 72 118 77"/></g>` : '';
  const mouth = mood >= 60 ? `<path d="M84 132 Q100 146 116 132" stroke="#7a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : mood >= 35 ? `<path d="M86 136 L114 136" stroke="#7a3b2e" stroke-width="4" stroke-linecap="round"/>`
      : `<path d="M86 140 Q100 130 114 140" stroke="#7a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const numColor = isLight(c1) ? '#1a1a1a' : '#ffffff';
  return `<svg viewBox="0 0 200 220" width="${size}" height="${size * 1.1}" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="${id}bg" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${shade(c1, 0.15)}"/><stop offset="1" stop-color="${shade(c1, -0.35)}"/></radialGradient>
  <clipPath id="${id}c"><rect x="0" y="0" width="200" height="220" rx="24"/></clipPath></defs>
  <g clip-path="url(#${id}c)">
  <rect width="200" height="220" fill="url(#${id}bg)"/>
  <g opacity=".12" stroke="#fff" stroke-width="2">${[0, 1, 2, 3, 4, 5].map(i => `<line x1="${i * 40 - 40}" y1="0" x2="${i * 40 + 60}" y2="220"/>`).join('')}</g>
  ${hairBack}
  <path d="M14 222 Q22 172 100 160 Q178 172 186 222Z" fill="${c1}" stroke="${shade(c1, -0.2)}" stroke-width="2"/>
  <path d="M40 222 L52 180 M160 222 L148 180" stroke="${c2}" stroke-width="6" opacity=".8"/>
  <rect x="84" y="140" width="32" height="28" fill="${skinD}"/>
  <path d="M78 164 L100 186 L122 164" fill="none" stroke="${c2}" stroke-width="7"/>
  <text x="100" y="214" text-anchor="middle" font-size="26" font-weight="900" fill="${numColor}" font-family="Arial Black,Arial">${num}</text>
  <ellipse cx="55" cy="104" rx="9" ry="14" fill="${skinD}"/><ellipse cx="145" cy="104" rx="9" ry="14" fill="${skinD}"/>
  <ellipse cx="100" cy="98" rx="45" ry="56" fill="${skin}"/>
  ${wrinkles}
  <g fill="${hair}"><rect x="72" y="83" width="20" height="5" rx="2" transform="rotate(-6 82 85)"/><rect x="108" y="83" width="20" height="5" rx="2" transform="rotate(6 118 85)"/></g>
  <ellipse cx="82" cy="100" rx="9" ry="7" fill="#fff"/><ellipse cx="118" cy="100" rx="9" ry="7" fill="#fff"/>
  <circle cx="83" cy="101" r="4.5" fill="${look.eye}"/><circle cx="119" cy="101" r="4.5" fill="${look.eye}"/>
  <circle cx="84.5" cy="99.5" r="1.4" fill="#fff"/><circle cx="120.5" cy="99.5" r="1.4" fill="#fff"/>
  <path d="M100 104 L94 122 Q100 126 106 122" fill="none" stroke="${skinD}" stroke-width="3" stroke-linecap="round"/>
  ${beard}${mouth}${hairTop}
  </g></svg>`;
}

const SHIELD = 'M50 4 L94 16 L90 70 Q84 100 50 116 Q16 100 10 70 L6 16 Z';

function patternFor(p: number, c2: string): string {
  switch (p) {
    case 0: return [20, 40, 60, 80].map(x => `<rect x="${x - 5}" y="0" width="10" height="120" fill="${c2}"/>`).join('');
    case 1: return `<rect x="0" y="44" width="100" height="26" fill="${c2}"/>`;
    case 2: return `<path d="M0 20 L20 0 L100 90 L80 120Z" fill="${c2}"/>`;
    case 3: return `<rect x="50" y="0" width="50" height="60" fill="${c2}"/><rect x="0" y="60" width="50" height="60" fill="${c2}"/>`;
    default: return `<circle cx="50" cy="58" r="30" fill="${c2}"/>`;
  }
}

/** 俱乐部队徽 */
export function crestSVG(club: Club, size = 48): string {
  const id = uid('cr');
  const [c1, c2] = club.colors;
  const txt = isLight(c1) && isLight(c2) ? '#1a1a1a' : '#ffffff';
  const stars = club.rep >= 90 ? `<g fill="#ffd54a">${[-14, 0, 14].map(dx => `<path transform="translate(${50 + dx} 0)" d="M0 -6 L1.8 -1.8 L6 -1.8 L2.6 1 L3.8 5.4 L0 2.8 L-3.8 5.4 L-2.6 1 L-6 -1.8 L-1.8 -1.8Z" />`).join('')}</g>` : '';
  return `<svg viewBox="0 -10 100 130" width="${size}" height="${size * 1.3}" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="${id}"><path d="${SHIELD}"/></clipPath><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  ${stars}
  <path d="${SHIELD}" fill="${c1}"/>
  <g clip-path="url(#${id})">${patternFor(club.pattern, c2)}<rect x="0" y="0" width="100" height="120" fill="url(#${id}g)"/></g>
  <path d="${SHIELD}" fill="none" stroke="${shade(c2 === '#ffffff' ? c1 : c2, -0.25)}" stroke-width="4"/>
  <rect x="14" y="48" width="72" height="22" rx="4" fill="rgba(0,0,0,.45)"/>
  <text x="50" y="65" text-anchor="middle" font-size="17" font-weight="900" fill="${txt === '#1a1a1a' ? '#fff' : txt}" font-family="Arial Black,Arial">${club.short}</text>
  </svg>`;
}

/** 球衣 */
export function jerseySVG(colors: [string, string], pattern: number, num: number, name: string, size = 110): string {
  const id = uid('js');
  const [c1, c2] = colors;
  const shirt = 'M30 8 L46 2 Q60 12 74 2 L90 8 L116 30 L102 48 L92 40 L92 106 L28 106 L28 40 L18 48 L4 30 Z';
  const txt = isLight(c1) ? '#1a1a1a' : '#ffffff';
  return `<svg viewBox="0 0 120 110" width="${size}" height="${size * 0.92}" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="${id}"><path d="${shirt}"/></clipPath><linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>
  <path d="${shirt}" fill="${c1}"/>
  <g clip-path="url(#${id})">${pattern === 0 ? [34, 54, 74, 94].map(x => `<rect x="${x - 4}" y="0" width="8" height="110" fill="${c2}" opacity=".9"/>`).join('') : pattern === 1 ? `<rect x="0" y="46" width="120" height="14" fill="${c2}"/>` : pattern === 2 ? `<path d="M20 0 L40 0 L110 110 L90 110Z" fill="${c2}"/>` : ''}
  <rect width="120" height="110" fill="url(#${id}g)"/></g>
  <path d="M46 2 Q60 14 74 2" fill="none" stroke="${c2}" stroke-width="4"/>
  <path d="M4 30 L18 48 M116 30 L102 48" stroke="${c2}" stroke-width="4"/>
  <text x="60" y="36" text-anchor="middle" font-size="9" font-weight="700" fill="${txt}" font-family="Arial">${name}</text>
  <text x="60" y="84" text-anchor="middle" font-size="40" font-weight="900" fill="${txt}" stroke="${c2}" stroke-width="1.2" font-family="Arial Black,Arial">${num}</text>
  </svg>`;
}

/** 国旗（简化） */
export function flagSVG(n: Nation, w = 36): string {
  const h = w * 2 / 3;
  const inner: Record<string, string> = {
    CHN: `<rect width="30" height="20" fill="#de2910"/><path transform="translate(5 5) scale(.55)" d="M0 -5 L1.5 -1.5 L5 -1.5 L2.2 .8 L3.2 4.5 L0 2.3 L-3.2 4.5 L-2.2 .8 L-5 -1.5 L-1.5 -1.5Z" fill="#ffde00"/>${[[10, 2], [12, 4], [12, 7], [10, 9]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#ffde00"/>`).join('')}`,
    BRA: `<rect width="30" height="20" fill="#009b3a"/><path d="M15 2 L28 10 L15 18 L2 10Z" fill="#ffdf00"/><circle cx="15" cy="10" r="4.5" fill="#002776"/>`,
    ARG: `<rect width="30" height="20" fill="#75aadb"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><circle cx="15" cy="10" r="2" fill="#f6b40e"/>`,
    FRA: `<rect width="10" height="20" fill="#0055a4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ef4135"/>`,
    ENG: `<rect width="30" height="20" fill="#fff"/><rect x="13" width="4" height="20" fill="#cf081f"/><rect y="8" width="30" height="4" fill="#cf081f"/>`,
    ESP: `<rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/>`,
    GER: `<rect width="30" height="6.67" fill="#111"/><rect y="6.67" width="30" height="6.67" fill="#dd0000"/><rect y="13.33" width="30" height="6.67" fill="#ffce00"/>`,
    POR: `<rect width="12" height="20" fill="#006600"/><rect x="12" width="18" height="20" fill="#ff0000"/><circle cx="12" cy="10" r="3.5" fill="#ffcc00"/>`,
    NED: `<rect width="30" height="6.67" fill="#ae1c28"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><rect y="13.33" width="30" height="6.67" fill="#21468b"/>`,
    ITA: `<rect width="10" height="20" fill="#009246"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce2b37"/>`,
    JPN: `<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>`,
    KOR: `<rect width="30" height="20" fill="#fff"/><path d="M9 10 A6 6 0 0 1 21 10Z" fill="#c60c30"/><path d="M9 10 A6 6 0 0 0 21 10Z" fill="#003478"/>`,
  };
  return `<svg viewBox="0 0 30 20" width="${w}" height="${h}" style="border-radius:3px;box-shadow:0 1px 3px #0006" xmlns="http://www.w3.org/2000/svg">${inner[n.id] ?? ''}</svg>`;
}

/** 奖杯 */
export function trophySVG(kind: TrophyKind, size = 72): string {
  const id = uid('tr');
  const gold = `<linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#b8860b"/><stop offset=".45" stop-color="#ffe680"/><stop offset="1" stop-color="#a0700a"/></linearGradient>`;
  const silver = `<linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#8a96a3"/><stop offset=".45" stop-color="#ffffff"/><stop offset="1" stop-color="#7b8794"/></linearGradient>`;
  const base = (f: string) => `<rect x="28" y="84" width="44" height="10" rx="2" fill="#3b2a1a"/><rect x="34" y="76" width="32" height="9" fill="${f}"/>`;
  const G = `url(#${id}g)`, S = `url(#${id}s)`;
  const body: Record<TrophyKind, string> = {
    league: `${base(G)}<path d="M30 14 L70 14 Q70 52 50 60 Q30 52 30 14Z" fill="${G}"/><path d="M30 20 Q14 22 18 36 Q22 46 34 46 M70 20 Q86 22 82 36 Q78 46 66 46" stroke="${G}" stroke-width="5" fill="none"/><rect x="45" y="58" width="10" height="18" fill="${G}"/>`,
    cup: `${base(S)}<path d="M36 10 L64 10 L60 50 Q50 58 40 50Z" fill="${S}"/><path d="M36 16 Q24 20 30 34 L38 40 M64 16 Q76 20 70 34 L62 40" stroke="${S}" stroke-width="4" fill="none"/><rect x="46" y="54" width="8" height="22" fill="${S}"/>`,
    cont: `${base(S)}<path d="M34 12 L66 12 Q68 48 50 58 Q32 48 34 12Z" fill="${S}"/><path d="M34 16 Q8 12 12 36 Q16 54 38 48 M66 16 Q92 12 88 36 Q84 54 62 48" stroke="${S}" stroke-width="6" fill="none"/><rect x="45" y="56" width="10" height="20" fill="${S}"/>`,
    ballon: `${base(G)}<circle cx="50" cy="40" r="30" fill="${G}"/><path d="M50 28 L61 36 L57 49 L43 49 L39 36Z" fill="#8a6410" opacity=".6"/><path d="M50 10 L50 28 M20 36 L39 36 M80 36 L61 36 M34 66 L43 49 M66 66 L57 49" stroke="#8a6410" stroke-width="2" opacity=".6"/>`,
    boot: `${base(G)}<path d="M26 20 L50 20 L52 50 Q70 52 80 60 Q82 70 72 72 L28 72 Q22 60 26 20Z" fill="${G}"/><g stroke="#8a6410" stroke-width="2"><line x1="32" y1="32" x2="48" y2="32"/><line x1="32" y1="42" x2="48" y2="42"/></g><g fill="#8a6410">${[34, 46, 58, 70].map(x => `<rect x="${x}" y="72" width="4" height="4"/>`).join('')}</g>`,
    intl: `${base(G)}<path d="M40 76 Q30 60 38 44 Q26 36 34 22 Q42 10 50 12 Q58 10 66 22 Q74 36 62 44 Q70 60 60 76Z" fill="${G}"/><circle cx="50" cy="24" r="12" fill="${G}" stroke="#8a6410" stroke-width="1.5"/><path d="M40 20 Q50 30 60 20 M42 30 Q50 22 58 30" stroke="#8a6410" fill="none" stroke-width="1.2"/><rect x="36" y="68" width="28" height="4" fill="#1e7a3a"/>`,
    young: `<path d="M38 6 L50 34 L62 6" fill="#1565c0"/><path d="M42 6 L50 26 L58 6" fill="#ffffff" opacity=".7"/><circle cx="50" cy="56" r="26" fill="${G}" stroke="#8a6410" stroke-width="3"/><path transform="translate(50 56) scale(2.2)" d="M0 -6 L1.8 -1.8 L6 -1.8 L2.6 1 L3.8 5.4 L0 2.8 L-3.8 5.4 L-2.6 1 L-6 -1.8 L-1.8 -1.8Z" fill="#fff8d0"/>`,
    poty: `<rect x="22" y="10" width="56" height="76" rx="6" fill="#2d1b4e" stroke="${G}" stroke-width="4"/><path transform="translate(50 42) scale(3)" d="M0 -6 L1.8 -1.8 L6 -1.8 L2.6 1 L3.8 5.4 L0 2.8 L-3.8 5.4 L-2.6 1 L-6 -1.8 L-1.8 -1.8Z" fill="${G}"/><rect x="30" y="68" width="40" height="8" fill="${G}"/>`,
    tots: `<rect x="18" y="16" width="64" height="70" rx="8" fill="#0b3d2e" stroke="${S}" stroke-width="3"/><g fill="${G}">${[[50, 28], [34, 44], [50, 44], [66, 44], [30, 62], [44, 62], [56, 62], [70, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g><text x="50" y="82" font-size="9" text-anchor="middle" fill="#fff" font-family="Arial">XI</text>`,
  };
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs>${gold}${silver}</defs>${body[kind]}</svg>`;
}

/** 伪随机，保证同一插画每次渲染一致 */
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

/** 事件插画 */
export function sceneSVG(kind: string, accent = '#2e7d32'): string {
  const r = seeded(kind.length * 97 + kind.charCodeAt(0));
  const W = 320, H = 150;
  const bg = (a: string, b: string) => `<defs><linearGradient id="sg${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sg${kind})"/>`;
  const crowd = (y0: number, rows: number) => Array.from({ length: rows * 40 }, (_, i) => {
    const x = (i % 40) * 8 + 4 + (r() - 0.5) * 3, y = y0 + Math.floor(i / 40) * 9;
    return `<circle cx="${x}" cy="${y}" r="3.2" fill="${['#e53935', '#fdd835', '#fafafa', accent, '#1e88e5'][Math.floor(r() * 5)]}"/>`;
  }).join('');
  const scenes: Record<string, string> = {
    media: `${bg('#0d1b3e', '#1c3a6e')}${Array.from({ length: 9 }, () => `<path transform="translate(${r() * W} ${r() * 70}) scale(${0.6 + r()})" d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3Z" fill="#fff59d" opacity=".9"/>`).join('')}
      <rect x="110" y="96" width="100" height="54" fill="#263238"/><rect x="110" y="96" width="100" height="8" fill="${accent}"/>
      ${[130, 160, 190].map((x, i) => `<line x1="${x}" y1="96" x2="${160 + (i - 1) * 8}" y2="72" stroke="#90a4ae" stroke-width="3"/><rect x="${156 + (i - 1) * 8}" y="58" width="9" height="16" rx="4" fill="${['#e53935', '#1e88e5', '#fdd835'][i]}"/>`).join('')}`,
    coach: `${bg('#1b5e20', '#0f3d14')}<rect x="60" y="20" width="200" height="110" rx="6" fill="#2e7d32" stroke="#fff" stroke-width="3"/><line x1="160" y1="20" x2="160" y2="130" stroke="#fff" stroke-width="2"/><circle cx="160" cy="75" r="18" fill="none" stroke="#fff" stroke-width="2"/>
      ${[[100, 50], [110, 95], [190, 45], [205, 100]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="18" fill="#fff" font-family="Arial">O</text>`).join('')}${[[140, 60], [220, 70]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="18" fill="#ffeb3b" font-family="Arial">X</text>`).join('')}
      <path d="M112 90 Q150 70 186 52" stroke="#ffeb3b" stroke-width="3" fill="none" stroke-dasharray="6 4"/><path d="M180 48 L190 50 L184 58" fill="#ffeb3b"/>`,
    party: `${bg('#1a0033', '#4a148c')}<circle cx="270" cy="30" r="16" fill="#fff9c4"/>${Array.from({ length: 12 }, (_, i) => { const h = 40 + r() * 70; return `<rect x="${i * 27}" y="${H - h}" width="24" height="${h}" fill="#12002a"/>${Array.from({ length: 6 }, () => `<rect x="${i * 27 + 4 + Math.floor(r() * 3) * 6}" y="${H - h + 6 + r() * (h - 14)}" width="4" height="4" fill="#ffd54f" opacity="${r() > 0.4 ? 0.9 : 0.2}"/>`).join('')}`; }).join('')}
      ${Array.from({ length: 7 }, () => `<circle cx="${r() * W}" cy="${r() * 60}" r="${3 + r() * 8}" fill="${['#e040fb', '#00e5ff', '#ffea00'][Math.floor(r() * 3)]}" opacity=".6"/>`).join('')}`,
    charity: `${bg('#ffe0b2', '#ffab91')}<path transform="translate(160 78) scale(3.2)" d="M0 8 C-14 -2 -10 -14 0 -7 C10 -14 14 -2 0 8Z" fill="#e53935"/>
      ${[60, 100, 220, 260].map((x, i) => `<g transform="translate(${x} 100)"><circle r="10" cy="-18" fill="${['#8d5524', '#f1c27d', '#c68642', '#ffdbac'][i]}"/><rect x="-10" y="-6" width="20" height="30" rx="8" fill="${['#1e88e5', accent, '#fdd835', '#8e24aa'][i]}"/></g>`).join('')}`,
    fans: `${bg('#263238', '#37474f')}${crowd(14, 9)}<rect x="0" y="100" width="${W}" height="50" fill="#2e7d32"/><path d="M40 96 L280 96" stroke="${accent}" stroke-width="10"/><path d="M40 96 L280 96" stroke="#fff" stroke-width="10" stroke-dasharray="20 20"/>`,
    money: `${bg('#1b3a1b', '#0d260d')}${Array.from({ length: 4 }, (_, s) => Array.from({ length: 3 + s }, (_, i) => `<ellipse cx="${70 + s * 60}" cy="${126 - i * 9}" rx="22" ry="7" fill="#fbc02d" stroke="#8d6e00" stroke-width="2"/>`).join('')).join('')}
      <circle cx="250" cy="55" r="32" fill="#fdd835" stroke="#8d6e00" stroke-width="4"/><text x="250" y="68" text-anchor="middle" font-size="38" font-weight="900" fill="#8d6e00" font-family="Arial">€</text>`,
    injury: `${bg('#eceff1', '#b0bec5')}<rect x="130" y="30" width="60" height="90" rx="6" fill="#fff" stroke="#cfd8dc" stroke-width="3"/><rect x="152" y="45" width="16" height="60" fill="#e53935"/><rect x="130" y="67" width="60" height="16" fill="#e53935"/>
      <g transform="translate(60 110) rotate(-20)"><rect width="70" height="18" rx="9" fill="#f5deb3"/><rect x="20" width="24" height="18" fill="#fff" stroke="#ddd"/></g>`,
    train: `${bg('#43a047', '#2e7d32')}${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 40}" y="0" width="20" height="${H}" fill="#fff" opacity=".05"/>`).join('')}
      ${[60, 110, 160, 210, 260].map((x, i) => `<path d="M${x} ${110 - (i % 2) * 20} l8 18 l-16 0Z" fill="#ff6d00"/>`).join('')}<circle cx="120" cy="120" r="10" fill="#fff" stroke="#222" stroke-width="2"/><path d="M40 60 Q160 20 280 60" stroke="#fff" stroke-dasharray="6 6" fill="none"/>`,
    love: `${bg('#fce4ec', '#f8bbd0')}${Array.from({ length: 10 }, () => `<path transform="translate(${r() * W} ${r() * H}) scale(${0.5 + r() * 1.5})" d="M0 8 C-14 -2 -10 -14 0 -7 C10 -14 14 -2 0 8Z" fill="#ec407a" opacity="${0.3 + r() * 0.6}"/>`).join('')}`,
    social: `${bg('#e3f2fd', '#90caf9')}<rect x="120" y="14" width="80" height="130" rx="12" fill="#212121"/><rect x="126" y="24" width="68" height="108" rx="4" fill="#fafafa"/>
      ${[0, 1, 2, 3].map(i => `<rect x="${i % 2 ? 150 : 132}" y="${32 + i * 24}" width="40" height="16" rx="8" fill="${i % 2 ? '#1e88e5' : '#e0e0e0'}"/>`).join('')}
      <text x="60" y="80" font-size="40" font-family="Arial">👍</text><text x="230" y="70" font-size="34" font-family="Arial">🔥</text>`,
    family: `${bg('#0d2440', '#1b3a66')}<path d="M110 80 L160 40 L210 80Z" fill="#8d4f2a"/><rect x="120" y="80" width="80" height="60" fill="#d7ccc8"/><rect x="135" y="95" width="20" height="18" fill="#ffd54f"/><rect x="168" y="100" width="18" height="40" fill="#5d4037"/>
      ${Array.from({ length: 20 }, () => `<circle cx="${r() * W}" cy="${r() * 60}" r="1.2" fill="#fff"/>`).join('')}`,
    national: `${bg('#b71c1c', '#4a0000')}${crowd(10, 6)}<rect x="0" y="70" width="${W}" height="80" fill="#1b5e20"/><path d="M100 140 L100 60" stroke="#ddd" stroke-width="4"/><path d="M100 60 Q140 50 170 64 Q200 78 230 66 L230 106 Q200 118 170 104 Q140 92 100 102Z" fill="${accent}"/>`,
    rival: `${bg('#311b92', '#000')}<path d="M160 10 L172 60 L150 64 L168 140 L140 76 L160 72 L146 10Z" fill="#ffea00"/>
      <circle cx="80" cy="80" r="34" fill="#e53935"/><circle cx="240" cy="80" r="34" fill="#1e88e5"/><text x="80" y="92" text-anchor="middle" font-size="32" fill="#fff" font-family="Arial Black">VS</text>`,
  };
  return `<svg viewBox="0 0 ${W} ${H}" class="scene" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${scenes[kind] ?? scenes.fans}</svg>`;
}

/** 训练/生活方式图标 */
export const ICONS: Record<string, string> = {
  pace: '⚡', shooting: '🎯', passing: '🎯', dribbling: '🌀', defending: '🛡️', physical: '💪',
  balanced: '⚖️', intense: '🔥', rest: '🛌', focus: '⚽', social: '📱', relax: '🎮', party: '🍾', charity: '❤️',
};
ICONS.passing = '🧭';
