import type { Club, League, Nation } from './types';

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
