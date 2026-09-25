import './style.css';
import { Chart, registerables } from 'chart.js';
import { avatarSVG, crestSVG, flagSVG, ICONS, jerseySVG, sceneSVG, trophySVG } from './art';
import { CLUBS, EYES, GIVEN, HAIR_STYLES, HAIRS, LEAGUES, NATIONS, SKINS, SURNAMES } from './data';
import {
  acceptOffer, benchResult, askPlaytime, askRaise, ATTR_KEYS, focusIndex, isDerby, lifeAction, migrate, planLive, requestListing, resolveLive, ATTR_NAMES, avgRating, clubById, COMP_NAME, fmtMoney, leagueById, legendScore, legendTitle,
  marketValue, MONTHS, mustRetire, nationById, newGame, ovr, pick, POS_INFO, qualifiesCont, retire, seasonLabel,
  seasonOf, SHOP, simulateMonth, sortedTable,
  type AwardInfo, type MonthReport, type SeasonSummary,
} from './engine';
import { eventById, pickEvent } from './events';
import { runLiveMatch } from './live';
import { fanComments, headline } from './news';
import { sfx, soundOn, toggleSound } from './audio';
import { playHighlight } from './match3d';
import type { Game, LifePlan, LivePlan, Look, MatchResult, Offer, Pos, TrainPlan, TrophyKind } from './types';

Chart.register(...registerables);
Chart.defaults.color = '#9fb3c8';
Chart.defaults.borderColor = 'rgba(255,255,255,.08)';

const SAVE_KEY = 'football-life-save-v1';
const app = document.getElementById('app')!;
const modal = document.getElementById('modal')!;

let g: Game | null = load();
let tab: 'month' | 'career' | 'league' | 'honors' | 'life' | 'log' = 'month';
let charts: Chart[] = [];
let highlight: { replay: () => void; dispose: () => void } | null = null;
let steps: (() => void)[] = [];

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function load(): Game | null {
  try { const s = localStorage.getItem(SAVE_KEY); return s ? migrate(JSON.parse(s) as Game) : null; } catch { return null; }
}
function save() { if (g) localStorage.setItem(SAVE_KEY, JSON.stringify(g)); }

// ================= 建号 =================
const randomName = () => pick(SURNAMES) + pick(GIVEN) + (Math.random() < 0.5 ? pick(GIVEN) : '');
function clubChoices(): string[] {
  const pool = CLUBS.filter(c => c.league !== 'ASI');
  const tier = (a: number, b: number) => pool.filter(c => c.rep >= a && c.rep < b).sort(() => Math.random() - 0.5);
  return [...tier(88, 101).slice(0, 2), ...tier(68, 88).slice(0, 2), ...tier(0, 68).slice(0, 2)].map(c => c.id);
}
const create = {
  name: randomName(), nation: 'CHN', pos: 'ST' as Pos, foot: '右脚' as '左脚' | '右脚',
  look: { skin: SKINS[1], hair: HAIRS[0], style: 1, beard: false, eye: EYES[0] } as Look,
  clubs: clubChoices(), clubId: '',
};
create.clubId = create.clubs[0];

function renderCreate() {
  const c = create;
  const club = clubById(c.clubId);
  app.innerHTML = `
  <div class="create">
    <div class="create-hero">
      <h1>⚽ 足球人生模拟器</h1>
      <p>从 16 岁的青训小将开始，一个月一个月地书写你的传奇。</p>
    </div>
    <div class="create-grid">
      <div class="card preview">
        <div class="avatar-big">${avatarSVG(c.look, 16, club.colors, POS_INFO[c.pos].num, 70, 200)}</div>
        <div class="preview-name">${esc(c.name) || '无名小将'}</div>
        <div class="muted">${flagSVG(nationById(c.nation), 22)} ${nationById(c.nation).name} · ${POS_INFO[c.pos].name} · ${c.foot}</div>
        <div class="jersey-preview">${jerseySVG(club.colors, club.pattern, POS_INFO[c.pos].num, esc(c.name).slice(0, 6), 120)}</div>
      </div>
      <div class="card form">
        <label>球员姓名</label>
        <div class="row"><input id="name" maxlength="12" value="${esc(c.name)}"/><button data-act="rname" class="btn ghost">🎲 随机</button></div>
        <label>国籍</label>
        <div class="chips">${NATIONS.map(n => `<button class="chip ${n.id === c.nation ? 'on' : ''}" data-act="nation" data-v="${n.id}">${flagSVG(n, 20)} ${n.name}</button>`).join('')}</div>
        <label>位置</label>
        <div class="pos-grid">${(Object.keys(POS_INFO) as Pos[]).map(p => `<button class="pos ${p === c.pos ? 'on' : ''}" data-act="pos" data-v="${p}"><b>${POS_INFO[p].name}</b><small>${POS_INFO[p].desc}</small></button>`).join('')}</div>
        <label>惯用脚</label>
        <div class="chips">${['右脚', '左脚'].map(f => `<button class="chip ${f === c.foot ? 'on' : ''}" data-act="foot" data-v="${f}">🦶 ${f}</button>`).join('')}</div>
        <label>外貌</label>
        <div class="look-row"><span>肤色</span>${SKINS.map(s => `<button class="swatch ${s === c.look.skin ? 'on' : ''}" style="background:${s}" data-act="skin" data-v="${s}"></button>`).join('')}</div>
        <div class="look-row"><span>发色</span>${HAIRS.map(s => `<button class="swatch ${s === c.look.hair ? 'on' : ''}" style="background:${s}" data-act="hair" data-v="${s}"></button>`).join('')}</div>
        <div class="look-row"><span>瞳色</span>${EYES.map(s => `<button class="swatch ${s === c.look.eye ? 'on' : ''}" style="background:${s}" data-act="eye" data-v="${s}"></button>`).join('')}</div>
        <div class="look-row"><span>发型</span>${HAIR_STYLES.map((s, i) => `<button class="chip sm ${i === c.look.style ? 'on' : ''}" data-act="style" data-v="${i}">${s}</button>`).join('')}
          <button class="chip sm ${c.look.beard ? 'on' : ''}" data-act="beard">🧔 成年后留胡子</button></div>
        <label>选择青训营 <button class="btn ghost sm" data-act="reroll">🔄 换一批</button></label>
        <div class="club-grid">${c.clubs.map(id => { const cl = clubById(id); return `
          <button class="club-card ${id === c.clubId ? 'on' : ''}" data-act="club" data-v="${id}">
            ${crestSVG(cl, 40)}<div><b>${cl.name}</b><small>${leagueById(cl.league).short} · 声望 ${'★'.repeat(Math.round(cl.rep / 20))}</small>
            <small class="muted">${cl.rep >= 88 ? '豪门青训：资源顶级，但进一线队很难' : cl.rep >= 68 ? '中游球队：成长与机会兼顾' : '小球队：更容易获得出场机会'}</small></div>
          </button>`; }).join('')}</div>
        <button class="btn primary big" data-act="start">开始职业生涯 →</button>
      </div>
    </div>
  </div>`;
  (document.getElementById('name') as HTMLInputElement).addEventListener('input', e => {
    c.name = (e.target as HTMLInputElement).value.trim();
    app.querySelector('.preview-name')!.textContent = c.name || '无名小将';
  });
}

