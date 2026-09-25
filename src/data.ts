import type { Club, League, Nation, Pos } from './types';

export const LEAGUES: League[] = [
  { id: 'ENG', cup: '足总杯', name: '英格兰超级联赛', short: '英超', cont: '欧洲冠军联赛', strength: 80 },
  { id: 'ESP', cup: '国王杯', name: '西班牙甲级联赛', short: '西甲', cont: '欧洲冠军联赛', strength: 79 },
  { id: 'ITA', cup: '意大利杯', name: '意大利甲级联赛', short: '意甲', cont: '欧洲冠军联赛', strength: 77 },
  { id: 'GER', cup: '德国杯', name: '德国甲级联赛', short: '德甲', cont: '欧洲冠军联赛', strength: 76 },
  { id: 'FRA', cup: '法国杯', name: '法国甲级联赛', short: '法甲', cont: '欧洲冠军联赛', strength: 74 },
  { id: 'NED', cup: '荷兰杯', name: '荷兰甲级联赛', short: '荷甲', cont: '欧洲冠军联赛', strength: 70 },
  { id: 'CHN', cup: '足协杯', name: '中国超级联赛', short: '中超', cont: '亚洲冠军联赛', strength: 60 },
  { id: 'ASI', cup: '亚洲杯赛', name: '亚洲联赛', short: '亚洲', cont: '亚洲冠军联赛', strength: 66, hidden: true },
];

type Raw = [string, string, string, number, number, string, string, string];

