export type Pos = 'ST' | 'WG' | 'AM' | 'CM' | 'CB';
export type AttrKey = 'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical';
export type Attrs = Record<AttrKey, number>;
export type Role = '青训' | '替补' | '轮换' | '主力' | '核心';
export type TrainPlan = AttrKey | 'balanced' | 'intense' | 'rest';
export type LifePlan = 'focus' | 'social' | 'relax' | 'party' | 'charity';
export type Comp = 'league' | 'cup' | 'cont' | 'intl' | 'youth' | 'tour';
export type HighlightType = 'goal' | 'longshot' | 'freekick' | 'assist' | 'header' | 'tackle' | 'pass' | 'save' | 'miss' | 'celebrate';
export type TrophyKind = 'league' | 'cup' | 'cont' | 'ballon' | 'boot' | 'intl' | 'young' | 'poty' | 'tots';

export interface Look { skin: string; hair: string; style: number; beard: boolean; eye: string }

export interface League { id: string; name: string; short: string; cont: string; cup: string; strength: number; hidden?: boolean }

export interface Club {
  id: string; name: string; short: string; league: string; city: string;
  level: number; rep: number; colors: [string, string]; pattern: number;
}

export interface Nation {
  id: string; name: string; strength: number; cup: string; colors: [string, string];
}

export interface Fixture { comp: Comp; round: string; oppId: string; home: boolean }

export interface MatchResult extends Fixture {
  gf: number; ga: number; pen?: 'W' | 'L';
  played: 'start' | 'sub' | 'bench' | 'out';
  minutes: number; goals: number; assists: number; rating: number;
}

export interface SeasonStats {
  season: number; clubId: string; apps: number; goals: number; assists: number; leagueGoals: number;
  ratingSum: number; rated: number; youth: boolean;
}

export interface TableRow { clubId: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number }

export interface Offer { clubId: string; wage: number; years: number; role: Role; fee: number; renewal?: boolean }

export interface Trophy { name: string; season: number; kind: TrophyKind }

export interface LogEntry { y: number; m: number; text: string; kind: 'good' | 'bad' | 'info' | 'gold' }

export interface Player {
  name: string; nation: string; pos: Pos; foot: '左脚' | '右脚'; look: Look; number: number;
  age: number; attrs: Attrs; potential: number;
  fitness: number; morale: number; fame: number; coachRel: number;
  money: number; wage: number; clubId: string; contractEnd: number; role: Role;
  injury: number; season: SeasonStats; career: SeasonStats[]; trophies: Trophy[];
  history: { label: string; ovr: number; value: number }[];
  caps: number; intlGoals: number; owned: string[]; captain: boolean;
  partner: { name: string; love: number; married: boolean } | null; kids: number;
  raiseSeason: number; talkSeason: number; motm: number;
}

export interface Coach { name: string; style: string; desc: string }

export interface Teammate {
  name: string;
  number: number;
  pos: Pos;
  nation: string;
  ovr: number;
  role: '队长' | '核心' | '主力' | '轮换' | '青训';
  chemistry: number;
  apps: number;
  goals: number;
  assists: number;
  note: string;
}

export type ChanceKind = 'box' | 'long' | 'pass' | 'dribble' | 'defend' | 'header' | 'freekick';

export interface LivePlan {
  f: Fixture; idx: number; played: 'start' | 'sub'; minutes: number; onMin: number;
  teamGoals: number[]; oppGoals: { min: number; defend: boolean }[]; chances: { min: number; kind: ChanceKind }[];
}

export interface LiveOutcome { goals: number; assists: number; prevented: number; ratingAdj: number; pen?: 'W' | 'L'; kinds: ChanceKind[] }

export interface Game {
  version: 1; year: number; month: number; player: Player;
  table: TableRow[]; fixtures: Fixture[];
  cupAlive: boolean; contAlive: boolean; contGroupPts: number; cupWon: boolean; contWon: boolean;
  plan: { train: TrainPlan; life: LifePlan };
  log: LogEntry[]; retired: boolean; offerBoost: number;
  coach: Coach; lifeActs: string[];
  squad: Teammate[];
}
