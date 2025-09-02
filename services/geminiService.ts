
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getCityAnalysis = async (cityData: object): Promise<string> => {
  if (!process.env.API_KEY) {
    return "AI analysis is disabled because the API key is not configured.";
  }
  
  const prompt = `
    You are a professional urban planning and environmental analyst.
    I have a simulation of a smart city. Based on the following data, provide a concise analysis (3-4 sentences) of the city's design.
    Focus on potential traffic flow issues and environmental impact from air pollution.
    Suggest one practical improvement to the layout.

    City Data:
    ${JSON.stringify(cityData, null, 2)}

    Your analysis should be direct and easy to understand for a non-expert.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    // Fix: The response from the Gemini API is an object, not a string.
    return response.text;
  } catch (error) {
    console.error("Error fetching analysis from Gemini API:", error);
    return "An error occurred while analyzing the city data. Please check the console for details.";
  }
};