function onCreateAction(act: string, v: string) {
  const c = create;
  switch (act) {
    case 'rname': c.name = randomName(); break;
    case 'nation': c.nation = v; break;
    case 'pos': c.pos = v as Pos; break;
    case 'foot': c.foot = v as '左脚' | '右脚'; break;
    case 'skin': c.look.skin = v; break;
    case 'hair': c.look.hair = v; break;
    case 'eye': c.look.eye = v; break;
    case 'style': c.look.style = +v; break;
    case 'beard': c.look.beard = !c.look.beard; break;
    case 'reroll': c.clubs = clubChoices(); c.clubId = c.clubs[0]; break;
    case 'club': c.clubId = v; break;
    case 'start':
      g = newGame({ name: c.name || '无名小将', nation: c.nation, pos: c.pos, foot: c.foot, look: { ...c.look }, clubId: c.clubId });
      tab = 'month'; save();
      break;
  }
  render();
}

// ================= 主界面 =================
const bar = (label: string, v: number, cls = '', extra = '') =>
  `<div class="bar ${cls}"><span>${label}</span><div class="track"><div class="fill" style="width:${Math.max(0, Math.min(100, v))}%"></div></div><b>${Math.round(v)}</b>${extra}</div>`;

const ratingCls = (r: number) => (r >= 8 ? 'r-great' : r >= 7 ? 'r-good' : r >= 6 ? 'r-ok' : 'r-bad');
const roleCls: Record<string, string> = { 青训: 'role-y', 替补: 'role-b', 轮换: 'role-r', 主力: 'role-s', 核心: 'role-c' };

function phaseText(game: Game): string {
  const m = game.month;
  if (m === 6) return '休赛期 · 国际大赛';
  if (m === 7) return '季前准备 · 夏窗';
  if (m === 1) return '赛季进行中 · 冬窗';
  return '赛季进行中';
}

function renderProfile(game: Game): string {
  const p = game.player, club = clubById(p.clubId), o = ovr(p), n = nationById(p.nation);
  const w = POS_INFO[p.pos].w;
  return `
  <aside class="card profile">
    <div class="avatar">${avatarSVG(p.look, p.age, club.colors, p.number, p.morale, 170)}${p.captain ? '<span class="cap">C</span>' : ''}${p.injury ? '<span class="inj">🩹 伤停</span>' : ''}</div>
    <h2>${esc(p.name)}</h2>
    <div class="muted">${flagSVG(n, 20)} ${n.name} · ${p.age}岁 · ${POS_INFO[p.pos].name} · ${p.foot}</div>
    <div class="club-line">${crestSVG(club, 30)}<div><b>${club.name}</b><small>${leagueById(club.league).name}</small></div><span class="role ${roleCls[p.role]}">${p.role}</span></div>
    <div class="coach-line">🧑‍💼 主帅 <b>${game.coach.name}</b> <small>${game.coach.style} · ${game.coach.desc}</small></div>
    ${p.partner ? `<div class="coach-line">${p.partner.married ? '💍 配偶' : '❤️ 恋人'} <b>${p.partner.name}</b>${p.kids ? ` · 👶×${p.kids}` : ''}</div>` : ''}
    <div class="ovr-box">
      <div class="ovr"><b>${o}</b><small>综合</small></div>
      <div class="kv"><span>身价</span><b>${fmtMoney(marketValue(p))}</b><span>月薪</span><b>${fmtMoney(p.wage)}</b><span>合同</span><b>至 ${p.contractEnd}.6</b><span>潜力</span><b>${'★'.repeat(Math.max(1, Math.round((p.potential - 70) / 5)))}</b></div>
    </div>
    <h4>能力</h4>
    ${ATTR_KEYS.map(k => bar(ATTR_NAMES[k] + (w[k] >= 0.2 ? '★' : ''), p.attrs[k], 'attr')).join('')}
    <h4>状态</h4>
    ${bar('体能', p.fitness, 'st-fit')}${bar('士气', p.morale, 'st-mor')}${bar('名气', p.fame, 'st-fame')}${bar('教练', p.coachRel, 'st-coach')}
  </aside>`;
}

function fixtureRow(game: Game, f: { comp: MatchResult['comp']; round: string; oppId: string; home: boolean }): string {
  const club = clubById(game.player.clubId);
  const intl = f.comp === 'intl' || f.comp === 'tour';
  const opp = intl ? null : clubById(f.oppId);
  const me = intl ? flagSVG(nationById(game.player.nation), 30) : crestSVG(club, 26);
  const them = intl ? flagSVG(nationById(f.oppId), 30) : crestSVG(opp!, 26);
  const oppName = intl ? nationById(f.oppId).name : f.comp === 'youth' ? `${opp!.name} U19` : opp!.name;
  return `<span class="comp c-${f.comp}">${COMP_NAME(game, f.comp)}</span><span class="round">${f.round}</span>
    <span class="vs">${me}<small>${f.home ? '主' : '客'}</small>${them}</span><span class="opp">${oppName}</span>`;
}

