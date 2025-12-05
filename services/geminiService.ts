import { FortuneResponse } from "../types";

export const getFortune = async (query?: string): Promise<FortuneResponse> => {
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
      body: JSON.stringify({ query: query || "" }),
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
    
    // Pass through the error message
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};