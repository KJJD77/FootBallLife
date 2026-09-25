import { CLUBS, COACH_NAMES, COACH_STYLES, LEAGUES, NATIONS, PARTNER_NAMES, RIVAL_NAMES } from './data';
import type {
  AttrKey, Attrs, ChanceKind, Club, Coach, Comp, Fixture, Game, LiveOutcome, LivePlan, HighlightType, LogEntry, MatchResult, Nation, Offer,
  Player, Pos, Role, SeasonStats, TableRow, Trophy, TrophyKind,
} from './types';

// ---------- 工具函数 ----------
export const rand = Math.random;
export const ri = (a: number, b: number) => Math.floor(a + rand() * (b - a + 1));
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const poisson = (l: number) => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= rand(); } while (p > L); return k - 1; };
const shuffle = <T>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const ATTR_KEYS: AttrKey[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
export const ATTR_NAMES: Record<AttrKey, string> = { pace: '速度', shooting: '射门', passing: '传球', dribbling: '盘带', defending: '防守', physical: '身体' };

export const POS_INFO: Record<Pos, { name: string; desc: string; w: Attrs; goal: number; assist: number; num: number }> = {
  ST: { name: '中锋', desc: '禁区杀手，进球就是使命', w: { pace: .2, shooting: .4, passing: .05, dribbling: .15, defending: 0, physical: .2 }, goal: .22, assist: .09, num: 9 },
  WG: { name: '边锋', desc: '速度与突破，撕裂防线', w: { pace: .3, shooting: .2, passing: .15, dribbling: .3, defending: 0, physical: .05 }, goal: .14, assist: .15, num: 7 },
  AM: { name: '前腰', desc: '球队大脑，致命直塞', w: { pace: .1, shooting: .2, passing: .35, dribbling: .3, defending: 0, physical: .05 }, goal: .11, assist: .19, num: 10 },
  CM: { name: '中场', desc: '攻守兼备的发动机', w: { pace: .1, shooting: .1, passing: .3, dribbling: .15, defending: .2, physical: .15 }, goal: .06, assist: .12, num: 8 },
  CB: { name: '中卫', desc: '钢铁防线，后防领袖', w: { pace: .15, shooting: 0, passing: .1, dribbling: 0, defending: .45, physical: .3 }, goal: .035, assist: .03, num: 4 },
};

export const MONTHS = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export const SHOP: { id: string; name: string; icon: string; price: number; desc: string; morale: number; fame: number }[] = [
  { id: 'chef', name: '私人营养师', icon: '🥗', price: 150_000, desc: '每月体能恢复 +6', morale: 2, fame: 0 },
  { id: 'car', name: '豪华跑车', icon: '🏎️', price: 350_000, desc: '士气 +6，名气 +2', morale: 6, fame: 2 },
  { id: 'trainer', name: '私人体能教练', icon: '🏋️', price: 1_000_000, desc: '训练成长 +15%', morale: 2, fame: 0 },
  { id: 'flat', name: '市中心公寓', icon: '🏙️', price: 1_500_000, desc: '士气 +8', morale: 8, fame: 1 },
  { id: 'cryo', name: '冷冻恢复舱', icon: '❄️', price: 2_500_000, desc: '伤病恢复加快，受伤概率降低', morale: 2, fame: 0 },
  { id: 'villa', name: '海边别墅', icon: '🏖️', price: 8_000_000, desc: '士气 +12，名气 +5', morale: 12, fame: 5 },
  { id: 'yacht', name: '豪华游艇', icon: '🛥️', price: 25_000_000, desc: '士气 +15，名气 +8', morale: 15, fame: 8 },
  { id: 'jet', name: '私人飞机', icon: '✈️', price: 60_000_000, desc: '名气 +15，巨星标配', morale: 10, fame: 15 },
];

export const clubById = (id: string): Club => CLUBS.find(c => c.id === id)!;
export const nationById = (id: string): Nation => NATIONS.find(n => n.id === id)!;
export const leagueById = (id: string) => LEAGUES.find(l => l.id === id)!;
export const seasonOf = (g: Game) => (g.month >= 7 ? g.year : g.year - 1);
export const seasonLabel = (s: number) => `${s}/${String((s + 1) % 100).padStart(2, '0')}`;

export function ovr(p: Player): number {
  const w = POS_INFO[p.pos].w;
  return Math.round(ATTR_KEYS.reduce((s, k) => s + p.attrs[k] * w[k], 0));
}

export function marketValue(p: Player): number {
  const o = ovr(p);
  const ageF = p.age <= 21 ? 1.4 : p.age <= 25 ? 1.25 : p.age <= 28 ? 1 : p.age <= 31 ? 0.65 : p.age <= 34 ? 0.3 : 0.12;
  const potF = 1 + (Math.max(0, p.potential - o) / 40) * (p.age < 24 ? 1 : 0.3);
  const v = Math.pow(1.19, o - 50) * 40_000 * ageF * potF * (1 + p.fame / 200);
  return Math.max(10_000, Math.round(v / 10_000) * 10_000);
}

export function baseWage(o: number, club: Club): number {
  return Math.round(Math.pow(1.17, o - 50) * 3_000 * (0.6 + club.rep / 100) / 100) * 100;
}

export function fmtMoney(v: number): string {
  const a = Math.abs(v), s = v < 0 ? '-' : '';
  if (a >= 1e8) return `${s}€${(a / 1e8).toFixed(2)}亿`;
  if (a >= 1e4) return `${s}€${(a / 1e4).toFixed(a >= 1e6 ? 0 : 1)}万`;
  return `${s}€${Math.round(a)}`;
}

export const avgRating = (s: { ratingSum: number; rated: number }) => (s.rated ? s.ratingSum / s.rated : 0);

function newSeason(season: number, clubId: string, youth: boolean): SeasonStats {
  return { season, clubId, apps: 0, goals: 0, assists: 0, leagueGoals: 0, ratingSum: 0, rated: 0, youth };
}

function log(g: Game, text: string, kind: LogEntry['kind'] = 'info') {
  g.log.unshift({ y: g.year, m: g.month, text, kind });
  if (g.log.length > 400) g.log.length = 400;
}

function addTrophy(g: Game, name: string, kind: TrophyKind, season: number) {
  g.player.trophies.push({ name, kind, season });
  log(g, `🏆 获得 ${name}！`, 'gold');
}

export function roleFor(o: number, level: number, coachRel = 50): Role {
  const d = o - level + (coachRel - 50) / 12;
  return d > 7 ? '核心' : d > 3 ? '主力' : d > -2 ? '轮换' : '替补';
}

// ---------- 新游戏 ----------
export interface NewGameOpts { name: string; nation: string; pos: Pos; foot: '左脚' | '右脚'; look: Player['look']; clubId: string }

export function newGame(o: NewGameOpts): Game {
  const attrs = {} as Attrs;
  const w = POS_INFO[o.pos].w;
  for (const k of ATTR_KEYS) attrs[k] = ri(36, 46) + (w[k] >= 0.2 ? ri(6, 11) : w[k] > 0 ? ri(2, 5) : 0);
  const club = clubById(o.clubId);
  const p: Player = {
    name: o.name, nation: o.nation, pos: o.pos, foot: o.foot, look: o.look, number: ri(30, 49), age: 16, attrs,
    potential: clamp(Math.round(86 + gauss() * 5), 76, 97),
    fitness: 90, morale: 70, fame: 2, coachRel: 50, money: 5_000, wage: 2_000, clubId: club.id, contractEnd: 2029,
    role: '青训', injury: 0, season: newSeason(2026, club.id, true), career: [], trophies: [], history: [],
    caps: 0, intlGoals: 0, owned: [], captain: false, partner: null, kids: 0, raiseSeason: 0, talkSeason: 0, motm: 0,
  };
  const g: Game = {
    version: 1, year: 2026, month: 7, player: p, table: [], fixtures: [],
    cupAlive: true, contAlive: false, contGroupPts: 0, cupWon: false, contWon: false,
    plan: { train: 'balanced', life: 'focus' }, log: [], retired: false, offerBoost: 0,
    coach: { name: '', style: '', desc: '' }, lifeActs: [],
  };
  newCoach(g, false);
  resetTable(g, 0);
  pushHistory(g);
  log(g, `${p.name}，16 岁，加入 ${club.name} 青训营。梦想从这里开始！`, 'gold');
  prepareMonth(g);
  return g;
}

// ---------- 联赛积分榜 ----------
function resetTable(g: Game, roundsPlayed: number) {
  const lg = clubById(g.player.clubId).league;
  g.table = CLUBS.filter(c => c.league === lg).map(c => ({ clubId: c.id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
  for (let i = 0; i < roundsPlayed; i++) simulateRound(g, null);
}

function applyResult(row: TableRow | undefined, gf: number, ga: number) {
  if (!row) return;
  row.p++; row.gf += gf; row.ga += ga;
  if (gf > ga) { row.w++; row.pts += 3; } else if (gf === ga) { row.d++; row.pts += 1; } else row.l++;
}

function quickScore(a: Club, b: Club): [number, number] {
  const d = (a.level - b.level + 2) / 24;
  return [poisson(1.35 * Math.exp(d)), poisson(1.35 * Math.exp(-d))];
}

/** 模拟一轮（excluded 为已经单独模拟的两支球队） */
function simulateRound(g: Game, excluded: [string, string] | null) {
  const ids = shuffle(g.table.map(r => r.clubId).filter(id => !excluded || !excluded.includes(id)));
  for (let i = 0; i + 1 < ids.length; i += 2) {
    const [x, y] = quickScore(clubById(ids[i]), clubById(ids[i + 1]));
    applyResult(g.table.find(r => r.clubId === ids[i]), x, y);
    applyResult(g.table.find(r => r.clubId === ids[i + 1]), y, x);
  }
}

export function sortedTable(g: Game): TableRow[] {
  return [...g.table].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
}

// ---------- 赛程 ----------
const LEAGUE_COUNT: Record<number, number> = { 8: 3, 9: 4, 10: 4, 11: 4, 12: 4, 1: 4, 2: 4, 3: 4, 4: 4, 5: 3 };
const CUP_ROUND: Record<number, string> = { 10: '第三轮', 12: '16强', 2: '8强', 4: '半决赛', 5: '决赛' };
const CONT_ROUND: Record<number, string> = { 9: '小组赛', 10: '小组赛', 11: '小组赛', 12: '小组赛', 2: '16强', 3: '8强', 4: '半决赛', 5: '决赛' };
const INTL_MONTHS = [9, 10, 11, 3];

export const COMP_NAME = (g: Game, c: Comp): string => {
  const lg = leagueById(clubById(g.player.clubId).league);
  return { league: lg.short, cup: lg.cup, cont: lg.cont, intl: '国家队', youth: '青年联赛', tour: '大赛' }[c];
};

function contPool(club: Club): Club[] {
  return club.league === 'CHN' || club.league === 'ASI'
    ? CLUBS.filter(c => (c.league === 'ASI' || c.league === 'CHN') && c.id !== club.id && c.rep >= 54)
    : CLUBS.filter(c => !['CHN', 'ASI', club.league].includes(c.league) && c.rep >= 68);
}

export function qualifiesCont(club: Club) {
  return club.league === 'CHN' ? club.rep >= 60 : club.rep >= (club.league === 'NED' ? 72 : 78);
}

export function prepareMonth(g: Game) {
  const p = g.player, club = clubById(p.clubId), m = g.month;
  const leagueClubs = CLUBS.filter(c => c.league === club.league && c.id !== club.id);
  const fx: Fixture[] = [];
  const n = LEAGUE_COUNT[m] ?? 0;
  const opps = shuffle([...leagueClubs]);
  for (let i = 0; i < n; i++) {
    fx.push({ comp: p.role === '青训' ? 'youth' : 'league', round: p.role === '青训' ? 'U19' : `第${i + 1}周`, oppId: opps[i % opps.length].id, home: i % 2 === 0 });
  }
  if (p.role !== '青训') {
    if (CUP_ROUND[m] && g.cupAlive) fx.splice(1, 0, { comp: 'cup', round: CUP_ROUND[m], oppId: pick(leagueClubs).id, home: rand() < 0.5 });
    if (CONT_ROUND[m] && g.contAlive) fx.splice(2, 0, { comp: 'cont', round: CONT_ROUND[m], oppId: pick(contPool(club)).id, home: rand() < 0.5 });
  }
  g.fixtures = fx;
}

// ---------- 训练 ----------
const ageFactor = (a: number) => (a <= 18 ? 1.5 : a <= 21 ? 1.25 : a <= 24 ? 1 : a <= 27 ? 0.7 : a <= 29 ? 0.45 : a <= 31 ? 0.2 : 0.05);

function train(g: Game, notes: Note[]) {
  const p = g.player, club = clubById(p.clubId), plan = g.plan.train;
  const gap = Math.max(0, p.potential - ovr(p));
  const base = 1.2 * ageFactor(p.age) * clamp(gap / 15, 0.08, 1.3) * (0.8 + club.rep / 250)
    * (p.owned.includes('trainer') ? 1.15 : 1) * (0.8 + p.morale / 250) * (p.injury > 0 ? 0.3 : 1);
  const add = (k: AttrKey, v: number) => { p.attrs[k] = clamp(p.attrs[k] + v, 15, 99); };
  if (plan === 'rest') {
    p.fitness += 22; p.morale += 3;
    ATTR_KEYS.forEach(k => add(k, base * 0.05));
    notes.push({ text: '本月以休息恢复为主，体能大幅回升。', kind: 'info' });
  } else if (plan === 'intense') {
    ATTR_KEYS.forEach(k => add(k, base * (0.45 + rand() * 0.2)));
    p.fitness -= 14;
    notes.push({ text: '高强度加练！全面提升，但身体很疲惫。', kind: 'info' });
  } else if (plan === 'balanced') {
    ATTR_KEYS.forEach(k => add(k, base * (0.28 + rand() * 0.15)));
  } else {
    add(plan, base * (1.2 + rand() * 0.6));
    ATTR_KEYS.filter(k => k !== plan).forEach(k => add(k, base * 0.1 * rand()));
  }
  // 30 岁后衰退
  if (p.age >= 30) {
    const d = (p.age - 29) * 0.11;
    add('pace', -d * (0.6 + rand())); add('physical', -d * (0.4 + rand() * 0.8));
    if (p.age >= 33) ATTR_KEYS.forEach(k => add(k, -0.05 * (p.age - 32) * rand()));
  }
}

// ---------- 比赛 ----------
function levels(g: Game, f: Fixture) {
  const club = clubById(g.player.clubId), opp = clubById(f.oppId), youth = f.comp === 'youth';
  return { myLevel: youth ? club.level - 14 : club.level, oppLevel: (youth ? opp.level - 14 : opp.level) + (f.comp === 'cont' ? 2 : 0) };
}

function selection(g: Game, f: Fixture): { played: MatchResult['played']; minutes: number } {
  const p = g.player;
  if (p.injury > 0) return { played: 'out', minutes: 0 };
  if (f.comp === 'youth') return { played: 'start', minutes: 90 };
  const styleBonus = g.coach.style === '青春风暴' && p.age <= 22 ? 0.08 : g.coach.style === '信任老将' && p.age >= 29 ? 0.08 : 0;
  const start = { 青训: 0, 替补: 0.15, 轮换: 0.5, 主力: 0.85, 核心: 0.96 }[p.role] + (p.coachRel - 50) / 250 - (p.fitness < 40 ? 0.35 : 0) + (f.comp === 'cup' ? 0.15 : 0) + styleBonus;
  const sub = { 青训: 0, 替补: 0.45, 轮换: 0.35, 主力: 0.12, 核心: 0.04 }[p.role];
  const r = rand();
  if (r < start) return { played: 'start', minutes: rand() < 0.75 ? 90 : ri(60, 85) };
  if (r < start + sub) return { played: 'sub', minutes: ri(12, 35) };
  return { played: 'bench', minutes: 0 };
}

function strength(g: Game, f: Fixture, minutes: number) {
  const p = g.player, o = ovr(p), { myLevel, oppLevel } = levels(g, f);
  const myStr = myLevel + (minutes ? (o - myLevel) * 0.25 * minutes / 90 : 0) + (f.home ? 2 : 0) + (p.morale - 60) / 40;
  return { myStr, oppLevel, myLevel, d: (myStr - oppLevel) / 24 };
}

/** 你未出场时的比赛结果（固定为未入选/伤停） */
export function benchResult(g: Game, idx: number, played: 'bench' | 'out'): MatchResult {
  return playMatch(g, g.fixtures[idx], { played, minutes: 0 });
}

function playMatch(g: Game, f: Fixture, forced?: { played: MatchResult['played']; minutes: number }): MatchResult {
  const p = g.player, o = ovr(p);
  const { myLevel, oppLevel } = levels(g, f);
  const { played, minutes } = forced ?? selection(g, f);
  const share = minutes / 90;
  const { myStr, d } = strength(g, f, minutes);
  const gf = poisson(clamp(1.35 * Math.exp(d), 0.3, 3.6));
  const ga = poisson(clamp(1.35 * Math.exp(-d), 0.3, 3.6));

  let goals = 0, assists = 0;
  if (minutes) {
    const q = clamp(1 + (o - myLevel) / 22, 0.4, 1.8);
    const pi = POS_INFO[p.pos];
    for (let i = 0; i < gf; i++) {
      if (rand() < pi.goal * q * share * (0.55 + p.attrs.shooting / 160)) goals++;
      else if (rand() < pi.assist * q * share * (0.55 + p.attrs.passing / 160)) assists++;
    }
  }
  let rating = 0;
  if (minutes) {
    rating = 6.3 + (gf - ga) * 0.22 + goals * 0.85 + assists * 0.55 + (o - oppLevel) / 14 + gauss() * 0.55
      - (p.fitness < 55 ? (55 - p.fitness) / 30 : 0);
    if (p.pos === 'CB' || p.pos === 'CM') rating += ga === 0 ? 0.45 : -ga * 0.12;
    if (played === 'sub') rating = 6.3 + (rating - 6.3) * 0.6;
    rating = Math.round(clamp(rating, 3.5, 10) * 10) / 10;
  }
  const res: MatchResult = { ...f, gf, ga, played, minutes, goals, assists, rating };
  const knockout = (f.comp === 'cup') || (f.comp === 'cont' && f.round !== '小组赛');
  if (knockout && gf === ga) res.pen = rand() < 0.5 + (myStr - oppLevel) / 80 ? 'W' : 'L';
  wear(g, minutes);
  return res;
}

function wear(g: Game, minutes: number) {
  const p = g.player;
  p.fitness -= minutes / 90 * 7;
  if (minutes && rand() < (0.015 + (p.fitness < 40 ? 0.05 : 0) + (g.plan.train === 'intense' ? 0.02 : 0)) * (p.owned.includes('cryo') ? 0.6 : 1)) {
    p.injury = ri(1, 3);
  }
}

// ---------- 实时比赛 ----------
const isKnockout = (f: Fixture) => f.comp === 'cup' || (f.comp === 'cont' && f.round !== '小组赛');

/** 本月焦点战：淘汰赛 > 洲际 > 杯赛 > 同城德比 > 最强对手 */
export function focusIndex(g: Game): number {
  if (!g.fixtures.length) return -1;
  const city = clubById(g.player.clubId).city;
  const score = (f: Fixture) => (isKnockout(f) ? 100 : 0) + (f.round === '决赛' ? 100 : 0) + (f.comp === 'cont' ? 40 : 0) + (f.comp === 'cup' ? 20 : 0)
    + (clubById(f.oppId).city === city ? 60 : 0) + clubById(f.oppId).level;
  let best = 0;
  g.fixtures.forEach((f, i) => { if (score(f) > score(g.fixtures[best])) best = i; });
  return best;
}

export const isDerby = (g: Game, f: Fixture) => f.comp !== 'intl' && f.comp !== 'tour' && clubById(f.oppId).city === clubById(g.player.clubId).city;

const CHANCE_POOL: Record<Pos, ChanceKind[]> = {
  ST: ['box', 'box', 'box', 'header', 'long', 'dribble', 'pass'],
  WG: ['dribble', 'dribble', 'box', 'pass', 'long', 'box'],
  AM: ['pass', 'pass', 'long', 'box', 'dribble', 'freekick'],
  CM: ['pass', 'long', 'defend', 'pass', 'box'],
  CB: ['defend', 'header', 'defend', 'pass'],
};

/** 为实时比赛预演：决定首发/替补、队友进球、对手进球、你的机会 */
export function planLive(g: Game, idx: number): LivePlan | { played: 'bench' | 'out' } {
  const f = g.fixtures[idx], p = g.player;
  const sel = selection(g, f);
  if (sel.played === 'bench' || sel.played === 'out') return { played: sel.played };
  const minutes = sel.played === 'sub' ? sel.minutes : 90;
  const onMin = sel.played === 'sub' ? 90 - minutes : 0;
  const { d } = strength(g, f, minutes);
  const pmin = () => ri(onMin + 2, 89);
  const teamGoals = Array.from({ length: poisson(clamp(1.35 * Math.exp(d), 0.3, 3.6) * 0.62) }, () => ri(3, 89));
  const oppGoals = Array.from({ length: poisson(clamp(1.35 * Math.exp(-d), 0.3, 3.6)) }, () => {
    const min = ri(3, 89);
    return { min, defend: min > onMin && rand() < (p.pos === 'CB' ? 0.8 : p.pos === 'CM' ? 0.55 : 0.2) };
  });
  const nChances = Math.max(1, Math.round((p.pos === 'CB' ? 3 : 4) * minutes / 90 + (rand() < 0.5 ? 1 : 0)));
  const chances = Array.from({ length: nChances }, () => ({ min: pmin(), kind: (rand() < 0.1 ? 'freekick' : pick(CHANCE_POOL[p.pos])) as ChanceKind }));
  return { f, idx, played: sel.played, minutes, onMin, teamGoals, oppGoals, chances };
}

export function resolveLive(g: Game, plan: LivePlan, out: LiveOutcome): MatchResult {
  const f = plan.f;
  const gf = plan.teamGoals.length + out.goals + out.assists;
  const ga = Math.max(0, plan.oppGoals.length - out.prevented);
  let rating = 6.2 + out.goals * 0.9 + out.assists * 0.6 + out.prevented * 0.45 + out.ratingAdj + (gf - ga) * 0.2 + gauss() * 0.2
    - (g.player.fitness < 55 ? (55 - g.player.fitness) / 30 : 0);
  if (plan.played === 'sub') rating = 6.3 + (rating - 6.3) * 0.7;
  rating = Math.round(clamp(rating, 3.5, 10) * 10) / 10;
  const res: MatchResult = { ...f, gf, ga, played: plan.played, minutes: plan.minutes, goals: out.goals, assists: out.assists, rating };
  if (isKnockout(f) && gf === ga) res.pen = out.pen ?? (rand() < 0.5 ? 'W' : 'L');
  wear(g, plan.minutes);
  return res;
}

export const needsShootout = (plan: LivePlan, out: Omit<LiveOutcome, 'pen'>) =>
  isKnockout(plan.f) && plan.teamGoals.length + out.goals + out.assists === Math.max(0, plan.oppGoals.length - out.prevented);

function recordStats(g: Game, r: MatchResult) {
  const s = g.player.season;
  if (!r.minutes || r.comp === 'intl' || r.comp === 'tour') return;
  s.apps++; s.goals += r.goals; s.assists += r.assists; s.ratingSum += r.rating; s.rated++;
  if (r.comp === 'league') s.leagueGoals += r.goals;
  g.player.fame += r.goals * 0.25 + r.assists * 0.12 + (r.rating >= 8.5 ? 0.6 : 0);
}

const won = (r: MatchResult) => r.gf > r.ga || r.pen === 'W';

function afterCompMatch(g: Game, r: MatchResult, notes: Note[]) {
  const club = clubById(g.player.clubId), lg = leagueById(club.league), season = seasonOf(g);
  if (r.comp === 'cup') {
    if (!won(r)) { g.cupAlive = false; notes.push({ text: `${lg.cup}${r.round}出局。`, kind: 'bad' }); }
    else if (r.round === '决赛') { g.cupWon = true; if (g.player.season.apps) addTrophy(g, `${lg.cup}冠军`, 'cup', season); }
  }
  if (r.comp === 'cont') {
    if (r.round === '小组赛') {
      g.contGroupPts += r.gf > r.ga ? 3 : r.gf === r.ga ? 1 : 0;
      if (g.month === 12) {
        g.contAlive = g.contGroupPts + ri(2, 6) >= 8;
        notes.push({ text: g.contAlive ? `${lg.cont}小组出线！` : `${lg.cont}小组赛遗憾出局。`, kind: g.contAlive ? 'good' : 'bad' });
      }
    } else if (!won(r)) { g.contAlive = false; notes.push({ text: `${lg.cont}${r.round}被淘汰。`, kind: 'bad' }); }
    else if (r.round === '决赛') { g.contWon = true; if (g.player.season.apps) addTrophy(g, `${lg.cont}冠军`, 'cont', season); }
  }
}

// ---------- 国家队 ----------
function calledUp(p: Player): boolean {
  const n = nationById(p.nation);
  return p.injury === 0 && ovr(p) + p.fame / 25 >= n.strength - 7 && p.age >= 17;
}

function playIntl(g: Game, round: string, oppNation: Nation, comp: Comp): MatchResult {
  const p = g.player, n = nationById(p.nation), o = ovr(p);
  const my = n.strength + (o - n.strength) * 0.2, d = (my - oppNation.strength) / 20;
  const gf = poisson(clamp(1.3 * Math.exp(d), 0.2, 4)), ga = poisson(clamp(1.3 * Math.exp(-d), 0.2, 4));
  const start = o >= n.strength - 2 ? 0.9 : 0.5;
  const minutes = rand() < start ? 90 : ri(15, 30);
  let goals = 0, assists = 0;
  const q = clamp(1 + (o - n.strength) / 18, 0.4, 2.2) * minutes / 90;
  for (let i = 0; i < gf; i++) {
    if (rand() < POS_INFO[p.pos].goal * q) goals++; else if (rand() < POS_INFO[p.pos].assist * q) assists++;
  }
  const rating = Math.round(clamp(6.4 + (gf - ga) * 0.2 + goals * 0.9 + assists * 0.5 + gauss() * 0.5, 4, 10) * 10) / 10;
  p.caps++; p.intlGoals += goals; p.fame += 0.6 + goals * 0.6;
  const r: MatchResult = { comp, round, oppId: oppNation.id, home: true, gf, ga, played: minutes === 90 ? 'start' : 'sub', minutes, goals, assists, rating };
  if (round !== '小组赛' && round !== '友谊赛' && round !== '预选赛' && gf === ga) r.pen = rand() < 0.5 + d / 5 ? 'W' : 'L';
  return r;
}

function runTournament(g: Game, notes: Note[]): { name: string; results: MatchResult[]; champion: boolean } | null {
  const p = g.player, n = nationById(p.nation);
  if (g.year % 2 !== 0) return null;
  const name = g.year % 4 === 2 ? '世界杯' : n.cup;
  if (!calledUp(p)) { notes.push({ text: `${g.year}年${name}开打，你未能入选国家队大名单。`, kind: 'bad' }); return null; }
  const pool = NATIONS.filter(x => x.id !== n.id && (name === '世界杯' || x.cup === n.cup || (n.cup === '美洲杯' ? false : x.cup === n.cup)));
  const rivals = pool.length >= 3 ? pool : NATIONS.filter(x => x.id !== n.id);
  const results: MatchResult[] = [];
  let pts = 0;
  for (let i = 0; i < 3; i++) {
    const r = playIntl(g, '小组赛', pick(rivals), 'tour'); results.push(r);
    pts += r.gf > r.ga ? 3 : r.gf === r.ga ? 1 : 0;
  }
  let champion = false;
  if (pts >= 4 || (pts === 3 && rand() < 0.5)) {
    const rounds = name === '世界杯' ? ['16强', '8强', '半决赛', '决赛'] : ['8强', '半决赛', '决赛'];
    for (const rd of rounds) {
      const r = playIntl(g, rd, pick(NATIONS.filter(x => x.id !== n.id && x.strength >= (rd === '决赛' ? 84 : 70))), 'tour');
      results.push(r);
      if (!won(r)) { notes.push({ text: `${name}${rd}止步。`, kind: 'bad' }); break; }
      if (rd === '决赛') champion = true;
    }
  } else notes.push({ text: `${name}小组赛出局。`, kind: 'bad' });
  if (champion) { addTrophy(g, `${g.year}${name}冠军`, 'intl', g.year - 1); p.fame += name === '世界杯' ? 15 : 8; }
  return { name, results, champion };
}

// ---------- 赛季结算 ----------
export interface SeasonSummary { season: number; rank: number; trophies: string[]; goldenBoot: boolean; aiTop: number; stats: SeasonStats }
export interface AwardInfo { ranking: { name: string; score: number; me?: boolean }[]; myRank: number; won: string[]; season: number }

function endSeason(g: Game, notes: Note[]): SeasonSummary {
  const p = g.player, club = clubById(p.clubId), lg = leagueById(club.league), season = seasonOf(g);
  const table = sortedTable(g);
  const rank = table.findIndex(r => r.clubId === club.id) + 1;
  const trophies: string[] = [];
  if (rank === 1 && p.role !== '青训') { addTrophy(g, `${lg.short}冠军`, 'league', season); trophies.push(`${lg.short}冠军`); p.fame += 5; }
  if (g.cupWon) trophies.push(`${lg.cup}冠军`);
  if (g.contWon) { trophies.push(`${lg.cont}冠军`); p.fame += 8; }
  const aiTop = Math.round(14 + lg.strength / 8 + rand() * 9);
  const goldenBoot = p.season.leagueGoals > aiTop;
  if (goldenBoot) { addTrophy(g, `${lg.short}金靴奖`, 'boot', season); trophies.push(`${lg.short}金靴`); p.fame += 4; }
  if (!p.season.youth && p.season.rated >= 20 && avgRating(p.season) >= 7.55 && rand() < 0.7) {
    addTrophy(g, `${lg.short}赛季最佳球员`, 'poty', season); trophies.push(`${lg.short}最佳球员`);
  }
  notes.push({ text: `${seasonLabel(season)}赛季结束，${club.name}联赛排名第${rank}。`, kind: rank <= 3 ? 'good' : 'info' });
  const stats = { ...p.season };
  p.career.push(stats);
  return { season, rank, trophies, goldenBoot, aiTop, stats };
}

function computeAwards(g: Game): AwardInfo {
  const p = g.player, season = g.year - 1;
  const ss = p.career.filter(s => s.season === season && !s.youth);
  const apps = ss.reduce((a, s) => a + s.apps, 0), goals = ss.reduce((a, s) => a + s.goals, 0), assists = ss.reduce((a, s) => a + s.assists, 0);
  const rs = ss.reduce((a, s) => a + s.ratingSum, 0), rated = ss.reduce((a, s) => a + s.rated, 0);
  const avg = rated ? rs / rated : 0;
  const tw = p.trophies.filter(t => t.season === season).reduce((a, t) => a + (({ league: 10, cup: 4, cont: 16, intl: 16, boot: 6, poty: 6 } as Record<string, number>)[t.kind] ?? 0), 0);
  const club = clubById(p.clubId);
  const score = apps < 15 ? 0 : Math.round((avg - 6) * 26 + Math.min(goals, 55) * 0.9 + Math.min(assists, 25) * 0.7 + tw + club.rep * 0.2 + p.fame * 0.12);
  const rivals: { name: string; score: number; me?: boolean }[] = shuffle([...RIVAL_NAMES]).slice(0, 29).map((name, i) => ({ name, score: Math.round(i === 0 ? 122 + gauss() * 10 : i < 4 ? 98 + rand() * 20 : 50 + rand() * 48) }));
  const ranking = [...rivals, { name: p.name, score, me: true }].sort((a, b) => b.score - a.score);
  const myRank = ranking.findIndex(r => r.me) + 1;
  const won: string[] = [];
  if (myRank === 1) { addTrophy(g, `${g.year - 1}年金球奖`, 'ballon', season); won.push('金球奖'); p.fame += 20; }
  if (p.age <= 22 && !p.trophies.some(t => t.kind === 'young') && score > 70 + rand() * 20) { addTrophy(g, `${season}年度最佳新秀`, 'young', season); won.push('最佳新秀'); p.fame += 5; }
  if (myRank <= 11 && score > 0) { addTrophy(g, `${season}年度最佳阵容`, 'tots', season); won.push('年度最佳阵容'); }
  if (score > 0 && myRank <= 30) log(g, `金球奖评选：你排名第 ${myRank} 位。`, myRank <= 3 ? 'gold' : 'info');
  return { ranking: ranking.slice(0, 10).concat(myRank > 10 && score > 0 ? [ranking[myRank - 1]] : []), myRank: score > 0 ? myRank : 0, won, season };
}

// ---------- 转会 ----------
export function generateOffers(g: Game, window: 'summer' | 'winter'): Offer[] {
  const p = g.player, o = ovr(p), cur = clubById(p.clubId);
  const perf = p.season.rated ? avgRating(p.season) - 6.8 : 0;
  const offers: Offer[] = [];
  const candidates = shuffle(CLUBS.filter(c => c.league !== 'ASI' && c.id !== cur.id && o >= c.level - 9 - perf * 3 - g.offerBoost && o <= c.level + 10));
  const max = window === 'summer' ? 2 + Math.floor(p.fame / 25) + g.offerBoost : rand() < 0.5 + g.offerBoost * 0.2 ? 1 : 0;
  const expiring = p.contractEnd <= g.year;
  for (const c of candidates) {
    if (offers.length >= Math.min(max, 5)) break;
    if (rand() > 0.35 + p.fame / 200 + (expiring ? 0.3 : 0)) continue;
    offers.push(makeOffer(g, c, expiring));
  }
  if (window === 'summer' && p.contractEnd - g.year <= 1 && o >= cur.level - 10 && p.age < 38) {
    offers.unshift({ ...makeOffer(g, cur, false), fee: 0, renewal: true });
  }
  if (expiring && offers.length === 0 && p.age < 38) {
    const low = CLUBS.filter(c => c.league !== 'ASI' && c.level <= o + 3).sort((a, b) => b.level - a.level).slice(0, 6);
    const pool = low.length ? low : [...CLUBS].filter(c => c.league !== 'ASI').sort((a, b) => a.level - b.level).slice(0, 3);
    offers.push(makeOffer(g, pick(pool), true));
  }
  g.offerBoost = 0;
  return offers;
}

function makeOffer(g: Game, c: Club, free: boolean): Offer {
  const p = g.player, o = ovr(p);
  const role = roleFor(o, c.level, 55);
  return {
    clubId: c.id, role,
    wage: Math.round(baseWage(o, c) * (1 + rand() * 0.35) * (role === '核心' ? 1.25 : 1) / 100) * 100,
    years: p.age >= 32 ? ri(1, 2) : ri(2, 5),
    fee: free ? 0 : Math.round(marketValue(p) * (0.85 + rand() * 0.5) / 100_000) * 100_000,
  };
}

export function acceptOffer(g: Game, off: Offer) {
  const p = g.player, club = clubById(off.clubId);
  p.contractEnd = seasonOf(g) + off.years;
  p.wage = off.wage;
  if (off.renewal) {
    p.coachRel += 5; p.morale += 5;
    log(g, `与${club.name}续约至 ${p.contractEnd} 年，月薪 ${fmtMoney(off.wage)}。`, 'good');
    return;
  }
  const oldLeague = clubById(p.clubId).league;
  if (p.season.apps > 0 || g.month !== 7) { p.career.push({ ...p.season }); }
  p.season = newSeason(seasonOf(g), club.id, false);
  p.clubId = club.id; p.role = off.role; p.coachRel = 55; p.morale += 10; p.fame += club.rep / 25; p.captain = false;
  p.number = rand() < 0.6 ? POS_INFO[p.pos].num : ri(2, 30);
  if (club.league !== oldLeague) {
    const played = g.month === 7 ? 0 : 19;
    resetTable(g, played);
  }
  if (g.month === 7) { g.contAlive = qualifiesCont(club); g.cupAlive = true; }
  else { g.contAlive = qualifiesCont(club) && rand() < 0.6; g.cupAlive = rand() < 0.5; g.contGroupPts = 0; }
  g.cupWon = false; g.contWon = false;
  newCoach(g, false);
  log(g, `✍️ 正式加盟 ${club.name}！转会费 ${fmtMoney(off.fee)}，月薪 ${fmtMoney(off.wage)}，合同至 ${p.contractEnd} 年。`, 'gold');
  prepareMonth(g);
}

export function retire(g: Game) {
  g.retired = true;
  if (g.player.season.apps > 0) g.player.career.push({ ...g.player.season });
  log(g, `${g.player.name} 在 ${g.player.age} 岁宣布退役。`, 'gold');
}

export function legendScore(p: Player): number {
  const apps = p.career.reduce((a, s) => a + s.apps, 0), goals = p.career.reduce((a, s) => a + s.goals, 0);
  const tw = p.trophies.reduce((a, t) => a + ({ ballon: 60, intl: 40, cont: 30, league: 15, cup: 6, boot: 10, poty: 10, young: 5, tots: 5 }[t.kind]), 0);
  return Math.round(apps * 0.2 + goals * 0.6 + tw + p.caps * 0.5 + p.fame * 0.5);
}

export function legendTitle(score: number): string {
  return score >= 2000 ? '👑 足球之神' : score >= 1300 ? '🌟 传奇巨星' : score >= 750 ? '⭐ 世界级球星' : score >= 380 ? '🏅 顶级球员' : score >= 150 ? '⚽ 职业球员' : '🙂 普通球员';
}

// ---------- 月度模拟 ----------
export interface Note { text: string; kind: 'good' | 'bad' | 'info' | 'gold' }
export interface MonthReport {
  y: number; m: number; results: MatchResult[]; notes: Note[];
  delta: Partial<Record<AttrKey, number>>; ovrBefore: number; ovrAfter: number;
  income: number; expense: number;
  highlight: HighlightType | null; highlightCaption: string; highlightOpp: [string, string]; highlightTeam: [string, string];
  season?: SeasonSummary; awards?: AwardInfo; tournament?: { name: string; results: MatchResult[]; champion: boolean } | null;
  offers: Offer[]; forced: boolean; eventId?: string; promoted?: boolean;
}

function lifestyle(g: Game, notes: Note[]): number {
  const p = g.player;
  switch (g.plan.life) {
    case 'focus': p.coachRel += 1.5; p.morale -= 1; return 0;
    case 'social': p.fame += 1.5; p.coachRel -= 0.5; return 0;
    case 'relax': p.morale += 5; return Math.round(p.wage * 0.08 + 500);
    case 'party':
      p.morale += 8; p.fitness -= 8; p.fame += 0.8;
      if (rand() < 0.15) { p.fame -= 3; p.coachRel -= 8; notes.push({ text: '📸 深夜泡吧被狗仔拍到，教练很不满！', kind: 'bad' }); }
      return Math.round(p.wage * 0.15 + 1_000);
    case 'charity': p.fame += 1; p.morale += 2; return Math.round(p.money * 0.01 + 300);
  }
}

export function simulateMonth(g: Game, pickEvent: (g: Game) => string | undefined, live?: { idx: number; result: MatchResult }): MonthReport {
  const p = g.player;
  const before = { ...p.attrs }, ovrBefore = ovr(p);
  const notes: Note[] = [];
  const results: MatchResult[] = [];
  const rep: MonthReport = { y: g.year, m: g.month, results, notes, delta: {}, ovrBefore, ovrAfter: ovrBefore, income: 0, expense: 0, highlight: null, highlightCaption: '', highlightOpp: ['#ffffff', '#222222'], highlightTeam: clubById(p.clubId).colors, offers: [], forced: false };

  if (p.injury > 0) { p.injury--; notes.push({ text: p.injury ? `🩹 伤病恢复中，还需 ${p.injury} 个月。` : '🩹 伤愈复出！', kind: p.injury ? 'bad' : 'good' }); }
  train(g, notes);
  const wasInjured = p.injury;

  // 联赛 / 杯赛 / 洲际
  for (const [i, f] of g.fixtures.entries()) {
    const r = live && live.idx === i ? live.result : playMatch(g, f);
    if (r.minutes && r.rating >= 8.3 && r.comp !== 'youth') p.motm++;
    results.push(r);
    recordStats(g, r);
    if (f.comp === 'league') {
      applyResult(g.table.find(t => t.clubId === p.clubId), r.gf, r.ga);
      applyResult(g.table.find(t => t.clubId === f.oppId), r.ga, r.gf);
      simulateRound(g, [p.clubId, f.oppId]);
    } else if (f.comp === 'youth') {
      simulateRound(g, null);
    } else afterCompMatch(g, r, notes);
  }
  if (!wasInjured && p.injury) notes.push({ text: `😣 比赛中受伤，预计缺阵 ${p.injury} 个月。`, kind: 'bad' });

  // 国家队
  if (INTL_MONTHS.includes(g.month) && p.role !== '青训') {
    if (calledUp(p)) {
      const n = nationById(p.nation);
      const r = playIntl(g, g.year % 2 === 1 ? '预选赛' : '友谊赛', pick(NATIONS.filter(x => x.id !== n.id)), 'intl');
      results.push(r);
      if (p.caps === 1) notes.push({ text: `🎉 首次入选${n.name}国家队并完成国家队首秀！`, kind: 'gold' });
    }
  }

  // 月度状态结算
  const played = results.filter(r => r.minutes && r.comp !== 'intl');
  const avg = played.length ? played.reduce((a, r) => a + r.rating, 0) / played.length : 0;
  if (played.length) { p.coachRel += (avg - 6.6) * 3; p.morale += (avg - 6.7) * 4; }
  else if (!p.injury && p.role !== '青训' && g.fixtures.length) { p.morale -= 4; notes.push({ text: '整个月都坐在板凳上，你有些失落。', kind: 'bad' }); }
  p.fitness += 20 + (p.owned.includes('chef') ? 6 : 0);
  if (p.fame > 20) p.fame -= 0.25;
  p.morale += (60 - p.morale) * 0.08;

  rep.income = p.wage;
  rep.expense = lifestyle(g, notes);
  p.money += rep.income - rep.expense;

  // 角色变化
  const club = clubById(p.clubId);
  const o = ovr(p);
  if (p.role === '青训') {
    if (o >= club.level - 9 || (o >= club.level - 13 && avg >= 7.6 && rand() < 0.35)) {
      p.role = '替补'; p.wage = Math.max(p.wage, baseWage(o, club)); p.number = ri(13, 40);
      notes.push({ text: `🚀 你被提拔进 ${club.name} 一线队！`, kind: 'gold' }); rep.promoted = true;
      log(g, `被提拔进 ${club.name} 一线队，身披 ${p.number} 号。`, 'gold');
    }
  } else if (!p.injury) {
    const nr = roleFor(o, club.level, p.coachRel);
    if (nr !== p.role) {
      const order = ['替补', '轮换', '主力', '核心'];
      const up = order.indexOf(nr) > order.indexOf(p.role);
      notes.push({ text: up ? `📈 教练提升了你的地位：${p.role} → ${nr}` : `📉 你在队内的地位下降：${p.role} → ${nr}`, kind: up ? 'good' : 'bad' });
      p.role = nr;
      if (up && nr === '核心') log(g, `成为 ${club.name} 的绝对核心！`, 'gold');
    }
  }

  // 集锦
  const best = [...results].filter(r => r.minutes).sort((a, b) => (b.goals * 3 + b.assists * 2 + b.rating) - (a.goals * 3 + a.assists * 2 + a.rating))[0];
  if (best) {
    const intl = best.comp === 'intl' || best.comp === 'tour';
    const oppName = intl ? nationById(best.oppId).name : clubById(best.oppId).name;
    rep.highlightOpp = intl ? nationById(best.oppId).colors : clubById(best.oppId).colors;
    if (intl) rep.highlightTeam = nationById(p.nation).colors;
    if (best.goals) {
      rep.highlight = p.pos === 'CB' ? 'header' : rand() < 0.18 ? 'freekick' : p.attrs.shooting > 72 && rand() < 0.35 ? 'longshot' : 'goal';
      rep.highlightCaption = `对阵${oppName}：${p.name}${best.goals >= 3 ? '上演帽子戏法' : best.goals === 2 ? '梅开二度' : '破门得分'}！`;
    } else if (best.assists) { rep.highlight = 'assist'; rep.highlightCaption = `对阵${oppName}：${p.name}送出精妙助攻！`; }
    else { rep.highlight = p.pos === 'CB' || p.pos === 'CM' ? 'tackle' : 'assist'; rep.highlightCaption = p.pos === 'CB' || p.pos === 'CM' ? `对阵${oppName}：${p.name}关键拦截！` : `对阵${oppName}：${p.name}的精彩配合`; }
  }

  // 赛季节点
  if (g.month === 5) rep.season = endSeason(g, notes);
  if (g.month === 6) {
    rep.tournament = runTournament(g, notes);
    rep.awards = computeAwards(g);
    rep.offers = generateOffers(g, 'summer');
    rep.forced = p.contractEnd <= g.year;
  }
  if (g.month === 12) rep.offers = generateOffers(g, 'winter');

  for (const k of Object.keys(p.attrs) as AttrKey[]) {
    const d = p.attrs[k] - before[k];
    if (Math.abs(d) >= 0.05) rep.delta[k] = d;
  }
  p.fitness = clamp(p.fitness, 5, 100); p.morale = clamp(p.morale, 0, 100);
  p.fame = clamp(p.fame, 0, 100); p.coachRel = clamp(p.coachRel, 0, 100);
  rep.ovrAfter = ovr(p);
  if (rep.ovrAfter > ovrBefore) notes.unshift({ text: `综合能力提升：${ovrBefore} → ${rep.ovrAfter}`, kind: 'good' });
  else if (rep.ovrAfter < ovrBefore) notes.unshift({ text: `综合能力下降：${ovrBefore} → ${rep.ovrAfter}`, kind: 'bad' });

  rep.eventId = pickEvent(g);

  // 推进到下个月
  g.month++;
  if (g.month > 12) { g.month = 1; g.year++; }
  if (g.month === 7) startNewSeason(g);
  g.lifeActs = [];
  if (p.partner && !p.partner.married) p.partner.love = clamp(p.partner.love - 2, 0, 100);
  pushHistory(g);
  prepareMonth(g);
  return rep;
}

function startNewSeason(g: Game) {
  const p = g.player, club = clubById(p.clubId);
  p.age++;
  p.season = newSeason(g.year, p.clubId, p.role === '青训');
  g.cupAlive = true; g.cupWon = false; g.contWon = false; g.contGroupPts = 0;
  g.contAlive = p.role !== '青训' && qualifiesCont(club);
  resetTable(g, 0);
  if (rand() < 0.2) newCoach(g, true);
  log(g, `${seasonLabel(g.year)} 赛季开始，${p.age} 岁的你继续征战${club.name}。`, 'info');
}

function pushHistory(g: Game) {
  const p = g.player;
  p.history.push({ label: `${String(g.year).slice(2)}.${g.month}`, ovr: ovr(p), value: marketValue(p) });
}

export function mustRetire(g: Game) { return g.player.age >= 40; }

export type { Trophy };

// ---------- 主教练 ----------
export function newCoach(g: Game, announce: boolean) {
  const p = g.player, st = pick(COACH_STYLES);
  const name = pick(COACH_NAMES.filter(n => n !== g.coach.name));
  let rel = ri(st.rel[0], st.rel[1]);
  if (st.young) rel += p.age <= 22 ? 10 : p.age >= 31 ? -12 : 0;
  if (st.old) rel += p.age >= 29 ? 10 : p.age <= 21 ? -10 : 0;
  const coach: Coach = { name, style: st.style, desc: st.desc };
  g.coach = coach;
  if (announce) {
    p.coachRel = clamp(rel, 0, 100);
    log(g, `🧑‍💼 ${clubById(p.clubId).name}换帅！新主帅${name}（${st.style}）：${st.desc}。他对你的信任度为 ${Math.round(p.coachRel)}。`, rel >= 60 ? 'good' : 'bad');
  }
}

// ---------- 经纪人 / 办公室 ----------
export function askRaise(g: Game): { ok: boolean; text: string } {
  const p = g.player, club = clubById(p.clubId), s = seasonOf(g);
  if (p.raiseSeason === s) return { ok: false, text: '本赛季已经谈过加薪了，用表现说话，下赛季再来吧。' };
  p.raiseSeason = s;
  const avg = p.season.rated ? avgRating(p.season) : 6.5;
  const fair = baseWage(ovr(p), club);
  if (p.wage < fair * 0.95 && avg >= 6.8 && rand() < 0.8) {
    const nw = Math.round(fair * (1 + rand() * 0.2) / 100) * 100;
    const t = `俱乐部同意加薪！月薪从 ${fmtMoney(p.wage)} 涨到 ${fmtMoney(nw)}。`;
    p.wage = nw; p.morale = clamp(p.morale + 6, 0, 100); log(g, `💰 ${t}`, 'good');
    return { ok: true, text: t };
  }
  if (rand() < 0.3) { const inc = Math.round(p.wage * 0.08 / 100) * 100; p.wage += inc; return { ok: true, text: `体育总监勉强同意小幅加薪 ${fmtMoney(inc)}/月。` }; }
  p.morale = clamp(p.morale - 6, 0, 100); p.coachRel = clamp(p.coachRel - 2, 0, 100);
  return { ok: false, text: '体育总监拒绝了你的要求：“你的薪水已经和你的表现匹配了。”' };
}

export function askPlaytime(g: Game): { ok: boolean; text: string } {
  const p = g.player, club = clubById(p.clubId), s = seasonOf(g);
  if (p.role === '青训') return { ok: false, text: '你还在青训营，主教练让你先证明自己配得上一线队。' };
  if (p.role === '核心') return { ok: false, text: '你已经是球队绝对核心了！' };
  if (p.talkSeason === s) return { ok: false, text: `${g.coach.name}：“我们这赛季已经谈过了。”` };
  p.talkSeason = s;
  const d = ovr(p) - club.level + (p.coachRel - 50) / 10;
  if (d > -3 && rand() < 0.65) {
    const order = ['替补', '轮换', '主力', '核心'] as const;
    const nr = order[Math.min(3, order.indexOf(p.role as typeof order[number]) + 1)];
    p.role = nr; p.coachRel = clamp(p.coachRel + 3, 0, 100);
    log(g, `🗣️ 与${g.coach.name}谈话后，你的地位提升为「${nr}」。`, 'good');
    return { ok: true, text: `${g.coach.name}点点头：“好，我会给你更多机会。”你的地位提升为「${nr}」。` };
  }
  p.coachRel = clamp(p.coachRel - 8, 0, 100); p.morale = clamp(p.morale - 4, 0, 100);
  return { ok: false, text: `${g.coach.name}皱起眉头：“想要出场时间？先在训练里证明你自己。”教练关系 -8` };
}

export function requestListing(g: Game): string {
  const p = g.player;
  g.offerBoost += 2; p.coachRel = clamp(p.coachRel - 10, 0, 100); p.morale = clamp(p.morale - 2, 0, 100);
  log(g, '📤 你向俱乐部提交了转会申请。', 'bad');
  return '你正式提交了转会申请。下一个转会窗口（1月 / 7月）会有更多球队报价，但教练和球迷对你很不满。教练关系 -10';
}

// ---------- 生活 ----------
export function lifeAction(g: Game, act: string): string {
  const p = g.player;
  const once = (k: string) => { if (g.lifeActs.includes(k)) return false; g.lifeActs.push(k); return true; };
  const pay = (v: number) => { if (p.money < v) return false; p.money -= v; return true; };
  switch (act) {
    case 'date': {
      if (p.partner) return '你已经有伴侣了。';
      if (!once('date')) return '这个月已经参加过社交活动了。';
      if (!pay(3_000)) return '钱不够……';
      if (rand() < 0.45 + p.fame / 250) {
        const name = pick(PARTNER_NAMES);
        p.partner = { name, love: ri(40, 55), married: false }; p.morale = clamp(p.morale + 10, 0, 100);
        log(g, `❤️ 你和${name}开始交往了。`, 'good');
        return `你在一场慈善晚宴上认识了${name}，你们一见如故，开始交往了！士气 +10`;
      }
      return '你参加了几次聚会，但没有遇到心动的人。';
    }
    case 'gift': {
      if (!p.partner) return '你目前没有伴侣。';
      if (!once('gift')) return '这个月已经送过礼物了。';
      const cost = Math.max(2_000, Math.round(p.wage * 0.1));
      if (!pay(cost)) return '钱不够……';
      p.partner.love = clamp(p.partner.love + ri(8, 15), 0, 100); p.morale = clamp(p.morale + 3, 0, 100);
      return `你花了 ${fmtMoney(cost)} 给${p.partner.name}准备惊喜，TA非常开心！感情 ${Math.round(p.partner.love)}`;
    }
    case 'vacation': {
      if (!once('vacation')) return '这个月已经度过假了。';
      const cost = Math.max(5_000, Math.round(p.wage * 0.3));
      if (!pay(cost)) return '钱不够……';
      p.fitness = clamp(p.fitness + 18, 0, 100); p.morale = clamp(p.morale + 12, 0, 100);
      if (p.partner) p.partner.love = clamp(p.partner.love + 10, 0, 100);
      if (g.month !== 6 && g.month !== 7) p.coachRel = clamp(p.coachRel - 4, 0, 100);
      return `花费 ${fmtMoney(cost)} 去海岛放松了几天。体能 +18，士气 +12${g.month !== 6 && g.month !== 7 ? '（赛季中度假，教练有些不满）' : ''}`;
    }
    case 'propose': {
      if (!p.partner || p.partner.married) return '现在还不是时候。';
      if (p.partner.love < 70) return `${p.partner.name}觉得还太早了……先加深感情吧（需要感情 ≥ 70）。`;
      if (!pay(Math.max(20_000, Math.round(p.money * 0.05)))) return '连戒指都买不起……';
      if (rand() < 0.85) {
        p.partner.married = true; p.morale = 100; p.fame = clamp(p.fame + 5, 0, 100);
        log(g, `💍 你和${p.partner.name}结婚了！`, 'gold');
        return `你单膝跪地……${p.partner.name}含泪答应了！你们举办了一场盛大的婚礼。💒`;
      }
      p.partner.love -= 20; p.morale = clamp(p.morale - 15, 0, 100);
      return `${p.partner.name}犹豫了：“再给我一点时间……”士气 -15`;
    }
    case 'baby': {
      if (!p.partner?.married) return '先组建家庭吧。';
      if (p.kids >= 3) return '家里已经很热闹了。';
      if (!once('baby')) return '这个月已经有好消息了。';
      if (rand() < 0.5) {
        p.kids++; p.morale = 100;
        log(g, `👶 你的第 ${p.kids} 个孩子出生了！`, 'gold');
        return `恭喜！你的第 ${p.kids} 个孩子出生了！你决定下一个进球要做摇篮庆祝。👶`;
      }
      return '暂时还没有好消息，别着急。';
    }
  }
  return '';
}

export function migrate(g: Game): Game {
  const p = g.player as Player & Partial<Player>;
  p.partner ??= null; p.kids ??= 0; p.raiseSeason ??= 0; p.talkSeason ??= 0; p.motm ??= 0;
  g.lifeActs ??= [];
  if (!g.coach) { g.coach = { name: '', style: '', desc: '' }; newCoach(g, false); }
  return g;
}