const TRAIN_OPTS: { id: TrainPlan; name: string; desc: string }[] = [
  ...ATTR_KEYS.map(k => ({ id: k as TrainPlan, name: ATTR_NAMES[k], desc: `专项提升${ATTR_NAMES[k]}` })),
  { id: 'balanced', name: '均衡训练', desc: '全面小幅提升' },
  { id: 'intense', name: '魔鬼加练', desc: '成长多，体能 -14，易伤' },
  { id: 'rest', name: '休养恢复', desc: '体能 +22，几乎不成长' },
];
const LIFE_OPTS: { id: LifePlan; name: string; desc: string }[] = [
  { id: 'focus', name: '专注足球', desc: '教练关系↑ 士气略降' },
  { id: 'social', name: '经营社媒', desc: '名气↑ 教练略不满' },
  { id: 'relax', name: '休闲娱乐', desc: '士气↑ 花费少量金钱' },
  { id: 'party', name: '夜生活', desc: '士气↑↑ 体能↓ 有丑闻风险' },
  { id: 'charity', name: '公益慈善', desc: '名气↑ 士气↑ 花费 1% 存款' },
];

function renderFocus(game: Game): string {
  const i = focusIndex(game);
  if (i < 0) return '';
  const f = game.fixtures[i], club = clubById(game.player.clubId), opp = clubById(f.oppId);
  const tag = f.round === '决赛' ? '🏆 决赛' : isDerby(game, f) ? '🔥 同城德比' : f.comp === 'cont' ? '🌟 洲际之夜' : f.comp === 'cup' ? '⚔️ 杯赛淘汰赛' : f.comp === 'youth' ? '🌱 青年队比赛' : '📌 焦点战';
  return `<div class="card focus" style="--c1:${club.colors[0]};--c2:${opp.colors[0]}">
    <div class="focus-tag">${tag} · ${COMP_NAME(game, f.comp)} ${f.round}</div>
    <div class="focus-vs"><div>${crestSVG(club, 70)}<b>${club.name}</b></div><em>VS</em><div>${crestSVG(opp, 70)}<b>${opp.name}</b></div></div>
    <p class="muted small">亲自出战：实时解说，关键时刻由你做决定，进球会播放 3D 集锦。本月其他比赛自动模拟。</p>
  </div>`;
}

function renderMonthTab(game: Game): string {
  const p = game.player, w = POS_INFO[p.pos].w;
  const fx = game.fixtures;
  const empty = game.month === 6 ? (game.year % 2 === 0 ? `🌍 本月将进行 ${game.year % 4 === 2 ? '世界杯' : nationById(p.nation).cup}！` : '🏖️ 休赛期，好好放松一下吧。')
    : game.month === 7 ? '🏃 季前集训与热身赛，转会窗口开启中。' : '本月没有比赛。';
  return `
  <div class="card">
    <h3>📅 ${game.year}年${MONTHS[game.month]} 赛程</h3>
    ${fx.length ? `<div class="fixtures">${fx.map(f => `<div class="fx">${fixtureRow(game, f)}</div>`).join('')}</div>`
      : `<div class="scene-box">${sceneSVG(game.month === 6 ? 'national' : 'train', clubById(p.clubId).colors[0])}<div class="scene-cap">${empty}</div></div>`}
    ${p.injury ? `<div class="warn">🩹 你正在伤停，还需 ${p.injury} 个月才能上场。</div>` : ''}
  </div>
  ${renderFocus(game)}
  <div class="card">
    <h3>🏋️ 本月训练重点</h3>
    <div class="opt-grid">${TRAIN_OPTS.map(o => `<button class="opt ${game.plan.train === o.id ? 'on' : ''}" data-act="train" data-v="${o.id}">
      <i>${ICONS[o.id]}</i><b>${o.name}${(ATTR_KEYS as string[]).includes(o.id) && w[o.id as keyof typeof w] >= 0.2 ? ' ★' : ''}</b><small>${(ATTR_KEYS as string[]).includes(o.id) ? `当前 ${Math.round(p.attrs[o.id as keyof typeof p.attrs])}` : o.desc}</small></button>`).join('')}</div>
    <p class="muted small">★ 为你所在位置的核心能力，对综合评分影响最大。</p>
    <h3>🌃 生活方式</h3>
    <div class="opt-grid five">${LIFE_OPTS.map(o => `<button class="opt ${game.plan.life === o.id ? 'on' : ''}" data-act="life" data-v="${o.id}"><i>${ICONS[o.id]}</i><b>${o.name}</b><small>${o.desc}</small></button>`).join('')}</div>
    <div class="sim-row">
      ${focusIndex(game) >= 0 && !p.injury ? `<button class="btn primary big" data-act="live">⚽ 亲自出战焦点战</button><button class="btn big" data-act="sim">⏩ 快速模拟本月</button>`
        : `<button class="btn primary big" data-act="sim">▶ 进入下个月</button>`}
      ${p.age >= 32 ? '<button class="btn danger" data-act="retire">🧤 宣布退役</button>' : ''}
    </div>
  </div>
  <div class="card">
    <h3>💼 经纪人办公室</h3>
    <div class="office">
      <button class="btn" data-act="raise">💰 要求加薪<small>每赛季一次</small></button>
      <button class="btn" data-act="talk">🗣️ 找主帅要出场时间<small>每赛季一次</small></button>
      <button class="btn" data-act="listing">📤 申请挂牌转会<small>下个窗口报价更多</small></button>
    </div>
  </div>
  <div class="card">
    <h3>📰 近期动态</h3>
    <ul class="log">${game.log.slice(0, 6).map(l => `<li class="k-${l.kind}"><span>${l.y}.${l.m}</span>${esc(l.text)}</li>`).join('')}</ul>
  </div>`;
}

