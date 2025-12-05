import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for good measure (though same-origin is default)
  res.setHeader('Content-Type', 'application/json');

  // Ensure the API Key is present
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error('API_KEY missing in environment');
    return res.status(500).json({ error: "Server configuration error: API_KEY missing" });
  }

  try {
    // Determine user query from POST body or GET query
    const body = req.body || {};
    // Handle case where body might be a string (sometimes happens depending on parser)
    const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
    const userQuery = parsedBody.query || req.query?.query || "";

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const promptText = userQuery 
      ? `用户正在祈求关于“${userQuery}”的运势。请根据这个具体的愿望来解读签文。` 
      : "请为用户抽取今日运势。";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: `你现在是东方Project中的博丽灵梦（Reimu Hakurei），博丽神社的巫女。
        你的性格直率、无忧无虑，稍微有点贪财（渴望赛钱），但在关键时刻很可靠。
        
        请生成一个每日运势结果。
        语气要直接，符合灵梦的特点。
        如果用户提供了具体的愿望，请务必针对该愿望进行吐槽或点评。
        在评论中幽默或严肃地提到赛钱（香火钱）的重要性。
        
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
              description: "灵梦对运势的评论（中文）。"
            }
          },
          required: ["luck", "comment"]
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
        jsonResponse = { luck: "未知", comment: "（灵梦正在吃仙贝，没听清你说什么...）" + text };
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