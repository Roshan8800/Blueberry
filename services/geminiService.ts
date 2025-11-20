import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Safe access to process.env to avoid ReferenceError in browser-only environments if not polyfilled
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) || ''; 
const ai = new GoogleGenAI({ apiKey });

/**
 * Uses Gemini to suggest related search terms or categories based on a user's vague input.
 * This powers the "AI Smart Search" feature.
 */
export const getSmartSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!apiKey) {
    // Fallback if no key is present
    console.warn("Gemini API Key missing. Returning basic fallback.");
    return [query, `${query} HD`, `${query} 4K`, "Trending"];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User is searching for adult video content with query: "${query}". 
      Provide 5 related, safe-for-work generic keywords or category tags that might match this intent for a search engine. 
      Return ONLY the comma-separated list of keywords.`,
    });

    const text = response.text || "";
    return text.split(',').map(s => s.trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [query];
  }
};

/**
 * Uses Gemini to generate a catchy description for a video based on its title and tags.
 * Useful for the Admin panel when uploading new videos.
 */
export const generateVideoDescription = async (title: string, tags: string[]): Promise<string> => {
  if (!apiKey) return "No description available.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a captivating, short (2 sentences) description for a video titled "${title}" with tags: ${tags.join(', ')}. Keep it exciting but professional.`,
    });
    return response.text || "Experience premium entertainment.";
  } catch (error) {
    return "Experience premium entertainment.";
  }
};