function renderCareerTab(game: Game): string {
  const p = game.player;
  const all = [...p.career, ...(p.season.apps ? [p.season] : [])];
  const senior = all.filter(s => !s.youth);
  const sum = (k: 'apps' | 'goals' | 'assists') => senior.reduce((a, s) => a + s[k], 0);
  return `
  <div class="card stats-top">
    <div><b>${sum('apps')}</b><small>一线队出场</small></div><div><b>${sum('goals')}</b><small>进球</small></div>
    <div><b>${sum('assists')}</b><small>助攻</small></div><div><b>${p.caps}</b><small>国家队出场</small></div>
    <div><b>${p.intlGoals}</b><small>国家队进球</small></div><div><b>${p.trophies.length}</b><small>荣誉</small></div>
  </div>
  <div class="card"><h3>📈 能力与身价成长</h3><div class="chart-box"><canvas id="ch-ovr"></canvas></div></div>
  <div class="card"><h3>⚽ 每赛季数据</h3><div class="chart-box short"><canvas id="ch-goals"></canvas></div>
    <table class="tbl"><thead><tr><th>赛季</th><th>球队</th><th>出场</th><th>进球</th><th>助攻</th><th>评分</th></tr></thead><tbody>
    ${all.map(s => { const c = clubById(s.clubId); return `<tr><td>${seasonLabel(s.season)}</td><td class="tc">${crestSVG(c, 18)} ${c.name}${s.youth ? ' <small>(青训)</small>' : ''}</td><td>${s.apps}</td><td>${s.goals}</td><td>${s.assists}</td><td><span class="rt ${ratingCls(avgRating(s))}">${s.rated ? avgRating(s).toFixed(2) : '-'}</span></td></tr>`; }).reverse().join('') || '<tr><td colspan="6" class="muted">暂无数据</td></tr>'}
    </tbody></table></div>`;
}

function drawCareerCharts(game: Game) {
  const p = game.player;
  const c1 = document.getElementById('ch-ovr') as HTMLCanvasElement | null;
  if (c1) charts.push(new Chart(c1, {
    type: 'line',
    data: {
      labels: p.history.map(h => h.label),
      datasets: [
        { label: '综合能力', data: p.history.map(h => h.ovr), borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,.15)', fill: true, tension: 0.3, pointRadius: 0, yAxisID: 'y' },
        { label: '身价 (万€)', data: p.history.map(h => h.value / 1e4), borderColor: '#fbbf24', tension: 0.3, pointRadius: 0, yAxisID: 'y1' },
      ],
    },
    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { y: { min: 30, max: 100 }, y1: { position: 'right', grid: { drawOnChartArea: false } } } },
  }));
  const c2 = document.getElementById('ch-goals') as HTMLCanvasElement | null;
  const bySeason = new Map<number, { g: number; a: number }>();
  [...p.career, p.season].filter(s => !s.youth).forEach(s => { const v = bySeason.get(s.season) ?? { g: 0, a: 0 }; v.g += s.goals; v.a += s.assists; bySeason.set(s.season, v); });
  const keys = [...bySeason.keys()].sort();
  if (c2) charts.push(new Chart(c2, {
    type: 'bar',
    data: { labels: keys.map(seasonLabel), datasets: [{ label: '进球', data: keys.map(k => bySeason.get(k)!.g), backgroundColor: '#22c55e' }, { label: '助攻', data: keys.map(k => bySeason.get(k)!.a), backgroundColor: '#38bdf8' }] },
    options: { responsive: true, maintainAspectRatio: false },
  }));
}

function renderLeagueTab(game: Game): string {
  const club = clubById(game.player.clubId), lg = leagueById(club.league);
  const rows = sortedTable(game);
  return `<div class="card"><h3>${crestSVG(club, 22)} ${lg.name} ${seasonLabel(seasonOf(game))}</h3>
  <table class="tbl league"><thead><tr><th>#</th><th>球队</th><th>赛</th><th>胜</th><th>平</th><th>负</th><th>进/失</th><th>积分</th></tr></thead><tbody>
  ${rows.map((r, i) => { const c = clubById(r.clubId); return `<tr class="${c.id === club.id ? 'me' : ''} ${i === 0 ? 'top' : ''}"><td>${i + 1}</td><td class="tc">${crestSVG(c, 20)} ${c.name}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}:${r.ga}</td><td><b>${r.pts}</b></td></tr>`; }).join('')}
  </tbody></table>
  <p class="muted small">本赛季${game.contAlive ? `✅ 正在征战${lg.cont}` : `❌ 未参加/已出局${lg.cont}`}　${game.cupAlive ? `✅ ${lg.cup}在赛` : `❌ ${lg.cup}已出局`}${qualifiesCont(club) ? '' : '　(球队声望不足以参加洲际赛事)'}</p></div>
  <div class="card"><h3>🌍 其他联赛</h3><div class="leagues">${LEAGUES.filter(l => !l.hidden).map(l => `<div class="lg"><b>${l.name}</b>
    <div class="crests">${CLUBS.filter(c => c.league === l.id).map(c => `<span title="${c.name} 实力 ${c.level}">${crestSVG(c, 26)}</span>`).join('')}</div></div>`).join('')}</div></div>`;
}

const TROPHY_ORDER: TrophyKind[] = ['ballon', 'intl', 'cont', 'league', 'cup', 'boot', 'poty', 'young', 'tots'];
const TROPHY_NAME: Record<TrophyKind, string> = { ballon: '金球奖', intl: '国际大赛', cont: '洲际冠军', league: '联赛冠军', cup: '国内杯', boot: '金靴奖', poty: '赛季最佳', young: '最佳新秀', tots: '最佳阵容' };

function renderHonorsTab(game: Game): string {
  const t = game.player.trophies;
  return `<div class="card"><h3>🏆 荣誉陈列室</h3><div class="cabinet">${TROPHY_ORDER.map(k => {
    const list = t.filter(x => x.kind === k);
    return `<div class="shelf ${list.length ? '' : 'empty'}">${trophySVG(k, 70)}<b>${TROPHY_NAME[k]}</b><span>× ${list.length}</span></div>`;
  }).join('')}</div></div>
  <div class="card"><h3>📜 荣誉列表</h3><ul class="log">${t.length ? [...t].reverse().map(x => `<li class="k-gold"><span>${seasonLabel(x.season)}</span>${x.name}</li>`).join('') : '<li class="muted">还没有荣誉，继续努力！</li>'}</ul></div>`;
}

