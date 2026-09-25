import { ATTR_KEYS, ATTR_NAMES, clamp, clubById, fmtMoney, nationById, ovr, pick, rand, ri } from './engine';
import type { Game, Player } from './types';

export interface Choice { label: string; hint?: string; run: (g: Game) => string }
export interface GameEvent { id: string; title: string; art: string; text: (g: Game) => string; cond?: (g: Game) => boolean; choices: Choice[] }

const adj = (p: Player, k: 'morale' | 'fame' | 'coachRel' | 'fitness', v: number) => { p[k] = clamp(p[k] + v, 0, 100); };
const fmtD = (v: number) => (v > 0 ? `+${v}` : `${v}`);

export const EVENTS: GameEvent[] = [
  {
    id: 'interview', title: '赛后采访', art: 'media',
    text: g => `一场比赛后，一群记者把你围住：“${g.player.name}，你觉得自己能成为世界最佳吗？”`,
    choices: [
      { label: '谦虚：“我只想帮助球队赢球。”', run: g => { adj(g.player, 'coachRel', 3); adj(g.player, 'fame', 1); return '教练很欣赏你的态度。教练关系 +3'; } },
      { label: '霸气：“我就是未来的金球先生！”', run: g => { adj(g.player, 'fame', 5); adj(g.player, 'morale', 4); adj(g.player, 'coachRel', -3); return '这句话登上了各大体育头条！名气 +5，教练关系 -3'; } },
      { label: '拒绝采访，径直离开', run: g => { adj(g.player, 'fame', -1); return '媒体说你耍大牌。名气 -1'; } },
    ],
  },
  {
    id: 'clash', title: '训练场冲突', art: 'rival',
    text: () => '训练对抗中，一名老队员恶意铲倒了你，还冷嘲热讽：“小子，别太嚣张。”',
    choices: [
      { label: '默默忍下来', run: g => { adj(g.player, 'morale', -3); adj(g.player, 'coachRel', 2); return '你选择了隐忍，教练看在眼里。士气 -3，教练关系 +2'; } },
      { label: '当场顶回去', run: g => { adj(g.player, 'morale', 3); if (rand() < 0.4) { const f = Math.round(g.player.wage * 0.3); g.player.money -= f; adj(g.player, 'coachRel', -6); return `你们扭打起来，被俱乐部罚款 ${fmtMoney(f)}！教练关系 -6`; } adj(g.player, 'coachRel', -2); return '你的强硬赢得了一些队友的尊重。士气 +3'; } },
      { label: '用下一次突破回应他', hint: '需要盘带 ≥ 60', run: g => { if (g.player.attrs.dribbling >= 60) { adj(g.player, 'coachRel', 5); adj(g.player, 'morale', 5); return '你连续过掉他两次，全场起哄！教练关系 +5，士气 +5'; } adj(g.player, 'morale', -5); return '你被他再次断球，尴尬极了。士气 -5'; } },
    ],
  },
  {
    id: 'coachtalk', title: '主教练的办公室', art: 'coach',
    text: () => '主教练把你叫进办公室：“你的无球跑动和防守投入还不够，我需要你为团队做更多。”',
    choices: [
      { label: '虚心接受，加练防守', run: g => { g.player.attrs.defending += 1.5; adj(g.player, 'coachRel', 5); return '防守 +1.5，教练关系 +5'; } },
      { label: '据理力争：“我的任务是进攻！”', run: g => { adj(g.player, 'coachRel', -6); adj(g.player, 'morale', 2); return '教练的脸色很难看。教练关系 -6'; } },
    ],
  },
  {
    id: 'nightclub', title: '夜店邀请', art: 'party',
    text: () => '几个队友约你周六晚上去城里最火的夜店，而周日下午就有比赛。',
    choices: [
      { label: '去！年轻就要尽兴', run: g => { adj(g.player, 'morale', 7); adj(g.player, 'fitness', -12); if (rand() < 0.3) { adj(g.player, 'fame', -4); adj(g.player, 'coachRel', -8); return '凌晨三点被拍到醉醺醺走出夜店……教练关系 -8，名气 -4'; } return '玩得很开心，但第二天腿有点软。士气 +7，体能 -12'; } },
      { label: '婉拒，早点休息', run: g => { adj(g.player, 'coachRel', 2); adj(g.player, 'fitness', 5); return '自律是职业球员的第一课。教练关系 +2，体能 +5'; } },
    ],
  },
  {
    id: 'charity', title: '慈善活动', art: 'charity',
    text: g => `${clubById(g.player.clubId).city}的一家儿童医院希望你能去看望患病的孩子们。`,
    choices: [
      { label: '前往探望并捐款', hint: '花费 5% 存款', run: g => { const c = Math.max(1000, Math.round(g.player.money * 0.05)); g.player.money -= c; adj(g.player, 'fame', 5); adj(g.player, 'morale', 5); return `你捐出 ${fmtMoney(c)}，孩子们开心极了。名气 +5，士气 +5`; } },
      { label: '只去合影', run: g => { adj(g.player, 'fame', 2); adj(g.player, 'morale', 2); return '合影在社交媒体上获得大量点赞。名气 +2'; } },
      { label: '没空，推掉', run: g => { adj(g.player, 'fame', -2); return '有媒体批评你冷漠。名气 -2'; } },
    ],
  },
  {
    id: 'fans', title: '球迷见面会', art: 'fans',
    text: () => '训练基地外聚集了上百名球迷，他们举着写有你名字的横幅。',
    choices: [
      { label: '签名到最后一个人', run: g => { adj(g.player, 'fame', 4); adj(g.player, 'fitness', -3); adj(g.player, 'morale', 3); return '你签了整整两个小时！名气 +4，士气 +3'; } },
      { label: '挥挥手就上车', run: g => { adj(g.player, 'fame', -1); return '有球迷失望地离开了。名气 -1'; } },
    ],
  },
  {
    id: 'sponsor', title: '商业代言', art: 'money', cond: g => g.player.fame >= 25,
    text: g => `一家运动品牌想签下你成为代言人，报价 ${fmtMoney(Math.round(g.player.fame ** 2 * 900))}。`,
    choices: [
      { label: '签下代言', run: g => { const v = Math.round(g.player.fame ** 2 * 900); g.player.money += v; adj(g.player, 'fame', 3); adj(g.player, 'fitness', -4); return `收入 ${fmtMoney(v)}，拍广告有点累。名气 +3`; } },
      { label: '拒绝，专注足球', run: g => { adj(g.player, 'coachRel', 3); return '教练很满意你的专注。教练关系 +3'; } },
    ],
  },
  {
    id: 'painkiller', title: '带伤上阵？', art: 'injury', cond: g => g.player.fitness < 55 && g.player.injury === 0 && g.player.role !== '青训',
    text: () => '你的大腿后侧隐隐作痛，队医建议休息，但下场是一场关键比赛。',
    choices: [
      { label: '打封闭，带伤上场', run: g => { if (rand() < 0.45) { g.player.injury = ri(1, 3); return `伤势加重！你将缺阵 ${g.player.injury} 个月。`; } adj(g.player, 'coachRel', 5); adj(g.player, 'fame', 2); return '你咬牙坚持了下来，全队都被你感动。教练关系 +5'; } },
      { label: '听从队医，休息', run: g => { adj(g.player, 'fitness', 20); adj(g.player, 'coachRel', -2); return '身体得到了恢复。体能 +20'; } },
    ],
  },
  {
    id: 'veteran', title: '老将传授', art: 'train',
    text: () => '队里一位 34 岁的老将在训练后主动留下来：“想学点真东西吗？”',
    choices: [
      { label: '虚心请教', run: g => { const k = pick(ATTR_KEYS); g.player.attrs[k] += 2; adj(g.player, 'morale', 2); return `你学到了很多细节技巧。${ATTR_NAMES[k]} +2`; } },
      { label: '不屑一顾', run: g => { adj(g.player, 'coachRel', -2); return '老将摇摇头走开了。教练关系 -2'; } },
    ],
  },
  {
    id: 'troll', title: '社交媒体骂战', art: 'social',
    text: () => '一位知名评论员在社交媒体上嘲讽你“被过度吹捧”，引发数万转发。',
    choices: [
      { label: '发文回怼', run: g => { adj(g.player, 'fame', 4); adj(g.player, 'coachRel', -3); adj(g.player, 'morale', -2); return '骂战持续了一周，热度很高。名气 +4，教练关系 -3'; } },
      { label: '用进球回应', run: g => { adj(g.player, 'morale', 3); g.player.attrs.shooting += 0.8; return '你憋着一股劲加练射门。射门 +0.8，士气 +3'; } },
      { label: '无视', run: g => { adj(g.player, 'morale', 1); return '清者自清。'; } },
    ],
  },
  {
    id: 'captain', title: '队长袖标', art: 'fans', cond: g => g.player.role === '核心' && g.player.age >= 23 && !g.player.captain,
    text: g => `${clubById(g.player.clubId).name}的主教练希望你成为球队新队长。`,
    choices: [
      { label: '接过袖标', run: g => { g.player.captain = true; adj(g.player, 'fame', 5); adj(g.player, 'coachRel', 6); adj(g.player, 'morale', 6); return '你成为了球队队长！名气 +5，士气 +6'; } },
      { label: '推辞，让给老大哥', run: g => { adj(g.player, 'coachRel', 3); return '更衣室对你的谦逊赞不绝口。教练关系 +3'; } },
    ],
  },
  {
    id: 'rumour', title: '转会传闻', art: 'media', cond: g => g.player.fame >= 30 && g.player.role !== '青训',
    text: () => '媒体爆料多家豪门正在关注你，记者在机场堵住了你。',
    choices: [
      { label: '亲吻队徽表忠心', run: g => { adj(g.player, 'coachRel', 5); adj(g.player, 'fame', 1); return '主场球迷为你高唱队歌。教练关系 +5'; } },
      { label: '暧昧回应：“一切皆有可能”', run: g => { g.offerBoost += 1; adj(g.player, 'coachRel', -4); adj(g.player, 'fame', 3); return '下个转会窗会有更多球队对你报价！教练关系 -4'; } },
    ],
  },
  {
    id: 'romance', title: '恋爱绯闻', art: 'love', cond: g => g.player.age >= 18,
    text: () => '你和一位当红明星被拍到共进晚餐，娱乐版头条炸了。',
    choices: [
      { label: '大方公开恋情', run: g => { adj(g.player, 'morale', 8); adj(g.player, 'fame', 5); return '祝福声一片。士气 +8，名气 +5'; } },
      { label: '否认，只是朋友', run: g => { adj(g.player, 'morale', -3); return '你们的关系变得有些尴尬。士气 -3'; } },
    ],
  },
  {
    id: 'invest', title: '投资机会', art: 'money', cond: g => g.player.money >= 200_000,
    text: g => `你的朋友推荐了一个“稳赚不赔”的项目，建议投入 ${fmtMoney(Math.round(g.player.money * 0.3))}。`,
    choices: [
      { label: '投资！', run: g => { const v = Math.round(g.player.money * 0.3); if (rand() < 0.45) { g.player.money += Math.round(v * 0.8); adj(g.player, 'morale', 3); return `项目大获成功，赚了 ${fmtMoney(Math.round(v * 0.8))}！`; } g.player.money -= Math.round(v * 0.6); adj(g.player, 'morale', -5); return `项目暴雷，亏了 ${fmtMoney(Math.round(v * 0.6))}……`; } },
      { label: '天上不会掉馅饼', run: () => '你谨慎地拒绝了。' },
    ],
  },
  {
    id: 'mentor', title: '青训学弟', art: 'train', cond: g => g.player.age >= 26,
    text: () => '青训营里一个 16 岁的孩子说你是他的偶像，希望你能指导他。',
    choices: [
      { label: '每周抽时间指导', run: g => { adj(g.player, 'morale', 5); adj(g.player, 'coachRel', 3); adj(g.player, 'fame', 2); return '看着他成长，你想起了当年的自己。士气 +5'; } },
      { label: '送他一双签名球鞋', run: g => { adj(g.player, 'fame', 1); return '孩子开心得跳了起来。'; } },
    ],
  },
  {
    id: 'split', title: '更衣室分裂', art: 'coach', cond: g => g.player.role !== '青训',
    text: () => '球队连续不胜，几名老队员公开和主教练对立，大家都在看你站哪边。',
    choices: [
      { label: '支持主教练', run: g => { adj(g.player, 'coachRel', 7); adj(g.player, 'morale', -3); return '教练把你视作心腹。教练关系 +7'; } },
      { label: '支持老队员', run: g => { adj(g.player, 'coachRel', -7); adj(g.player, 'morale', 4); return '更衣室把你当自己人，但教练记住了。教练关系 -7'; } },
      { label: '保持中立', run: () => '你只专注于自己的比赛。' },
    ],
  },
  {
    id: 'family', title: '家人生病', art: 'family',
    text: () => '深夜接到家里电话，家人突然住院了。',
    choices: [
      { label: '请假回家陪伴', run: g => { adj(g.player, 'morale', 5); adj(g.player, 'coachRel', -2); adj(g.player, 'fitness', 8); return '家人的病情稳定了，你安心地回到了球队。'; } },
      { label: '留队训练，视频问候', run: g => { adj(g.player, 'morale', -8); adj(g.player, 'coachRel', 3); return '你心里一直放不下。士气 -8'; } },
    ],
  },
  {
    id: 'altitude', title: '私人特训营', art: 'train', cond: g => g.player.money >= 30_000,
    text: () => '一位顶级私人教练在休赛期开设特训营，费用不菲。',
    choices: [
      { label: '自费参加', hint: '花费 €3万 + 10% 存款', run: g => { const c = 30_000 + Math.round(g.player.money * 0.1); g.player.money -= c; g.player.attrs.physical += 1.5; g.player.attrs.pace += 1; return `花费 ${fmtMoney(c)}。身体 +1.5，速度 +1`; } },
      { label: '不去了', run: () => '你选择和家人度假。' },
    ],
  },
  {
    id: 'show', title: '综艺邀请', art: 'social', cond: g => g.player.fame >= 20,
    text: () => '一档热门综艺节目邀请你当飞行嘉宾。',
    choices: [
      { label: '参加', run: g => { const v = Math.round(20_000 + g.player.fame * 3_000); g.player.money += v; adj(g.player, 'fame', 5); adj(g.player, 'coachRel', -2); return `你展示了球技和幽默感，收入 ${fmtMoney(v)}。名气 +5`; } },
      { label: '婉拒', run: g => { adj(g.player, 'coachRel', 1); return '你把时间留给了训练。'; } },
    ],
  },
  {
    id: 'referee', title: '争议判罚', art: 'rival', cond: g => g.player.role !== '青训',
    text: () => '上一场比赛裁判漏判了一个明显的点球，球队因此丢了分。',
    choices: [
      { label: '赛后公开炮轰裁判', run: g => { const f = Math.round(g.player.wage * 0.5 + 5_000); g.player.money -= f; adj(g.player, 'fame', 3); adj(g.player, 'morale', 2); return `被足协罚款 ${fmtMoney(f)}，但球迷力挺你。名气 +3`; } },
      { label: '保持沉默', run: g => { adj(g.player, 'coachRel', 1); return '专业的态度。'; } },
    ],
  },
  {
    id: 'national', title: '国家队召唤', art: 'national', cond: g => g.player.caps > 0,
    text: g => `${nationById(g.player.nation).name}队主帅亲自打来电话，希望你在接下来的比赛中担当重任。`,
    choices: [
      { label: '全力以赴！', run: g => { adj(g.player, 'fame', 4); adj(g.player, 'fitness', -8); adj(g.player, 'morale', 4); return '为国出战是无上的荣耀。名气 +4'; } },
      { label: '以伤病为由推辞', run: g => { adj(g.player, 'fame', -5); adj(g.player, 'fitness', 12); return '国内舆论一片哗然。名气 -5'; } },
    ],
  },
  {
    id: 'dog', title: '流浪狗', art: 'love',
    text: () => '训练回家路上，一只小狗一路跟着你。',
    choices: [
      { label: '领养它', run: g => { adj(g.player, 'morale', 6); adj(g.player, 'fame', 1); return '你给它取名“点球”。士气 +6'; } },
      { label: '送去救助站', run: g => { adj(g.player, 'morale', 1); return '希望它能找到好人家。'; } },
    ],
  },
  {
    id: 'position', title: '位置实验', art: 'coach', cond: g => g.player.role !== '青训',
    text: () => '主教练想在训练中尝试让你踢一个陌生的位置。',
    choices: [
      { label: '积极尝试', run: g => { const k = pick(ATTR_KEYS); g.player.attrs[k] += 1.5; adj(g.player, 'coachRel', 4); return `你的比赛理解更全面了。${ATTR_NAMES[k]} +1.5，教练关系 +4`; } },
      { label: '坚持本位', run: g => { adj(g.player, 'coachRel', -2); return '教练尊重了你的选择，但有些失望。'; } },
    ],
  },
  {
    id: 'derby', title: '德比大战前夕', art: 'fans', cond: g => g.player.role !== '青训' && g.month !== 6 && g.month !== 7,
    text: g => `本月有一场万众瞩目的德比战，${clubById(g.player.clubId).city}全城沸腾。`,
    choices: [
      { label: '赛前放狠话', run: g => { adj(g.player, 'fame', 3); adj(g.player, 'morale', 3); return `整个城市都在讨论你的话。名气 +3，士气 +3（当前能力 ${ovr(g.player)}）`; } },
      { label: '闭门备战', run: g => { adj(g.player, 'fitness', 6); adj(g.player, 'coachRel', 2); return '体能 +6，教练关系 +2'; } },
    ],
  },
];

export function pickEvent(g: Game): string | undefined {
  if (rand() > 0.6) return undefined;
  const pool = EVENTS.filter(e => !e.cond || e.cond(g));
  return pool.length ? pick(pool).id : undefined;
}

export const eventById = (id: string) => EVENTS.find(e => e.id === id)!;
export { fmtD };