const RAW: Record<string, Raw[]> = {
  ENG: [
    ['mci', '曼城', 'MCI', 87, 94, '#6cabdd', '#1c2c5b', '曼彻斯特'],
    ['ars', '阿森纳', 'ARS', 86, 90, '#ef0107', '#ffffff', '伦敦'],
    ['liv', '利物浦', 'LIV', 86, 92, '#c8102e', '#f6eb61', '利物浦'],
    ['che', '切尔西', 'CHE', 83, 88, '#034694', '#ffffff', '伦敦'],
    ['mun', '曼联', 'MUN', 81, 90, '#da291c', '#fbe122', '曼彻斯特'],
    ['tot', '托特纳姆热刺', 'TOT', 80, 82, '#f5f5f5', '#132257', '伦敦'],
    ['new', '纽卡斯尔联', 'NEW', 80, 78, '#241f20', '#ffffff', '纽卡斯尔'],
    ['avl', '阿斯顿维拉', 'AVL', 79, 74, '#670e36', '#95bfe5', '伯明翰'],
  ],
  ESP: [
    ['rma', '皇家马德里', 'RMA', 88, 98, '#f5f5f5', '#febe10', '马德里'],
    ['bar', '巴塞罗那', 'BAR', 87, 96, '#a50044', '#004d98', '巴塞罗那'],
    ['atm', '马德里竞技', 'ATM', 83, 85, '#cb3524', '#ffffff', '马德里'],
    ['ath', '毕尔巴鄂竞技', 'ATH', 78, 72, '#ee2523', '#ffffff', '毕尔巴鄂'],
    ['rso', '皇家社会', 'RSO', 76, 70, '#0067b1', '#ffffff', '圣塞巴斯蒂安'],
    ['vil', '比利亚雷亚尔', 'VIL', 76, 68, '#ffe667', '#005187', '比利亚雷亚尔'],
    ['bet', '皇家贝蒂斯', 'BET', 75, 68, '#00954c', '#ffffff', '塞维利亚'],
    ['sev', '塞维利亚', 'SEV', 74, 72, '#d71920', '#ffffff', '塞维利亚'],
  ],
  ITA: [
    ['int', '国际米兰', 'INT', 85, 88, '#0068a8', '#111111', '米兰'],
    ['juv', '尤文图斯', 'JUV', 83, 89, '#111111', '#ffffff', '都灵'],
    ['mil', 'AC米兰', 'MIL', 82, 87, '#fb090b', '#111111', '米兰'],
    ['nap', '那不勒斯', 'NAP', 82, 80, '#12a0d7', '#ffffff', '那不勒斯'],
    ['ata', '亚特兰大', 'ATA', 80, 74, '#1e71b8', '#111111', '贝加莫'],
    ['rom', '罗马', 'ROM', 78, 78, '#8e1f2f', '#f0bc42', '罗马'],
    ['laz', '拉齐奥', 'LAZ', 77, 72, '#87d8f7', '#ffffff', '罗马'],
    ['fio', '佛罗伦萨', 'FIO', 75, 68, '#482e92', '#ffffff', '佛罗伦萨'],
  ],
  GER: [
    ['fcb', '拜仁慕尼黑', 'FCB', 87, 95, '#dc052d', '#ffffff', '慕尼黑'],
    ['lev', '勒沃库森', 'B04', 83, 80, '#e32221', '#111111', '勒沃库森'],
    ['bvb', '多特蒙德', 'BVB', 82, 84, '#fde100', '#111111', '多特蒙德'],
    ['rbl', 'RB莱比锡', 'RBL', 80, 74, '#dd0741', '#ffffff', '莱比锡'],
    ['sge', '法兰克福', 'SGE', 77, 68, '#e1000f', '#111111', '法兰克福'],
    ['vfb', '斯图加特', 'VFB', 76, 66, '#f5f5f5', '#e32219', '斯图加特'],
    ['bmg', '门兴格拉德巴赫', 'BMG', 73, 64, '#f5f5f5', '#111111', '门兴'],
    ['wob', '沃尔夫斯堡', 'WOB', 73, 62, '#65b32e', '#ffffff', '沃尔夫斯堡'],
  ],
  FRA: [
    ['psg', '巴黎圣日耳曼', 'PSG', 86, 91, '#004170', '#da291c', '巴黎'],
    ['om', '马赛', 'OM', 78, 74, '#2faee0', '#ffffff', '马赛'],
    ['asm', '摩纳哥', 'ASM', 78, 72, '#e51b22', '#ffffff', '摩纳哥'],
    ['losc', '里尔', 'LIL', 76, 68, '#e01e13', '#20325f', '里尔'],
    ['ol', '里昂', 'OL', 76, 72, '#f5f5f5', '#da0812', '里昂'],
    ['ogcn', '尼斯', 'NIC', 74, 62, '#c8102e', '#111111', '尼斯'],
    ['len', '朗斯', 'RCL', 74, 62, '#ec1c24', '#fff200', '朗斯'],
    ['srfc', '雷恩', 'REN', 73, 60, '#e13327', '#111111', '雷恩'],
  ],
  NED: [
    ['psv', '埃因霍温', 'PSV', 77, 74, '#ed1c24', '#ffffff', '埃因霍温'],
    ['aja', '阿贾克斯', 'AJA', 76, 80, '#d2122e', '#ffffff', '阿姆斯特丹'],
    ['fey', '费耶诺德', 'FEY', 75, 72, '#ee2737', '#ffffff', '鹿特丹'],
    ['az', '阿尔克马尔', 'AZ', 71, 60, '#d8001f', '#ffffff', '阿尔克马尔'],
    ['twe', '特温特', 'TWE', 69, 56, '#e2001a', '#ffffff', '恩斯赫德'],
    ['utr', '乌得勒支', 'UTR', 67, 52, '#e30613', '#ffffff', '乌得勒支'],
    ['hee', '海伦芬', 'HEE', 65, 48, '#0b4ea2', '#ffffff', '海伦芬'],
    ['spa', '鹿特丹斯巴达', 'SPA', 63, 44, '#e30613', '#ffffff', '鹿特丹'],
  ],
  CHN: [
    ['shp', '上海海港', 'SHP', 64, 62, '#d7141a', '#ffffff', '上海'],
    ['sdt', '山东泰山', 'SDT', 64, 62, '#f58220', '#ffffff', '济南'],
    ['bjg', '北京国安', 'BJG', 63, 62, '#007a3d', '#ffffff', '北京'],
    ['shs', '上海申花', 'SHS', 63, 60, '#0047ab', '#ffffff', '上海'],
    ['cdr', '成都蓉城', 'CDR', 62, 54, '#b22234', '#ffffff', '成都'],
    ['zjp', '浙江俱乐部', 'ZJP', 59, 48, '#00843d', '#ffffff', '杭州'],
    ['wht', '武汉三镇', 'WHT', 58, 48, '#0055a5', '#ffffff', '武汉'],
    ['tjj', '天津津门虎', 'TJJ', 58, 46, '#0057b7', '#ffffff', '天津'],
  ],
  ASI: [
    ['hil', '利雅得新月', 'HIL', 74, 70, '#0033a0', '#ffffff', '利雅得'],
    ['nas', '利雅得胜利', 'NAS', 73, 70, '#ffd100', '#1c3f94', '利雅得'],
    ['vis', '神户胜利船', 'VIS', 68, 58, '#8b0000', '#111111', '神户'],
    ['ydm', '横滨水手', 'YFM', 67, 58, '#005bac', '#ffffff', '横滨'],
    ['uls', '蔚山HD', 'ULS', 67, 56, '#0055a4', '#ffd200', '蔚山'],
    ['sad', '萨德', 'SAD', 66, 54, '#111111', '#e30613', '多哈'],
  ],
};