function renderLifeTab(game: Game): string {
  const p = game.player, used = (k: string) => game.lifeActs.includes(k);
  const love = p.partner ? `<div class="partner"><div class="heart">${p.partner.married ? '💍' : '❤️'}</div><div><b>${p.partner.name}</b><small>${p.partner.married ? `已婚${p.kids ? ` · ${p.kids} 个孩子` : ''}` : '交往中'}</small>
      ${bar('感情', p.partner.love, 'st-mor')}</div></div>` : '<p class="muted">你目前单身。多参加社交活动，也许会遇到对的人。</p>';
  return `<div class="card"><h3>❤️ 感情与家庭</h3>
    <div class="scene-box">${sceneSVG(p.partner ? 'love' : 'party', clubById(p.clubId).colors[0])}</div>
    ${love}
    <div class="office">
      ${!p.partner ? `<button class="btn" data-act="lifeact" data-v="date" ${used('date') ? 'disabled' : ''}>🥂 参加社交活动<small>€3000 · 每月一次</small></button>` : ''}
      ${p.partner ? `<button class="btn" data-act="lifeact" data-v="gift" ${used('gift') ? 'disabled' : ''}>🎁 准备惊喜<small>感情↑</small></button>` : ''}
      ${p.partner && !p.partner.married ? `<button class="btn" data-act="lifeact" data-v="propose">💍 求婚<small>需要感情 ≥ 70</small></button>` : ''}
      ${p.partner?.married && p.kids < 3 ? `<button class="btn" data-act="lifeact" data-v="baby" ${used('baby') ? 'disabled' : ''}>👶 要个孩子</button>` : ''}
      <button class="btn" data-act="lifeact" data-v="vacation" ${used('vacation') ? 'disabled' : ''}>🏝️ 短途度假<small>体能↑ 士气↑</small></button>
    </div></div>
  <div class="card"><h3>🛍️ 生活与资产 <span class="muted small">存款 ${fmtMoney(p.money)}</span></h3><div class="shop">${SHOP.map(it => {
    const owned = p.owned.includes(it.id);
    return `<div class="item ${owned ? 'owned' : ''}"><i>${it.icon}</i><b>${it.name}</b><small>${it.desc}</small><span>${fmtMoney(it.price)}</span>
      ${owned ? '<button class="btn ghost sm" disabled>已拥有</button>' : `<button class="btn sm ${p.money >= it.price ? 'primary' : ''}" data-act="buy" data-v="${it.id}" ${p.money >= it.price ? '' : 'disabled'}>购买</button>`}</div>`;
  }).join('')}</div></div>`;
}

function renderLogTab(game: Game): string {
  return `<div class="card"><h3>🗒️ 生涯日志</h3><ul class="log">${game.log.map(l => `<li class="k-${l.kind}"><span>${l.y}.${l.m}</span>${esc(l.text)}</li>`).join('')}</ul></div>`;
}

function renderGame(game: Game) {
  const p = game.player;
  const tabs: [typeof tab, string][] = [['month', '📅 本月'], ['career', '📈 生涯'], ['league', '🏟️ 联赛'], ['honors', '🏆 荣誉'], ['life', '❤️ 生活'], ['log', '🗒️ 日志']];
  const body = { month: renderMonthTab, career: renderCareerTab, league: renderLeagueTab, honors: renderHonorsTab, life: renderLifeTab, log: renderLogTab }[tab](game);
  app.innerHTML = `
  <header class="top">
    <div class="brand">⚽ 足球人生</div>
    <div class="date"><b>${game.year}年${MONTHS[game.month]}</b><small>${seasonLabel(seasonOf(game))}赛季 · ${phaseText(game)}</small></div>
    <div class="money">💰 ${fmtMoney(p.money)}</div>
    <button class="btn ghost sm" data-act="sound">${soundOn() ? '🔊' : '🔇'}</button>
    <button class="btn ghost sm" data-act="newgame">重新开始</button>
  </header>
  <main class="layout">
    ${renderProfile(game)}
    <section class="content">
      <nav class="tabs">${tabs.map(([k, n]) => `<button class="${tab === k ? 'on' : ''}" data-act="tab" data-v="${k}">${n}</button>`).join('')}</nav>
      ${body}
    </section>
  </main>`;
  if (tab === 'career') drawCareerCharts(game);
}

function renderRetired(game: Game) {
  const p = game.player, score = legendScore(p);
  const senior = p.career.filter(s => !s.youth);
  const sum = (k: 'apps' | 'goals' | 'assists') => senior.reduce((a, s) => a + s[k], 0);
  const clubs = [...new Set(senior.map(s => s.clubId))];
  app.innerHTML = `
  <div class="retired">
    <div class="card retired-hero">
      <div>${avatarSVG(p.look, p.age, clubById(p.clubId).colors, p.number, 80, 220)}</div>
      <div>
        <h1>${esc(p.name)} 的足球人生</h1>
        <p class="muted">${flagSVG(nationById(p.nation), 22)} ${nationById(p.nation).name} · ${POS_INFO[p.pos].name} · ${p.age} 岁退役</p>
        <div class="legend">${legendTitle(score)}<small>传奇指数 ${score}</small></div>
        <div class="stats-top inline">
          <div><b>${sum('apps')}</b><small>出场</small></div><div><b>${sum('goals')}</b><small>进球</small></div><div><b>${sum('assists')}</b><small>助攻</small></div>
          <div><b>${p.caps}</b><small>国家队</small></div><div><b>${p.trophies.length}</b><small>荣誉</small></div><div><b>${fmtMoney(p.money)}</b><small>身家</small></div>
        </div>
        <div class="crests">${clubs.map(id => `<span title="${clubById(id).name}">${crestSVG(clubById(id), 36)}</span>`).join('')}</div>
      </div>
    </div>
    <div class="card"><h3>📈 生涯曲线</h3><div class="chart-box"><canvas id="ch-ovr"></canvas></div></div>
    ${renderHonorsTab(game)}
    <div class="center"><button class="btn primary big" data-act="newgame">开启新的足球人生</button></div>
  </div>`;
  drawCareerCharts(game);
}

