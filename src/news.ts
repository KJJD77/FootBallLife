import { MEDIA } from './data';
import { clubById, nationById, pick, rand } from './engine';
import type { Game, MatchResult } from './types';

const oppName = (r: MatchResult) => (r.comp === 'intl' || r.comp === 'tour' ? nationById(r.oppId).name : clubById(r.oppId).name);
const score = (r: MatchResult) => `${r.gf}-${r.ga}`;

/** 本月媒体头条 */
export function headline(g: Game, results: MatchResult[]): { media: string; title: string; sub: string } | null {
  const p = g.player, club = clubById(p.clubId);
  const media = pick(MEDIA[club.league] ?? MEDIA.CHN);
  const played = results.filter(r => r.minutes);
  if (!played.length) {
    if (p.injury) return { media, title: `${p.name}伤缺，${club.name}主帅：“我们需要他尽快回来”`, sub: '队医表示恢复进展顺利。' };
    if (results.length && p.role !== '青训') return { media, title: `板凳深坐！${p.name}本月零出场，未来何去何从？`, sub: '有消息称其经纪人已开始接触其他俱乐部。' };
    return null;
  }
  const best = [...played].sort((a, b) => (b.goals * 3 + b.assists * 2 + b.rating) - (a.goals * 3 + a.assists * 2 + a.rating))[0];
  const worst = [...played].sort((a, b) => a.rating - b.rating)[0];
  const n = oppName(best), me = best.comp === 'intl' || best.comp === 'tour' ? nationById(p.nation).name : club.name;
  const win = best.gf > best.ga;
  if (best.goals >= 3) return { media, title: `帽子戏法！${p.name}独造三球，${me}${score(best)}横扫${n}`, sub: `“这是我梦想中的夜晚”，${p.name}赛后激动地说。` };
  if (best.goals === 2) return { media, title: `梅开二度！${p.name}闪耀全场，${me}${win ? '击败' : '战平'}${n}`, sub: `全场评分 ${best.rating.toFixed(1)}，当之无愧的全场最佳。` };
  if (best.goals === 1 && best.round === '决赛') return { media, title: `决赛英雄！${p.name}一锤定音`, sub: `${me}${score(best)}击败${n}捧起奖杯。` };
  if (best.goals === 1) return { media, title: `${p.name}破门，${me}${score(best)}${win ? '拿下' : best.gf === best.ga ? '战平' : '不敌'}${n}`, sub: pick(['这粒进球展现了他的冷静。', '球迷高唱他的名字。', '主帅赛后对他赞不绝口。']) };
  if (best.assists >= 2) return { media, title: `助攻大师！${p.name}两次送出妙传`, sub: `${me}${score(best)}战胜${n}。` };
  if (worst.rating < 5.8) return { media, title: `灾难之夜！${p.name}状态低迷遭球迷嘘声`, sub: `对阵${oppName(worst)}仅获评 ${worst.rating.toFixed(1)} 分。` };
  if (best.rating >= 7.5) return { media, title: `${p.name}表现稳健，获评${best.rating.toFixed(1)}分`, sub: `${me}对阵${n}的比赛中，他是场上最闪亮的球员之一。` };
  return { media, title: `${me}本月战报：${played.length} 场比赛，${p.name}中规中矩`, sub: '外界期待他展现更多。' };
}

const GOOD = ['这球太帅了！！！🔥', '我们的未来之星⭐', '门将：我是谁我在哪', '球票钱值了！', '已经买了他的球衣👕', '世界级！世界级！', '建议直接续约十年', '今晚我要循环播放集锦', '这就是天赋！', '把他放进国家队！'];
const MID = ['还行吧，继续努力💪', '有进步，期待更多', '稳定发挥', '今天体能好像不太够', '需要多一点决定性'];
const BAD = ['今天梦游了？😴', '卖了吧……', '下次别首发了', '求求你认真踢', '是不是昨晚又去夜店了？', '状态太差了'];
const BENCH = ['教练为什么不用他？？', '放他上场啊！', '给年轻人机会！', '再坐板凳就要走了吧'];

/** 社交媒体球迷评论 */
export function fanComments(g: Game, results: MatchResult[]): { user: string; text: string; likes: number }[] {
  const played = results.filter(r => r.minutes && r.comp !== 'intl' && r.comp !== 'tour');
  const avg = played.length ? played.reduce((a, r) => a + r.rating, 0) / played.length : 0;
  const goals = played.reduce((a, r) => a + r.goals, 0);
  const pool = !played.length ? (g.player.injury ? ['早日康复🙏', '等你回来！', '伤病快走开！'] : BENCH) : avg >= 7.3 || goals >= 2 ? GOOD : avg >= 6.5 ? MID : BAD;
  const users = ['铁杆球迷老王', 'KOP_1892', '足球小将', '看球不说话', '主队永远的神', '凌晨三点看球', '懂球帝用户', '绿茵梦想家', 'ultras_07', '战术板分析师'];
  const fans = Math.round(1 + g.player.fame * 0.6);
  return Array.from({ length: 3 + (rand() < 0.5 ? 1 : 0) }, () => ({ user: pick(users), text: pick(pool), likes: Math.round((50 + rand() * 900) * fans) }));
}