export const CLUBS: Club[] = Object.entries(RAW).flatMap(([league, list]) =>
  list.map(([id, name, short, level, rep, c1, c2, city], i) => ({
    id, name, short, league, city, level, rep, colors: [c1, c2] as [string, string], pattern: (i * 3 + league.length) % 5,
  })),
);

export const NATIONS: Nation[] = [
  { id: 'CHN', name: '中国', strength: 62, cup: '亚洲杯', colors: ['#de2910', '#ffde00'] },
  { id: 'BRA', name: '巴西', strength: 88, cup: '美洲杯', colors: ['#ffdf00', '#009b3a'] },
  { id: 'ARG', name: '阿根廷', strength: 88, cup: '美洲杯', colors: ['#75aadb', '#ffffff'] },
  { id: 'FRA', name: '法国', strength: 89, cup: '欧洲杯', colors: ['#0055a4', '#ffffff'] },
  { id: 'ENG', name: '英格兰', strength: 87, cup: '欧洲杯', colors: ['#ffffff', '#cf081f'] },
  { id: 'ESP', name: '西班牙', strength: 88, cup: '欧洲杯', colors: ['#c60b1e', '#ffc400'] },
  { id: 'GER', name: '德国', strength: 86, cup: '欧洲杯', colors: ['#ffffff', '#111111'] },
  { id: 'POR', name: '葡萄牙', strength: 85, cup: '欧洲杯', colors: ['#c8102e', '#006600'] },
  { id: 'NED', name: '荷兰', strength: 84, cup: '欧洲杯', colors: ['#f36c21', '#ffffff'] },
  { id: 'ITA', name: '意大利', strength: 84, cup: '欧洲杯', colors: ['#0066cc', '#ffffff'] },
  { id: 'JPN', name: '日本', strength: 74, cup: '亚洲杯', colors: ['#000080', '#ffffff'] },
  { id: 'KOR', name: '韩国', strength: 72, cup: '亚洲杯', colors: ['#c60c30', '#ffffff'] },
  { id: 'BEL', name: '比利时', strength: 84, cup: '欧洲杯', colors: ['#111111', '#f2c500'] },
  { id: 'EGY', name: '埃及', strength: 72, cup: '非洲杯', colors: ['#ce1126', '#ffffff'] },
  { id: 'COL', name: '哥伦比亚', strength: 80, cup: '美洲杯', colors: ['#fcd116', '#003893'] },
  { id: 'HUN', name: '匈牙利', strength: 76, cup: '欧洲杯', colors: ['#ce2939', '#ffffff'] },
  { id: 'POL', name: '波兰', strength: 78, cup: '欧洲杯', colors: ['#ffffff', '#dc143c'] },
  { id: 'URU', name: '乌拉圭', strength: 82, cup: '美洲杯', colors: ['#5ca9d6', '#ffffff'] },
  { id: 'CAN', name: '加拿大', strength: 74, cup: '美洲杯', colors: ['#d80621', '#ffffff'] },
  { id: 'MAR', name: '摩洛哥', strength: 80, cup: '非洲杯', colors: ['#c1272d', '#006233'] },
  { id: 'ARM', name: '亚美尼亚', strength: 64, cup: '欧洲杯', colors: ['#d90012', '#0033a0'] },
  { id: 'USA', name: '美国', strength: 76, cup: '美洲杯', colors: ['#b22234', '#3c3b6e'] },
  { id: 'SRB', name: '塞尔维亚', strength: 77, cup: '欧洲杯', colors: ['#c6363c', '#0c4076'] },
];