function render() {
  charts.forEach(c => c.destroy()); charts = [];
  if (!g) renderCreate();
  else if (g.retired) renderRetired(g);
  else renderGame(g);
}

// ================= 弹窗流程 =================
function openModal(html: string, cls = '') {
  closeHighlight();
  modal.innerHTML = `<div class="backdrop"><div class="dialog ${cls}">${html}</div></div>`;
  modal.querySelector('.dialog')!.scrollTop = 0;
}
function closeHighlight() { highlight?.dispose(); highlight = null; }
function nextStep() {
  const s = steps.shift();
  if (s) s(); else { closeHighlight(); modal.innerHTML = ''; save(); render(); }
}

function resultRow(game: Game, r: MatchResult): string {
  const res = r.gf > r.ga || r.pen === 'W' ? 'W' : r.gf < r.ga || r.pen === 'L' ? 'L' : 'D';
  const status = r.played === 'out' ? '伤停' : r.played === 'bench' ? '未出场' : r.played === 'sub' ? `替补 ${r.minutes}'` : `首发 ${r.minutes}'`;
  return `<div class="fx res">${fixtureRow(game, r)}
    <span class="score s-${res}">${r.home ? `${r.gf}-${r.ga}` : `${r.ga}-${r.gf}`}${r.pen ? `<small>点球${r.pen === 'W' ? '胜' : '负'}</small>` : ''}</span>
    <span class="status">${status}</span>
    <span class="ga">${'⚽'.repeat(Math.min(r.goals, 5))}${'👟'.repeat(Math.min(r.assists, 4))}</span>
    ${r.minutes ? `<span class="rt ${ratingCls(r.rating)}">${r.rating.toFixed(1)}</span>` : '<span class="rt none">-</span>'}</div>`;
}

function renderNews(game: Game, rep: MonthReport): string {
  const h = headline(game, rep.results);
  if (!h) return '';
  const cm = fanComments(game, rep.results);
  return `<div class="news"><div class="paper"><small>${h.media} · ${rep.y}年${MONTHS[rep.m]}</small><h3>${esc(h.title)}</h3><p>${esc(h.sub)}</p></div>
    <div class="fans"><small>📱 球迷热评</small>${cm.map(c => `<div class="cmt"><b>@${c.user}</b> ${c.text}<span>❤ ${c.likes >= 10000 ? (c.likes / 10000).toFixed(1) + '万' : c.likes}</span></div>`).join('')}</div></div>`;
}

function showReport(game: Game, rep: MonthReport) {
  const p = game.player;
  const clubRes = rep.results.filter(r => r.comp !== 'tour');
  const deltas = Object.entries(rep.delta).filter(([, d]) => Math.abs(d!) >= 0.3);
  openModal(`
    <h2>📅 ${rep.y}年${MONTHS[rep.m]} 月度报告</h2>
    ${rep.highlight ? `<div class="hl"><div class="hl-canvas" id="hl"></div><button class="btn ghost sm replay" data-act="replay">↺ 重播</button></div>`
      : `<div class="scene-box">${sceneSVG(rep.m === 6 ? 'family' : rep.m === 7 ? 'train' : p.injury ? 'injury' : 'fans', clubById(p.clubId).colors[0])}<div class="scene-cap">${rep.m === 7 ? '季前集训，为新赛季做准备。' : rep.m === 6 ? '享受假期时光。' : '本月没有你的出场集锦。'}</div></div>`}
    ${renderNews(game, rep)}
    ${clubRes.length ? `<h3>比赛</h3><div class="fixtures">${clubRes.map(r => resultRow(game, r)).join('')}</div>` : ''}
    <div class="two">
      <div><h3>成长</h3>${deltas.length ? `<div class="deltas">${deltas.map(([k, d]) => `<span class="${d! > 0 ? 'up' : 'down'}">${ATTR_NAMES[k as keyof typeof ATTR_NAMES]} ${d! > 0 ? '+' : ''}${d!.toFixed(1)}</span>`).join('')}</div>` : '<p class="muted">变化不大</p>'}
        <p>综合 <b>${rep.ovrBefore}</b> → <b class="${rep.ovrAfter > rep.ovrBefore ? 'up' : rep.ovrAfter < rep.ovrBefore ? 'down' : ''}">${rep.ovrAfter}</b></p>
        <p class="muted">收入 <b class="up">+${fmtMoney(rep.income)}</b>　支出 <b class="down">-${fmtMoney(rep.expense)}</b></p></div>
      <div><h3>动态</h3><ul class="notes">${rep.notes.map(n => `<li class="k-${n.kind}">${esc(n.text)}</li>`).join('') || '<li class="muted">平静的一个月。</li>'}</ul></div>
    </div>
    <div class="actions"><button class="btn primary" data-act="next">继续 →</button></div>`, 'wide');
  if (rep.highlight) {
    const host = document.getElementById('hl')!;
    requestAnimationFrame(() => {
      highlight = playHighlight(host, { type: rep.highlight!, name: p.name, number: p.number, skin: p.look.skin, team: rep.highlightTeam, opp: rep.highlightOpp, caption: rep.highlightCaption });
    });
  }
}

