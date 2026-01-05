export type ToneStyle = '毒舌' | '温柔' | '摆烂';

export interface CameoComment {
  name: '魔理沙' | '早苗';
  comment: string;
  emoji?: string;
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