export const SURNAMES = '李王张刘陈杨赵黄周吴徐孙马朱胡郭何高林罗郑梁谢宋唐韩冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎易常武乔贺赖龚文'.split('');
export const GIVEN = '伟 浩 宇 轩 然 杰 磊 涛 鹏 辰 睿 博 昊 霖 泽 瀚 骁 驰 锐 晨 航 越 帆 峰 凯 翔 皓 旭 明 远 毅 烁 源 啸 霆 煜 铭 哲 麟 岳'.split(' ');

export const RIVAL_NAMES = [
  '姆巴佩', '哈兰德', '贝林厄姆', '维尼修斯', '亚马尔', '萨卡', '穆西亚拉', '维尔茨', '罗德里', '萨拉赫',
  '凯恩', '劳塔罗', '佩德里', '德布劳内', '厄德高', '福登', '莱万多夫斯基', '格列兹曼', '赖斯', '巴尔韦德',
  '阿尔瓦雷斯', '奥斯梅恩', '莱奥', '克瓦拉茨赫利亚', '久保建英', '孙兴慜', '拉菲尼亚', '帕尔默', '登贝莱', '伊萨克',
];

export const SKINS = ['#f6d7c3', '#eac09a', '#d1a176', '#a8764f', '#6f4a31'];
export const HAIRS = ['#1b1b1b', '#4a2f1d', '#8b5a2b', '#d9b36c', '#b8442b'];
export const HAIR_STYLES = ['寸头', '短发', '卷发', '长发', '莫西干', '光头'];
export const EYES = ['#3b2a1a', '#2f5e8a', '#3f7a4a', '#1c1c1c'];

export const COACH_NAMES = ['安切洛蒂', '瓜迪奥拉', '克洛普', '阿尔特塔', '西蒙尼', '恩里克', '阿隆索', '孔蒂', '图赫尔', '波切蒂诺', '斯帕莱蒂', '纳格尔斯曼', '弗里克', '斯洛特', '因扎吉', '马雷斯卡', '阿莫林', '德泽尔比', '滕哈赫', '科瓦奇'];
export const COACH_STYLES: { style: string; desc: string; rel: [number, number]; young?: boolean; old?: boolean }[] = [
  { style: '青春风暴', desc: '大胆起用年轻人', rel: [55, 72], young: true },
  { style: '信任老将', desc: '偏爱经验丰富的球员', rel: [55, 72], old: true },
  { style: '铁血纪律', desc: '作风严厉，一切用表现说话', rel: [40, 55] },
  { style: '进攻哲学', desc: '推崇华丽的进攻足球', rel: [50, 68] },
  { style: '务实防守', desc: '重视防守与整体纪律', rel: [48, 64] },
];

/** 各联赛的本地媒体 */
export const MEDIA: Record<string, string[]> = {
  ENG: ['《太阳报》', '天空体育', 'BBC 体育', '《每日邮报》'],
  ESP: ['《马卡报》', '《阿斯报》', '《每日体育报》', '《世界体育报》'],
  ITA: ['《米兰体育报》', '《都灵体育报》', '《罗马体育报》'],
  GER: ['《踢球者》', '《图片报》', '天空体育德国'],
  FRA: ['《队报》', 'RMC 体育', '《巴黎人报》'],
  NED: ['《电讯报》', '《国际足球》', 'ESPN 荷兰'],
  CHN: ['《体坛周报》', '《足球报》', '新浪体育', '懂球帝'],
  ASI: ['亚足联官网', '《体坛周报》'],
};
export const PARTNER_NAMES = ['林小雨', '苏菲亚', '陈可欣', '艾玛', '伊莎贝拉', '王思琪', '露西亚', '佐藤由奈', '米娅', '赵婉清', '克拉拉', '周子涵'];

export interface RosterSeed {
  name: string;
  number: number;
  pos: Pos;
  nation: string;
  ovr: number;
  role: '队长' | '核心' | '主力' | '轮换' | '青训';
  note: string;
}

