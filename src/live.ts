import { crestSVG } from './art';
import { sfx } from './audio';
import { clamp, clubById, COMP_NAME, needsShootout, pick, rand } from './engine';
import { playHighlight } from './match3d';
import type { ChanceKind, Game, HighlightType, LiveOutcome, LivePlan } from './types';

type Reward = 'goal' | 'assist' | 'prevent' | 'safe' | 'show';
interface Opt { label: string; rate: number; reward: Reward; tag?: string; fame?: number; hl?: HighlightType; win: string; lose: string; risk?: number }

const r = (v: number) => clamp(Math.round(v), 5, 95);

function optionsFor(g: Game, kind: ChanceKind, min: number, threat: boolean): { prompt: string; opts: Opt[] } {
  const a = g.player.attrs;
  const sh = a.shooting - 60, pa = a.passing - 60, dr = a.dribbling - 60, pc = a.pace - 60, df = a.defending - 60, ph = a.physical - 60;
  switch (kind) {
    case 'box': return {
      prompt: `⚡ ${min}' 你在禁区内得球，面前只剩门将！`,
      opts: [
        { label: '💥 大力抽射', tag: '高风险·高回报', rate: r(48 + sh * 0.7), reward: 'goal', fame: 2, hl: 'goal', win: '一脚势大力沉的抽射直挂死角！', lose: '抽射高出横梁……' },
        { label: '🎯 冷静推射远角', tag: '稳健', rate: r(58 + sh * 0.5), reward: 'goal', hl: 'goal', win: '冷静推射远角，皮球应声入网！', lose: '推射被门将神勇扑出！' },
        { label: '🌈 晃过门将', tag: '高人气', rate: r(40 + dr * 0.7 + sh * 0.2), reward: 'goal', fame: 3, hl: 'goal', win: '一个假动作晃倒门将，推射空门！', lose: '被门将封堵，机会溜走了。' },
        { label: '🤝 横传给队友', tag: '无私', rate: r(52 + pa * 0.6), reward: 'assist', hl: 'assist', win: '无私横传，队友轻松推射空门！', lose: '传球被后卫及时破坏。' },
      ],
    };
    case 'long': return {
      prompt: `🎯 ${min}' 你在禁区外 25 米处得球，面前有空当！`,
      opts: [
        { label: '🚀 直接远射', tag: '世界波？', rate: r(24 + sh * 0.7), reward: 'goal', fame: 4, hl: 'longshot', win: '一脚石破天惊的世界波！皮球直挂死角！', lose: '远射偏出立柱。' },
        { label: '🗡️ 直塞身后', rate: r(34 + pa * 0.7), reward: 'assist', hl: 'assist', win: '手术刀般的直塞！队友单刀破门！', lose: '直塞被对方后卫断下。' },
        { label: '🔁 分边转移', tag: '稳妥', rate: 95, reward: 'safe', win: '稳稳地把球分到边路，控制节奏。', lose: '' },
      ],
    };
    case 'pass': return {
      prompt: `🧭 ${min}' 你在中场拿球，队友正在前插！`,
      opts: [
        { label: '🗡️ 穿透直塞', rate: r(36 + pa * 0.75), reward: 'assist', hl: 'assist', win: '一脚穿透三人的直塞！队友推射得手！', lose: '直塞力量稍大，被门将没收。' },
        { label: '🎈 过顶长传', rate: r(30 + pa * 0.6 + ph * 0.1), reward: 'assist', hl: 'assist', win: '精准的过顶长传找到队友，头球破门！', lose: '长传稍长出了底线。' },
        { label: '🔁 回传控球', tag: '稳妥', rate: 95, reward: 'safe', win: '你冷静地组织，球队牢牢控制球权。', lose: '' },
      ],
    };
    case 'dribble': return {
      prompt: `🌀 ${min}' 你在边路一对一面对后卫！`,
      opts: [
        { label: '↩️ 内切射门', rate: r(34 + dr * 0.4 + sh * 0.4), reward: 'goal', hl: 'goal', win: '内切后一脚弧线球，皮球绕过门将飞入远角！', lose: '内切射门被门将扑出。' },
        { label: '⚡ 下底传中', rate: r(38 + pc * 0.4 + pa * 0.4), reward: 'assist', hl: 'assist', win: '一路狂奔下底传中，队友头球破门！', lose: '传中被中卫顶出。' },
        { label: '🚲 踩单车过人', tag: '高人气', rate: r(42 + dr * 0.7), reward: 'show', fame: 3, win: '连续踩单车晃倒后卫，全场惊呼！', lose: '花哨动作被断，球迷嘘声一片。' },
      ],
    };
    case 'header': return {
      prompt: `🎯 ${min}' 角球机会！你在禁区里寻找位置……`,
      opts: [
        { label: '🏃 抢前点', rate: r(34 + ph * 0.45 + sh * 0.2), reward: 'goal', hl: 'header', win: '你抢到前点，一记狠狠的头球砸进球门！', lose: '头球顶偏了。' },
        { label: '🦘 后点高高跃起', rate: r(30 + ph * 0.6), reward: 'goal', hl: 'header', win: '后点高高跃起，力压后卫头球破门！', lose: '起跳慢了半拍，被后卫解围。' },
        { label: '↪️ 头球摆渡', rate: r(38 + pa * 0.5), reward: 'assist', hl: 'assist', win: '头球摆渡，队友凌空抽射破门！', lose: '摆渡被门将没收。' },
      ],
    };
    case 'freekick': return {
      prompt: `🟢 ${min}' 禁区前沿获得任意球，你站在了球前！`,
      opts: [
        { label: '🌙 弧线绕过人墙', rate: r(20 + sh * 0.5 + pa * 0.3), reward: 'goal', fame: 3, hl: 'freekick', win: '一道完美的弧线！皮球越过人墙钻入死角！', lose: '任意球打在人墙上。' },
        { label: '💣 暴力轰门', rate: r(16 + sh * 0.6), reward: 'goal', fame: 3, hl: 'freekick', win: '一脚暴力任意球，门将来不及反应！', lose: '射门力量十足但偏出。' },
        { label: '🎯 传给包抄队友', rate: r(32 + pa * 0.5), reward: 'assist', hl: 'assist', win: '巧妙的战术配合，队友抢点破门！', lose: '配合被对手识破。' },
      ],
    };
    case 'defend': return {
      prompt: threat ? `🚨 ${min}' 对手打出快速反击，形成单刀威胁！` : `🛡️ ${min}' 对方前锋带球冲向禁区！`,
      opts: [
        { label: '🦵 果断铲断', tag: '可能吃牌', rate: r(46 + df * 0.75), reward: 'prevent', hl: 'tackle', win: '一记教科书般的滑铲，干净利落地断下皮球！', lose: '铲空了！对手晃过你……', risk: 0.2 },
        { label: '🧱 卡位拖延', rate: r(40 + df * 0.5 + pc * 0.3), reward: 'prevent', win: '你稳稳卡住身位，等到队友回防！', lose: '对手转身摆脱了你……' },
        { label: '✋ 战术犯规', tag: '必吃黄牌', rate: 88, reward: 'prevent', win: '你果断放倒对手，吃到一张黄牌，但破坏了反击。', lose: '犯规没能阻止对手……', risk: 1 },
      ],
    };
  }
}