function showSeason(game: Game, s: SeasonSummary) {
  const club = clubById(s.stats.clubId);
  openModal(`
    <h2>🏁 ${seasonLabel(s.season)} 赛季总结</h2>
    <div class="season-hero">${crestSVG(club, 70)}<div><h3>${club.name}</h3><p>联赛最终排名 <b class="big-num">第 ${s.rank} 名</b></p></div></div>
    <div class="stats-top inline"><div><b>${s.stats.apps}</b><small>出场</small></div><div><b>${s.stats.goals}</b><small>进球</small></div><div><b>${s.stats.assists}</b><small>助攻</small></div><div><b>${s.stats.rated ? avgRating(s.stats).toFixed(2) : '-'}</b><small>平均评分</small></div></div>
    <p class="muted">金靴争夺：你联赛进球 ${s.stats.leagueGoals} 个，最强竞争者 ${s.aiTop} 个。${s.goldenBoot ? '👟 你赢得了金靴！' : ''}</p>
    ${s.trophies.length ? `<div class="trophy-row">${s.trophies.map(t => `<div>${trophySVG(t.includes('金靴') ? 'boot' : t.includes('最佳') ? 'poty' : t.includes('联赛') || t.includes('冠军联赛') ? 'cont' : t.includes('杯') ? 'cup' : 'league', 80)}<b>${t}</b></div>`).join('')}</div>` : '<p class="muted">本赛季没有收获冠军。</p>'}
    <div class="actions"><button class="btn primary" data-act="next">继续 →</button></div>`);
  void game;
}

function showTournament(game: Game, t: NonNullable<MonthReport['tournament']>) {
  openModal(`
    <h2>🌍 ${game.year}年${t.name}</h2>
    <div class="scene-box">${sceneSVG('national', nationById(game.player.nation).colors[0])}<div class="scene-cap">${flagSVG(nationById(game.player.nation), 34)} ${t.champion ? '🏆 你带领国家队夺得冠军！' : '国家队的征程结束了。'}</div></div>
    <div class="fixtures">${t.results.map(r => resultRow(game, r)).join('')}</div>
    ${t.champion ? `<div class="trophy-row"><div>${trophySVG('intl', 110)}<b>${t.name}冠军</b></div></div>` : ''}
    <div class="actions"><button class="btn primary" data-act="next">继续 →</button></div>`);
}

function showAwards(game: Game, a: AwardInfo) {
  openModal(`
    <h2>✨ ${a.season + 1} 年度颁奖典礼</h2>
    <div class="awards-hero">${trophySVG('ballon', 110)}<div><h3>金球奖排名</h3><p>${a.myRank === 1 ? '🎉 你荣获金球奖！世界最佳！' : a.myRank ? `你排名第 <b>${a.myRank}</b> 位` : '出场不足，未进入候选名单'}</p></div></div>
    <ol class="ranking">${a.ranking.map((r, i) => `<li class="${r.me ? 'me' : ''}"><span>${r.me ? a.myRank : i + 1}</span><b>${r.me ? esc(game.player.name) : r.name}</b><em>${r.score}</em></li>`).join('')}</ol>
    ${a.won.length ? `<div class="trophy-row">${a.won.map(w => `<div>${trophySVG(w === '金球奖' ? 'ballon' : w === '最佳新秀' ? 'young' : 'tots', 80)}<b>${w}</b></div>`).join('')}</div>` : ''}
    <div class="actions"><button class="btn primary" data-act="next">继续 →</button></div>`);
}

function showEvent(game: Game, id: string) {
  const ev = eventById(id);
  const accent = clubById(game.player.clubId).colors[0];
  openModal(`
    <div class="event-art">${sceneSVG(ev.art, accent)}</div>
    <h2>${ev.title}</h2>
    <p class="event-text">${esc(ev.text(game))}</p>
    <div class="choices">${ev.choices.map((c, i) => `<button class="btn choice" data-act="choose" data-v="${i}">${c.label}${c.hint ? `<small>${c.hint}</small>` : ''}</button>`).join('')}</div>`);
  pendingEvent = id;
}
let pendingEvent = '';

function showOffers(game: Game, offers: Offer[], forced: boolean) {
  const p = game.player;
  openModal(`
    <h2>📝 ${game.month === 1 ? '冬季' : '夏季'}转会窗口</h2>
    <p class="muted">${forced ? '⚠️ 你的合同已到期，必须选择一份合同（或宣布退役）。' : '经纪人带来了以下报价：'}</p>
    <div class="offers">${offers.map((o, i) => {
      const c = clubById(o.clubId), lg = leagueById(c.league);
      return `<div class="offer ${o.renewal ? 'renew' : ''}">
        <div class="offer-top">${crestSVG(c, 54)}${jerseySVG(c.colors, c.pattern, POS_INFO[p.pos].num, esc(p.name).slice(0, 6), 84)}</div>
        <h3>${o.renewal ? '🔁 续约 · ' : ''}${c.name}</h3>
        <small>${lg.name} · 声望 ${'★'.repeat(Math.round(c.rep / 20))} · 实力 ${c.level}</small>
        <div class="kv"><span>预期角色</span><b class="role ${roleCls[o.role]}">${o.role}</b><span>月薪</span><b>${fmtMoney(o.wage)}</b><span>合同</span><b>${o.years} 年</b><span>转会费</span><b>${o.fee ? fmtMoney(o.fee) : '自由'}</b></div>
        <button class="btn primary" data-act="accept" data-v="${i}">${o.renewal ? '续约' : '签约'}</button></div>`;
    }).join('')}</div>
    <div class="actions">${forced ? (p.age >= 30 ? '<button class="btn danger" data-act="retire-now">宣布退役</button>' : '') : '<button class="btn ghost" data-act="next">全部拒绝</button>'}</div>`, 'wide');
  pendingOffers = offers;
}
let pendingOffers: Offer[] = [];

function simulate(live?: { idx: number; result: MatchResult }) {
  if (!g) return;
  const game = g;
  const rep = simulateMonth(game, pickEvent, live);
  if (rep.season?.trophies.length || rep.awards?.won.length || rep.tournament?.champion) sfx.trophy();
  steps = [() => showReport(game, rep)];
  if (rep.season) steps.push(() => showSeason(game, rep.season!));
  if (rep.tournament) steps.push(() => showTournament(game, rep.tournament!));
  if (rep.awards && rep.awards.myRank) steps.push(() => showAwards(game, rep.awards!));
  if (rep.eventId) steps.push(() => showEvent(game, rep.eventId!));
  if (rep.offers.length) steps.push(() => showOffers(game, rep.offers, rep.forced));
  else if (rep.forced) steps.push(() => { retire(game); nextStep(); });
  if (mustRetire(game)) steps.push(() => { if (!game.retired) retire(game); nextStep(); });
  save();
  nextStep();
}

