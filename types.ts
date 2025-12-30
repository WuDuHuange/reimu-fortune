export interface FortuneResponse {
  luck: string;
  comment: string;
  // Extended fortune details
  luckyItem?: string;      // 幸运物品
  luckyDirection?: string; // 幸运方位
  luckyColor?: string;     // 幸运颜色
  luckyNumber?: number;    // 幸运数字
  reimuComment?: string;   // 灵梦吐槽
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