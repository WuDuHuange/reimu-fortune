export interface FortuneResponse {
  luck: string;
  comment: string;
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