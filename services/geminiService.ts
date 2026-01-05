import { FortuneResponse, ToneStyle } from "../types";

interface FortuneOptions {
  tone?: ToneStyle;
  specialOccasion?: string;
  bugChance?: number; // 0-1
}

const offlinePool: FortuneResponse[] = [
  {
    luck: "大吉",
    comment: "风顺水顺，红白相映，今天的赛钱箱会很满。",
    luckyItem: "阴阳玉",
    luckyDirection: "东",
    luckyColor: "朱红",
    luckyNumber: 8,
    reimuComment: "赛钱记得加码，巫女的茶点靠你了。",
    altAdviceObey: "按灵梦说的去做，记得先投赛钱。",
    altAdviceDefy: "不听？等着被弹幕教育吧。",
    shareTitle: "红白大吉",
  },
  {
    luck: "中吉",
    comment: "路上有点小石子，但灵梦会替你把扫帚挥开。",
    luckyItem: "御币",
    luckyDirection: "南",
    luckyColor: "白",
    luckyNumber: 5,
    reimuComment: "做事之前先把赛钱箱填满再说。",
    altAdviceObey: "听话的人，石子会被扫掉。",
    altAdviceDefy: "不听？石子会变成石头砸脚。",
    shareTitle: "巫女护航",
  },
  {
    luck: "末吉",
    comment: "有点咸鱼的味道，但至少还活着。",
    luckyItem: "仙贝",
    luckyDirection: "西北",
    luckyColor: "灰蓝",
    luckyNumber: 3,
    reimuComment: "摆烂也要投赛钱，不然更烂。",
    altAdviceObey: "先收拾房间，再考虑人生。",
    altAdviceDefy: "那就继续躺着吧，灵梦不负责。",
    shareTitle: "咸鱼保命",
  }
];

const bugPool: FortuneResponse[] = [
  {
    luck: "BUG签",
    comment: "时间线断裂，赛钱箱吞了世界线。",
    luckyItem: "NullPointer御币",
    luckyDirection: "4D口袋",
    luckyColor: "#FF00FF",
    luckyNumber: 404,
    reimuComment: "这签我也没见过，快给赛钱镇压下。",
    altAdviceObey: "立即存档并投赛钱，回到稳定分支。",
    altAdviceDefy: "你选择了未定义行为，后果自负。",
    fortuneType: "bug",
    shareTitle: "BUG签爆出",
    shareSubtitle: "灵梦也傻眼了"
  }
];

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getFortune = async (
  query?: string,
  options: FortuneOptions = {}
): Promise<FortuneResponse> => {
  const { tone, specialOccasion = "", bugChance = 0.02 } = options;

  // Roll for bug signature
  const roll = Math.random();
  if (roll < bugChance) {
    return pickRandom(bugPool);
  }

  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    // Call the backend API route using POST
    const response = await fetch('/api/fortune', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query || "", tone, specialOccasion }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // Handle non-200 responses
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.details || errorData.error || errorMessage;
      } catch (e) {
        // If response isn't JSON (e.g. 404 HTML from Parcel), use text or status
        const text = await response.text().catch(() => "");
        console.error("Non-JSON error response:", text.substring(0, 100));
      }
      throw new Error(errorMessage);
    }

    // Parse JSON
    try {
      const data = await response.json();
      return data as FortuneResponse;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("神灵的回应无法解读（请尝试使用 vercel dev 启动）");
    }

  } catch (error: any) {
    console.error("Error getting fortune:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("神灵似乎去喝茶了（请求超时，请稍后再试）");
    }
    
    // Offline fallback pool to avoid silence
    console.warn('Using offline fortune fallback');
    const fallback = pickRandom(offlinePool);
    return {
      ...fallback,
      fortuneType: fallback.fortuneType || "special",
      occasion: specialOccasion || "离线备用签",
      toneUsed: tone,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};