const FLAVOR = [
  (c: string) => `🎶 ${c}的球迷在看台上高唱队歌。`, () => '📐 双方在中场展开激烈争夺。', () => '🧤 门将大脚开出球门球。',
  () => '🟨 对方一名后卫因拉人吃到黄牌。', () => '🚩 边裁举旗示意越位。', () => '💨 对手一次远射高出横梁。',
  () => '🗣️ 主教练在场边大声指挥。', () => '📺 转播镜头给到了看台上的名宿。', () => '🌧️ 天空飘起了小雨，场地变得湿滑。',
  () => '🔄 对方做出换人调整。', () => '🥅 角球被顶出禁区。', (c: string) => `📢 “${c}！${c}！”助威声响彻球场。`,
];

const HL_BY_KIND: Record<ChanceKind, HighlightType> = { box: 'goal', long: 'longshot', pass: 'assist', dribble: 'goal', header: 'header', freekick: 'freekick', defend: 'tackle' };

export function runLiveMatch(g: Game, plan: LivePlan, host: HTMLElement): Promise<LiveOutcome> {
  const p = g.player, club = clubById(p.clubId), f = plan.f;
  const opp = clubById(f.oppId);
  const youth = f.comp === 'youth';
  const myName = youth ? `${club.name} U19` : club.name, oppName = youth ? `${opp.name} U19` : opp.name;
  const out: LiveOutcome = { goals: 0, assists: 0, prevented: 0, ratingAdj: 0, kinds: [] };
  let my = 0, them = 0, speed = 1, auto = false, onPitch = plan.onMin === 0;

  host.innerHTML = `
  <div class="live">
    <div class="lv-top">
      <div class="lv-comp">${COMP_NAME(g, f.comp)} · ${f.round} · ${f.home ? '主场' : '客场'}</div>
      <div class="lv-board">
        <div class="lv-team">${crestSVG(club, 44)}<b>${myName}</b></div>
        <div class="lv-score"><span id="lv-my">0</span><i>:</i><span id="lv-op">0</span><small><span id="lv-clk">0</span>'</small></div>
        <div class="lv-team">${crestSVG(opp, 44)}<b>${oppName}</b></div>
      </div>
    </div>
    <div class="lv-pitch"><div class="lv-lines"></div><div class="lv-ball" id="lv-ball"></div><div class="lv-me" id="lv-me">${p.number}</div></div>
    <div class="lv-main"><ul class="lv-feed" id="lv-feed"></ul><div class="lv-act" id="lv-act"></div></div>
    <div class="lv-ctrl"><button id="lv-speed">⏩ 速度 1x</button><button id="lv-auto">🤖 自动决策：关</button><span class="muted small">比赛中的每个选择都会影响比分和你的评分</span></div>
    <div class="lv-3d" id="lv-3d"></div>
  </div>`;
  const $ = (id: string) => host.querySelector('#' + id) as HTMLElement;
  const feed = $('lv-feed'), act = $('lv-act'), ball = $('lv-ball'), me = $('lv-me');
  $('lv-speed').onclick = () => { speed = speed === 1 ? 3 : speed === 3 ? 8 : 1; $('lv-speed').textContent = `⏩ 速度 ${speed}x`; };
  $('lv-auto').onclick = () => { auto = !auto; $('lv-auto').textContent = `🤖 自动决策：${auto ? '开' : '关'}`; };
  me.style.opacity = onPitch ? '1' : '.25';

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms / speed));
  const add = (icon: string, html: string, cls = '') => {
    const li = document.createElement('li'); li.className = cls;
    li.innerHTML = `<span>${icon}</span><div>${html}</div>`;
    feed.prepend(li);
  };
  const moveBall = (x: number, y = 20 + rand() * 60) => { ball.style.left = `${x}%`; ball.style.top = `${y}%`; me.style.left = `${clamp(x - 6 + rand() * 12, 4, 94)}%`; me.style.top = `${clamp(y + (rand() - 0.5) * 20, 8, 90)}%`; };
  const setScore = () => { $('lv-my').textContent = String(my); $('lv-op').textContent = String(them); };
  const flash = (good: boolean) => { host.querySelector('.live')!.classList.remove('flash-good', 'flash-bad'); void (host.querySelector('.live') as HTMLElement).offsetWidth; host.querySelector('.live')!.classList.add(good ? 'flash-good' : 'flash-bad'); };

  const ask = (prompt: string, opts: Opt[]): Promise<Opt> => new Promise(res => {
    if (auto) { res([...opts].sort((a, b) => (b.rate * (b.reward === 'goal' ? 1.3 : 1)) - (a.rate * (a.reward === 'goal' ? 1.3 : 1)))[0]); return; }
    act.innerHTML = `<div class="lv-prompt">${prompt}</div>${opts.map((o, i) => `<button class="lv-btn" data-i="${i}"><b>${o.label}</b><span class="rate ${o.rate >= 60 ? 'hi' : o.rate >= 35 ? 'mid' : 'lo'}">成功率 ${o.rate}%</span>${o.tag ? `<small>${o.tag}</small>` : ''}</button>`).join('')}`;
    act.classList.add('show'); sfx.crowd();
    act.querySelectorAll('button').forEach(b => (b as HTMLButtonElement).onclick = () => { sfx.click(); act.classList.remove('show'); act.innerHTML = ''; res(opts[+(b as HTMLElement).dataset.i!]); });
  });

  const show3D = (type: HighlightType, caption: string) => new Promise<void>(res => {
    if (speed >= 8) { res(); return; }
    const box = $('lv-3d'); box.classList.add('show');
    box.innerHTML = `<div class="lv-3d-canvas"></div><button class="btn primary lv-3d-go">继续比赛 →</button>`;
    const hl = playHighlight(box.querySelector('.lv-3d-canvas') as HTMLElement, {
      type, name: p.name, number: p.number, skin: p.look.skin, team: club.colors, opp: opp.colors, caption,
    });
    let done = false;
    const finish = () => { if (done) return; done = true; hl.dispose(); box.classList.remove('show'); box.innerHTML = ''; res(); };
    (box.querySelector('.lv-3d-go') as HTMLElement).onclick = finish;
    setTimeout(finish, 8500 / Math.min(speed, 2));
  });

  type Ev = { min: number; type: 'kick' | 'ht' | 'ft' | 'subon' | 'mate' | 'opp' | 'chance' | 'flavor'; kind?: ChanceKind; defend?: boolean };
  const tl: Ev[] = [{ min: 0, type: 'kick' }, { min: 45, type: 'ht' }, { min: 90, type: 'ft' }];
  if (plan.onMin) tl.push({ min: plan.onMin, type: 'subon' });
  plan.teamGoals.forEach(m => tl.push({ min: m, type: 'mate' }));
  plan.oppGoals.forEach(o => tl.push({ min: o.min, type: 'opp', defend: o.defend }));
  plan.chances.forEach(c => tl.push({ min: c.min, type: 'chance', kind: c.kind }));
  for (let i = 0; i < 5; i++) tl.push({ min: 2 + Math.floor(rand() * 87), type: 'flavor' });
  const order = { kick: 0, subon: 1, flavor: 2, chance: 3, mate: 4, opp: 5, ht: 6, ft: 7 };
  tl.sort((a, b) => a.min - b.min || order[a.type] - order[b.type]);

  let minute = 0;
  const clock = async (to: number) => {
    while (minute < to) {
      minute++; $('lv-clk').textContent = String(minute);
      if (minute % 7 === 0) moveBall(20 + rand() * 60);
      await sleep(40);
    }
  };

  const decide = async (kind: ChanceKind, min: number, threat: boolean) => {
    const { prompt, opts } = optionsFor(g, kind, min, threat);
    add('❗', `<b>${prompt}</b>`, 'hot');
    moveBall(kind === 'defend' ? 18 : 80);
    const o = await ask(prompt, opts);
    const ok = rand() * 100 < o.rate;
    out.kinds.push(kind);
    if (o.risk && rand() < o.risk) { add('🟨', `${min}' 你吃到一张黄牌。`); out.ratingAdj -= 0.25; }
    if (!ok) {
      add('❌', `${min}' ${o.lose}`, 'bad'); sfx.miss(); flash(false);
      out.ratingAdj -= o.reward === 'safe' ? 0 : 0.15;
      if (o.fame) g.player.morale = clamp(g.player.morale - 3, 0, 100);
      return false;
    }
    if (o.fame) g.player.fame = clamp(g.player.fame + o.fame * 0.5, 0, 100);
    switch (o.reward) {
      case 'goal':
        out.goals++; my++; setScore(); sfx.goal(); flash(true); moveBall(96, 50);
        add('⚽', `${min}' <b class="gold">球进了！！！</b>${o.win}`, 'goal');
        await show3D(o.hl ?? HL_BY_KIND[kind], `${min}' ${p.name}：${o.win}`);
        break;
      case 'assist':
        out.assists++; my++; setScore(); sfx.goal(); flash(true); moveBall(96, 50);
        add('👟', `${min}' <b class="gold">助攻！</b>${o.win}`, 'goal');
        await show3D('assist', `${min}' ${p.name}送出助攻！`);
        break;
      case 'prevent':
        if (threat) out.prevented++; else out.ratingAdj += 0.3;
        add('🛡️', `${min}' <b>${o.win}</b>`, 'good'); sfx.crowd();
        if (o.hl && rand() < 0.5) await show3D('tackle', `${min}' ${p.name}关键拦截！`);
        break;
      case 'show': out.ratingAdj += 0.35; add('✨', `${min}' ${o.win}`, 'good'); sfx.crowd(); break;
      case 'safe': out.ratingAdj += 0.05; add('✅', `${min}' ${o.win}`); break;
    }
    return true;
  };

  const shootout = async (): Promise<'W' | 'L'> => {
    add('🎯', '<b>常规时间战平！比赛进入点球大战！</b>', 'hot'); sfx.longWhistle();
    let a = 0, b = 0;
    for (let round = 1; round <= 20; round++) {
      // 我方
      let scored: boolean;
      if (round === 1) {
        const o = await ask('🎯 你站上了第一个点球点，选择方向：', [
          { label: '⬅️ 左下角', rate: r(72 + (p.attrs.shooting - 60) * 0.3), reward: 'goal', win: '', lose: '' },
          { label: '⬆️ 中路勺子', tag: '胆大心细', rate: r(66 + (p.attrs.shooting - 60) * 0.3), reward: 'goal', fame: 3, win: '', lose: '' },
          { label: '➡️ 右上角', rate: r(70 + (p.attrs.shooting - 60) * 0.35), reward: 'goal', win: '', lose: '' },
        ]);
        scored = rand() * 100 < o.rate;
        add(scored ? '⚽' : '❌', scored ? `<b>你罚进了点球！</b>${o.label.includes('中路') ? '一个潇洒的勺子！' : ''}` : '<b>你的点球被扑出了！</b>', scored ? 'goal' : 'bad');
      } else { scored = rand() < 0.76; add(scored ? '⚽' : '❌', `我方第 ${round} 轮：${scored ? '罚进' : '罚失'}`); }
      if (scored) { a++; sfx.goal(); } else sfx.miss();
      await sleep(700);
      const sc = rand() < 0.74; if (sc) b++;
      add(sc ? '🥅' : '🧤', `对方第 ${round} 轮：${sc ? '罚进' : '被扑出'}`, sc ? '' : 'good');
      await sleep(700);
      $('lv-my').textContent = `${my}(${a})`; $('lv-op').textContent = `${them}(${b})`;
      if (round <= 5) {
        if (a > b + (5 - round) || b > a + (5 - round)) break;
      } else if (a !== b) break;
    }
    return a > b ? 'W' : 'L';
  };

  return (async () => {
    for (const ev of tl) {
      await clock(ev.min);
      const m = ev.min;
      switch (ev.type) {
        case 'kick': sfx.whistle(); add('🟢', plan.onMin ? '比赛开始！你今天坐在替补席上，随时准备登场……' : `比赛开始！${myName} vs ${oppName}。`); moveBall(50, 50); break;
        case 'subon': onPitch = true; me.style.opacity = '1'; sfx.whistle(); add('🔄', `${m}' <b class="gold">换人！你替补登场！</b>把握每一分钟证明自己！`, 'goal'); break;
        case 'flavor': add('💬', `${m}' ${pick(FLAVOR)(club.name)}`); break;
        case 'mate': my++; setScore(); sfx.goal(); flash(true); moveBall(96, 50); add('⚽', `${m}' ${myName}的队友破门！比分 ${my}-${them}`, 'goal'); await sleep(500); break;
        case 'opp':
          if (ev.defend && onPitch) {
            const stopped = await decide('defend', m, true);
            if (stopped) break;
          }
          them++; setScore(); sfx.oppGoal(); flash(false); moveBall(4, 50);
          add('😣', `${m}' ${oppName}破门得分……比分 ${my}-${them}`, 'bad'); await sleep(500); break;
        case 'chance':
          if (!onPitch) break;
          if (ev.kind === 'defend') {
            const ok = await decide('defend', m, false);
            if (!ok && rand() < 0.45) { out.prevented--; them++; setScore(); sfx.oppGoal(); add('😣', `${m}' 对手抓住机会破门……比分 ${my}-${them}`, 'bad'); }
          } else await decide(ev.kind!, m, false);
          break;
        case 'ht': sfx.whistle(); add('⏸️', `半场结束，比分 ${my}-${them}。`); await sleep(600); break;
        case 'ft': sfx.longWhistle(); add('🔚', `全场比赛结束！${my > them ? '你的球队赢了！🎉' : my === them ? '双方握手言和。' : '球队遗憾告负。'}`); break;
      }
      await sleep(250);
    }
    if (needsShootout(plan, out)) out.pen = await shootout();
    act.innerHTML = ''; act.classList.remove('show');
    return out;
  })();
}