async function startLive() {
  if (!g) return;
  const game = g, idx = focusIndex(game);
  const plan = planLive(game, idx);
  const f = game.fixtures[idx];
  if (plan.played === 'bench' || plan.played === 'out') {
    openModal(`<div class="scene-box">${sceneSVG('coach', clubById(game.player.clubId).colors[0])}</div>
      <h2>📋 首发名单公布</h2><p class="event-text">${game.coach.name}公布了对阵${clubById(f.oppId).name}的大名单……<br><b>你的名字不在其中。</b>你只能在看台上看完了这场比赛。</p>
      <div class="actions"><button class="btn primary" id="bench-go">继续 →</button></div>`);
    game.player.morale = Math.max(0, game.player.morale - 3);
    const result = benchResult(game, idx, plan.played);
    (document.getElementById('bench-go') as HTMLElement).onclick = () => simulate({ idx, result });
    return;
  }
  openModal('<div id="live-host"></div>', 'live-dialog');
  const out = await runLiveMatch(game, plan as LivePlan, document.getElementById('live-host')!);
  const result = resolveLive(game, plan as LivePlan, out);
  const w = result.gf > result.ga || result.pen === 'W', l = result.gf < result.ga || result.pen === 'L';
  const act = document.querySelector('#live-host .lv-act') as HTMLElement;
  act.classList.add('show');
  act.innerHTML = `<div class="lv-final ${w ? 'win' : l ? 'lose' : ''}">
    <h3>${w ? '🎉 胜利！' : l ? '😔 失利' : '🤝 平局'} ${result.gf} - ${result.ga}${result.pen ? `（点球${result.pen === 'W' ? '胜' : '负'}）` : ''}</h3>
    <div class="lv-rate"><span class="rt ${ratingCls(result.rating)}">${result.rating.toFixed(1)}</span>${result.rating >= 8.3 ? '<b class="gold">⭐ 全场最佳</b>' : ''}</div>
    <p>${result.goals ? `⚽×${result.goals} ` : ''}${result.assists ? `👟×${result.assists} ` : ''}出场 ${result.minutes} 分钟</p>
    <button class="btn primary" id="lv-done">继续本月 →</button></div>`;
  (document.getElementById('lv-done') as HTMLElement).onclick = () => simulate({ idx, result });
}

// ================= 事件委托 =================
document.addEventListener('click', e => {
  const el = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
  if (!el || (el as HTMLButtonElement).disabled) return;
  const act = el.dataset.act!, v = el.dataset.v ?? '';
  if (!g) { onCreateAction(act, v); return; }
  const game = g;
  switch (act) {
    case 'tab': tab = v as typeof tab; render(); break;
    case 'train': game.plan.train = v as TrainPlan; render(); break;
    case 'life': game.plan.life = v as LifePlan; render(); break;
    case 'sim': simulate(); break;
    case 'live': void startLive(); break;
    case 'sound': toggleSound(); render(); break;
    case 'raise': case 'talk': {
      const r = act === 'raise' ? askRaise(game) : askPlaytime(game);
      openModal(`<div class="scene-box">${sceneSVG(act === 'raise' ? 'money' : 'coach', clubById(game.player.clubId).colors[0])}</div>
        <h2>${act === 'raise' ? '💰 薪资谈判' : '🗣️ 与主帅谈话'}</h2><p class="event-text">${esc(r.text)}</p>
        <div class="actions"><button class="btn primary" data-act="next">好的</button></div>`);
      steps = []; save(); break;
    }
    case 'listing':
      if (confirm('申请挂牌会严重影响你和主教练、球迷的关系，确定吗？')) {
        const t = requestListing(game);
        openModal(`<div class="scene-box">${sceneSVG('media', clubById(game.player.clubId).colors[0])}</div><h2>📤 转会申请</h2><p class="event-text">${esc(t)}</p><div class="actions"><button class="btn primary" data-act="next">知道了</button></div>`);
        steps = []; save();
      }
      break;
    case 'lifeact': {
      const t = lifeAction(game, v);
      openModal(`<div class="scene-box">${sceneSVG(v === 'vacation' ? 'charity' : v === 'baby' ? 'family' : 'love', clubById(game.player.clubId).colors[0])}</div><p class="event-text">${esc(t)}</p><div class="actions"><button class="btn primary" data-act="next">好的</button></div>`);
      steps = []; save(); break;
    }
    case 'next': nextStep(); break;
    case 'replay': highlight?.replay(); break;
    case 'choose': {
      const ev = eventById(pendingEvent), res = ev.choices[+v].run(game);
      const d = modal.querySelector('.choices')!;
      d.outerHTML = `<div class="event-result">${esc(res)}</div><div class="actions"><button class="btn primary" data-act="next">继续 →</button></div>`;
      save(); break;
    }
    case 'accept': acceptOffer(game, pendingOffers[+v]); save(); nextStep(); break;
    case 'retire-now': retire(game); steps = []; nextStep(); break;
    case 'retire': if (confirm('确定要结束职业生涯吗？')) { retire(game); save(); render(); } break;
    case 'buy': {
      const it = SHOP.find(s => s.id === v)!;
      if (game.player.money >= it.price) {
        game.player.money -= it.price; game.player.owned.push(it.id);
        game.player.morale = Math.min(100, game.player.morale + it.morale); game.player.fame = Math.min(100, game.player.fame + it.fame);
        game.log.unshift({ y: game.year, m: game.month, text: `${it.icon} 购买了${it.name}。`, kind: 'good' });
        save(); render();
      }
      break;
    }
    case 'newgame':
      if (game.retired || confirm('确定放弃当前存档，重新开始吗？')) {
        localStorage.removeItem(SAVE_KEY); g = null; create.clubs = clubChoices(); create.clubId = create.clubs[0]; create.name = randomName(); render();
      }
      break;
  }
});

render();
