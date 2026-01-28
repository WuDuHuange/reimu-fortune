export type ToneStyle = '毒舌' | '温柔' | '摆烂';

export interface CameoComment {
  name: '魔理沙' | '早苗';
  comment: string;
  emoji?: string;
}

// ============ 赛钱经济系统类型 ============

export interface SaisenData {
  balance: number;           // 当前余额
  totalDonated: number;      // 累计捐赠额（用于称号计算）
  lastLoginDate: string;     // 上次登录日期 YYYY-MM-DD
  consecutiveDays: number;   // 连续登录天数
  lastInterestDate: string;  // 上次利息结算日期
  noSpendDays: number;       // 连续未消费天数（用于利息）
  dailySweepCount: number;   // 今日扫除次数
  dailyYoukaiCount: number;  // 今日退治次数
  unlockedItems: string[];   // 已解锁物品ID
}

export type TitleLevel = 0 | 1 | 2 | 3 | 4;

export interface TitleInfo {
  level: TitleLevel;
  name: string;
  description: string;
  minDonation: number;
}

export const TITLES: TitleInfo[] = [
  { level: 0, name: '贫乏神附体', description: '灵梦都不想正眼看你', minDonation: 0 },
  { level: 1, name: '普通参拜客', description: '给口茶喝（白开水）', minDonation: 1000 },
  { level: 2, name: '冤大头施主', description: '给好茶喝，有坐垫', minDonation: 5000 },
  { level: 3, name: '幻想乡的ATM', description: '灵梦会用敬语', minDonation: 20000 },
  { level: 4, name: '可以在神社横着走', description: '解锁隐藏特效', minDonation: 100000 },
];

// 阴阳玉表情状态
export type OrbMood = 
  | 'idle'       // 待机 ( ￣ー￣)
  | 'hungry'     // 想要钱 ( ﹃_﹃ )
  | 'rich'       // 收到钱 ( $ω$ )
  | 'poor'       // 嫌钱少 ( ¬_¬ )
  | 'angry'      // 生气 ( # ﾟДﾟ)
  | 'smug'       // 装傻 ( ͡° ͜ʖ ͡°)
  | 'shy'        // 背身 ( / / / )
  | 'happy'      // 开心 (◕‿◕)
  | 'shocked'    // 震惊 (°Д°)
  | 'error';     // 死机 [ ERROR ]

export const ORB_FACES: Record<OrbMood, string> = {
  idle: '( ￣ー￣)',
  hungry: '( ﹃_﹃ )',
  rich: '( $ω$ )',
  poor: '( ¬_¬ )',
  angry: '( #ﾟДﾟ)',
  smug: '( ͡° ͜ʖ ͡°)',
  shy: '( / / / )',
  happy: '(◕‿◕)',
  shocked: '(°Д°)',
  error: '[ ERROR ]',
};

// 改命服务类型
export type FateAlterationType = 'sloppy' | 'premium' | 'luxury';

export interface FateAlterationConfig {
  type: FateAlterationType;
  cost: number;
  name: string;
  description: string;
}

export const FATE_ALTERATION_OPTIONS: FateAlterationConfig[] = [
  { type: 'sloppy', cost: 500, name: '敷衍版', description: '划掉文字，简单批注' },
  { type: 'premium', cost: 2000, name: '尊享版', description: '红色大印章+完整批注' },
  { type: 'luxury', cost: 10000, name: '土豪版', description: '金闪闪特效+魔理沙乱入' },
];

// 第三方监管彩蛋类型
export type InterventionType = 'yukari' | 'suika' | null;

export interface InterventionEvent {
  type: InterventionType;
  character: string;
  message: string;
  effect: string;
}

export interface FortuneResponse {
  luck: string;
  comment: string;
  // Extended fortune details
  luckyItem?: string;      // 幸运物品
  luckyDirection?: string; // 幸运方位
  luckyColor?: string;     // 幸运颜色
  luckyNumber?: number;    // 幸运数字
  reimuComment?: string;   // 灵梦吐槽
  altAdviceObey?: string;  // 听灵梦的
  altAdviceDefy?: string;  // 我就不听
  cameo?: CameoComment;    // 彩蛋角色点评
  fortuneType?: 'normal' | 'special' | 'bug';
  occasion?: string;       // 特殊日签提示
  toneUsed?: ToneStyle;    // 使用的语气
  shareTitle?: string;     // 分享卡片标题
  shareSubtitle?: string;  // 分享卡片副标题
}

export interface ReimuState {
  status: 'idle' | 'shaking' | 'result' | 'error';
  fortune: FortuneResponse | null;
  errorMessage?: string;
}

// GSAP global definition since we are using CDN
declare global {
  interface Window {
    gsap: any;
  }
}
