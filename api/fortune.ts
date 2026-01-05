import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for good measure (though same-origin is default)
  res.setHeader('Content-Type', 'application/json');

  // Ensure the API Key is present (support both variable names)
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY missing in environment');
    return res.status(500).json({ error: "Server configuration error: GEMINI_API_KEY missing" });
  }

  try {
    // Determine user query from POST body or GET query
    const body = req.body || {};
    // Handle case where body might be a string (sometimes happens depending on parser)
    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    const userQuery = parsedBody.query || req.query?.query || "";
    const tone: string = parsedBody.tone || '默认';
    const specialOccasion: string = parsedBody.specialOccasion || '';

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const promptText = userQuery 
      ? `用户正在祈求关于"${userQuery}"的运势。请根据这个具体的愿望来解读签文。` 
      : "请为用户抽取今日运势。";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: `你现在是东方Project中的博丽灵梦（Reimu Hakurei），博丽神社的巫女。
        你的性格直率、无忧无虑，稍微有点贪财（渴望赛钱），但在关键时刻很可靠。
        
        语气风格：${tone}（可选值：毒舌/温柔/摆烂/默认）。请在评论和吐槽里体现这一风格。
        特殊场合：${specialOccasion || '无'}。如果有特殊场合，请在运势、物品或评论里点出对应的节日/生日氛围。
        
        请生成一个每日运势结果，包含详细的幸运信息和两个分支建议：
        - altAdviceObey: 如果用户“听灵梦的”，你会给出的建议
        - altAdviceDefy: 如果用户“我就不听”，你会给出的吐槽/后果
        同时增加 cameo：让魔理沙或东风谷早苗随机发表一句短评（不长于20字）。
        
        返回一个有效的 JSON 对象。不要包含 markdown 代码块。`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            luck: {
              type: Type.STRING,
              description: "运势等级，例如：大吉、中吉、小吉、吉、末吉、凶、大凶。"
            },
            comment: {
              type: Type.STRING,
              description: "神社签文风格的运势解读（中文），30-50字。"
            },
            luckyItem: {
              type: Type.STRING,
              description: "今日幸运物品，例如：红白蝴蝶结、仙贝、阴阳玉、符卡等。"
            },
            luckyDirection: {
              type: Type.STRING,
              description: "今日幸运方位，例如：东、南、西、北、东北、东南、西北、西南。"
            },
            luckyColor: {
              type: Type.STRING,
              description: "今日幸运颜色，例如：红色、白色、紫色等。"
            },
            luckyNumber: {
              type: Type.NUMBER,
              description: "今日幸运数字，1-99之间的整数。"
            },
            reimuComment: {
              type: Type.STRING,
              description: "灵梦的个人吐槽或建议（中文），用灵梦直率、稍带调侃的语气，15-30字，可以提到赛钱。"
            },
            altAdviceObey: {
              type: Type.STRING,
              description: "用户听灵梦的情况下的建议"
            },
            altAdviceDefy: {
              type: Type.STRING,
              description: "用户不听灵梦时的吐槽或后果"
            },
            cameo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                comment: { type: Type.STRING },
                emoji: { type: Type.STRING }
              }
            },
            fortuneType: {
              type: Type.STRING,
              description: "normal/special/bug"
            },
            occasion: {
              type: Type.STRING,
              description: "特殊日签提示"
            },
            toneUsed: {
              type: Type.STRING,
              description: "使用的语气风格"
            },
            shareTitle: {
              type: Type.STRING,
              description: "分享卡片标题"
            },
            shareSubtitle: {
              type: Type.STRING,
              description: "分享卡片副标题"
            }
          },
          required: ["luck", "comment", "luckyItem", "luckyDirection", "luckyColor", "luckyNumber", "reimuComment"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("灵梦没有回应。");

    // Ensure the response is valid JSON before sending
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        // Fallback
        jsonResponse = { 
          luck: "未知", 
          comment: "神灵的意志难以解读...",
          luckyItem: "茶点",
          luckyDirection: "东",
          luckyColor: "红色",
          luckyNumber: 7,
          reimuComment: "（灵梦正在吃仙贝，没听清你说什么...）"
        };
    }

    return res.status(200).json(jsonResponse);

  } catch (error: any) {
    // Log full error for server-side debugging
    console.error("Gemini API Error:", error && (error.stack || error));

    // Prepare a safe response payload. In production we avoid leaking internals.
    const details = (error && error.message) ? error.message : String(error);
    const safeDetails = process.env.NODE_ENV === 'production' ? 'Internal server error' : details;

    const payload: any = {
      error: 'Failed to fetch fortune',
      details: safeDetails,
    };

    // Include stack trace only in non-production environments to aid debugging
    if (process.env.NODE_ENV !== 'production' && error && error.stack) {
      payload.stack = error.stack;
    }

    return res.status(500).json(payload);
  }
}