/** 2025/26 赛季的可辨认一线队名单。其余球队使用同一套真实球员池补齐。 */
export const REAL_ROSTERS: Record<string, RosterSeed[]> = {
  mci: [
    { name: '哈兰德', number: 9, pos: 'ST', nation: 'NED', ovr: 91, role: '核心', note: '禁区里最早到位的人' },
    { name: '德布劳内', number: 17, pos: 'AM', nation: 'BEL', ovr: 88, role: '核心', note: '一脚传球能改变比赛' },
    { name: '罗德里', number: 16, pos: 'CM', nation: 'ESP', ovr: 90, role: '队长', note: '把节奏握在脚下' },
    { name: '福登', number: 47, pos: 'WG', nation: 'ENG', ovr: 87, role: '主力', note: '从青训楼一路走到主场灯光下' },
    { name: '鲁本·迪亚斯', number: 3, pos: 'CB', nation: 'POR', ovr: 87, role: '主力', note: '后防线的声音' },
    { name: '贝尔纳多·席尔瓦', number: 20, pos: 'AM', nation: 'POR', ovr: 88, role: '主力', note: '小空间里的魔术师' },
  ],
  liv: [
    { name: '萨拉赫', number: 11, pos: 'WG', nation: 'EGY', ovr: 89, role: '核心', note: '右路一拿球，看台就会起身' },
    { name: '范戴克', number: 4, pos: 'CB', nation: 'NED', ovr: 89, role: '队长', note: '安菲尔德的定海神针' },
    { name: '阿利松', number: 1, pos: 'CB', nation: 'BRA', ovr: 89, role: '主力', note: '最后一道防线，也能发起进攻' },
    { name: '麦卡利斯特', number: 10, pos: 'CM', nation: 'ARG', ovr: 86, role: '主力', note: '把脏活做得很漂亮' },
    { name: '索博斯洛伊', number: 8, pos: 'CM', nation: 'HUN', ovr: 84, role: '主力', note: '跑动永远比比赛多一步' },
    { name: '路易斯·迪亚斯', number: 7, pos: 'WG', nation: 'COL', ovr: 85, role: '主力', note: '边线附近不肯停下的人' },
  ],
  ars: [
    { name: '萨卡', number: 7, pos: 'WG', nation: 'ENG', ovr: 86, role: '核心', note: '海布里的孩子，左脚很安静' },
    { name: '厄德高', number: 8, pos: 'AM', nation: 'NED', ovr: 87, role: '队长', note: '抬头之前，答案已经在脚下' },
    { name: '赖斯', number: 41, pos: 'CM', nation: 'ENG', ovr: 86, role: '主力', note: '把中场每一块草皮都跑过' },
    { name: '萨利巴', number: 2, pos: 'CB', nation: 'FRA', ovr: 86, role: '主力', note: '防线最年轻的安静大个子' },
    { name: '马丁内利', number: 11, pos: 'WG', nation: 'BRA', ovr: 83, role: '主力', note: '反击时像被风推着跑' },
    { name: '热苏斯', number: 9, pos: 'ST', nation: 'BRA', ovr: 82, role: '轮换', note: '训练场上第一个到的人' },
  ],
  mun: [
    { name: '布鲁诺·费尔南德斯', number: 8, pos: 'AM', nation: 'POR', ovr: 86, role: '队长', note: '每一次丢球都想马上追回来' },
    { name: '卡塞米罗', number: 18, pos: 'CM', nation: 'BRA', ovr: 84, role: '主力', note: '知道什么时候该犯规' },
    { name: '拉什福德', number: 10, pos: 'WG', nation: 'ENG', ovr: 83, role: '核心', note: '从社区球场走出来的孩子' },
    { name: '梅努', number: 37, pos: 'CM', nation: 'ENG', ovr: 79, role: '主力', note: '老特拉福德的新声音' },
    { name: '利桑德罗·马丁内斯', number: 6, pos: 'CB', nation: 'ARG', ovr: 84, role: '主力', note: '身高不是他的答案' },
    { name: '霍伊伦', number: 11, pos: 'ST', nation: 'DEN', ovr: 80, role: '主力', note: '还在学会如何扛住一整座球场' },
  ],
  rma: [
    { name: '姆巴佩', number: 9, pos: 'ST', nation: 'FRA', ovr: 92, role: '核心', note: '一旦启动，后卫只能回头' },
    { name: '维尼修斯', number: 7, pos: 'WG', nation: 'BRA', ovr: 90, role: '核心', note: '边线是他最熟悉的朋友' },
    { name: '贝林厄姆', number: 5, pos: 'AM', nation: 'ENG', ovr: 90, role: '核心', note: '关键时刻总会出现在镜头里' },
    { name: '巴尔韦德', number: 15, pos: 'CM', nation: 'URU', ovr: 88, role: '主力', note: '像一台没有低电量提示的机器' },
    { name: '吕迪格', number: 22, pos: 'CB', nation: 'GER', ovr: 86, role: '主力', note: '先把气势传给队友' },
    { name: '库尔图瓦', number: 1, pos: 'CB', nation: 'BEL', ovr: 89, role: '主力', note: '球门在他身后变得很小' },
  ],
  bar: [
    { name: '莱万多夫斯基', number: 9, pos: 'ST', nation: 'POL', ovr: 89, role: '核心', note: '禁区里的老派答案' },
    { name: '拉菲尼亚', number: 11, pos: 'WG', nation: 'BRA', ovr: 85, role: '主力', note: '边路的每一步都带着火气' },
    { name: '佩德里', number: 8, pos: 'CM', nation: 'ESP', ovr: 86, role: '核心', note: '停球时，时间会慢半拍' },
    { name: '亚马尔', number: 19, pos: 'WG', nation: 'ESP', ovr: 86, role: '主力', note: '还没长大，已经敢要球' },
    { name: '加维', number: 6, pos: 'CM', nation: 'ESP', ovr: 83, role: '主力', note: '每一次拼抢都像最后一次' },
    { name: '阿劳霍', number: 4, pos: 'CB', nation: 'URU', ovr: 86, role: '队长', note: '后防线的门闩' },
  ],
  fcb: [
    { name: '凯恩', number: 9, pos: 'ST', nation: 'ENG', ovr: 90, role: '核心', note: '禁区外也能把球送进角落' },
    { name: '穆西亚拉', number: 42, pos: 'AM', nation: 'GER', ovr: 87, role: '核心', note: '在人缝里找到自己的路' },
    { name: '基米希', number: 6, pos: 'CM', nation: 'GER', ovr: 86, role: '队长', note: '每个角落都有他的指令' },
    { name: '戴维斯', number: 19, pos: 'WG', nation: 'CAN', ovr: 84, role: '主力', note: '从后场冲到前场只需要几秒' },
    { name: '诺伊尔', number: 1, pos: 'CB', nation: 'GER', ovr: 86, role: '主力', note: '门将也可以是第十一名后卫' },
    { name: '于帕梅卡诺', number: 2, pos: 'CB', nation: 'FRA', ovr: 84, role: '主力', note: '喜欢把危险挡在第一步' },
  ],
  psg: [
    { name: '登贝莱', number: 10, pos: 'WG', nation: 'FRA', ovr: 86, role: '核心', note: '下一步永远猜不到' },
    { name: '阿什拉夫', number: 2, pos: 'WG', nation: 'MAR', ovr: 85, role: '主力', note: '边后卫也想成为边锋' },
    { name: '马尔基尼奥斯', number: 5, pos: 'CB', nation: 'BRA', ovr: 85, role: '队长', note: '巴黎夜色里的老队长' },
    { name: '维蒂尼亚', number: 17, pos: 'CM', nation: 'POR', ovr: 85, role: '主力', note: '用小动作把大局面理顺' },
    { name: '多纳鲁马', number: 1, pos: 'CB', nation: 'ITA', ovr: 86, role: '主力', note: '扑救前先看一眼队友' },
    { name: '法比安·鲁伊斯', number: 8, pos: 'CM', nation: 'ESP', ovr: 82, role: '轮换', note: '左脚会把球送到很远的地方' },
  ],
  int: [
    { name: '劳塔罗', number: 10, pos: 'ST', nation: 'ARG', ovr: 88, role: '队长', note: '禁区里总有第二次机会' },
    { name: '巴雷拉', number: 23, pos: 'CM', nation: 'ITA', ovr: 86, role: '核心', note: '蓝黑色中场的心跳' },
    { name: '巴斯托尼', number: 95, pos: 'CB', nation: 'ITA', ovr: 86, role: '主力', note: '左脚长传像一扇打开的门' },
    { name: '恰尔汗奥卢', number: 20, pos: 'CM', nation: 'TUR', ovr: 86, role: '主力', note: '任意球之前总是很安静' },
    { name: '姆希塔良', number: 22, pos: 'AM', nation: 'ARM', ovr: 82, role: '轮换', note: '知道什么时候该慢下来' },
    { name: '邓弗里斯', number: 2, pos: 'WG', nation: 'NED', ovr: 83, role: '主力', note: '把右路跑成了自己的走廊' },
  ],
  mil: [
    { name: '莱奥', number: 10, pos: 'WG', nation: 'POR', ovr: 87, role: '核心', note: '米兰的风从左边吹来' },
    { name: '普利西奇', number: 11, pos: 'WG', nation: 'USA', ovr: 84, role: '主力', note: '在禁区前沿保持耐心' },
    { name: '特奥', number: 19, pos: 'WG', nation: 'FRA', ovr: 86, role: '主力', note: '后场出发，前场结束' },
    { name: '迈尼昂', number: 16, pos: 'CB', nation: 'FRA', ovr: 87, role: '主力', note: '门线前的第二个教练' },
    { name: '赖因德斯', number: 14, pos: 'CM', nation: 'NED', ovr: 83, role: '主力', note: '把转身做得像呼吸一样' },
    { name: '托莫里', number: 23, pos: 'CB', nation: 'ENG', ovr: 82, role: '主力', note: '追身回防从不犹豫' },
  ],
  juv: [
    { name: '弗拉霍维奇', number: 9, pos: 'ST', nation: 'SRB', ovr: 84, role: '核心', note: '左脚一摆，球场会安静一下' },
    { name: '伊尔迪兹', number: 10, pos: 'AM', nation: 'TUR', ovr: 80, role: '主力', note: '新十号还在写自己的故事' },
    { name: '布雷默', number: 3, pos: 'CB', nation: 'BRA', ovr: 84, role: '主力', note: '防线里的硬骨头' },
    { name: '坎比亚索', number: 27, pos: 'CM', nation: 'ITA', ovr: 82, role: '主力', note: '左右两边都能找到他' },
    { name: '洛卡特利', number: 5, pos: 'CM', nation: 'ITA', ovr: 82, role: '队长', note: '用一脚出球把压力送走' },
    { name: '什琴斯尼', number: 1, pos: 'CB', nation: 'POL', ovr: 84, role: '主力', note: '门前的最后一声提醒' },
  ],
  shp: [
    { name: '武磊', number: 7, pos: 'ST', nation: 'CHN', ovr: 78, role: '核心', note: '跑位比掌声先到' },
    { name: '奥斯卡', number: 8, pos: 'AM', nation: 'BRA', ovr: 80, role: '核心', note: '比赛慢下来，他就有时间' },
    { name: '蒋光太', number: 3, pos: 'CB', nation: 'CHN', ovr: 75, role: '主力', note: '防线不需要太多话' },
    { name: '颜骏凌', number: 1, pos: 'CB', nation: 'CHN', ovr: 76, role: '主力', note: '熟悉每一束主场灯光' },
    { name: '徐新', number: 6, pos: 'CM', nation: 'CHN', ovr: 73, role: '主力', note: '中场的脏活有人做' },
    { name: '巴尔加斯', number: 10, pos: 'WG', nation: 'ARG', ovr: 78, role: '主力', note: '拿球时总想把比赛拉开' },
  ],
  sdt: [
    { name: '克雷桑', number: 9, pos: 'ST', nation: 'BRA', ovr: 78, role: '核心', note: '禁区里不喜欢浪费时间' },
    { name: '孙准浩', number: 28, pos: 'CM', nation: 'KOR', ovr: 77, role: '主力', note: '把中场的缝隙补好' },
    { name: '高准翼', number: 3, pos: 'CB', nation: 'CHN', ovr: 75, role: '主力', note: '回追时很少回头' },
    { name: '王大雷', number: 14, pos: 'CB', nation: 'CHN', ovr: 77, role: '队长', note: '门前的情绪也是武器' },
    { name: '谢文能', number: 23, pos: 'WG', nation: 'CHN', ovr: 72, role: '轮换', note: '年轻腿脚不知疲倦' },
    { name: '李源一', number: 22, pos: 'CM', nation: 'CHN', ovr: 74, role: '主力', note: '给球队一个稳定的出口' },
  ],
};
