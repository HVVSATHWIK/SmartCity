import { GoogleGenAI, Type } from "@google/genai";
import { GeminiDesignResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const designSchema = {
    type: Type.OBJECT,
    properties: {
        action: {
            type: Type.STRING,
            enum: ["add_road"]
        },
        parameters: {
            type: Type.OBJECT,
            properties: {
                length_km: {
                    type: Type.NUMBER,
                    description: "The length of the road in kilometers."
                },
                orientation: {
                    type: Type.STRING,
                    enum: ['north', 'south', 'east', 'west'],
                    description: "The cardinal direction for the road from the city center."
                }
            },
            required: ["length_km", "orientation"]
        }
    },
    required: ["action", "parameters"]
};

export const getDesignFromPrompt = async (prompt: string): Promise<GeminiDesignResponse | string> => {
    const systemInstruction = `
        You are an urban planning AI assistant. Your task is to interpret a user's natural language request for city design and convert it into a structured JSON object.
        The JSON must conform to the provided schema.
        The only valid action is "add_road".
        The parameters for "add_road" must include "length_km" (a number) and "orientation" (a string which can be 'north', 'south', 'east', or 'west').
        If the user's request is unclear or does not specify a length or direction, try your best to interpret the user's request to fit the schema.
        
        Example user prompt: "Create a 15km highway going north"
        Example output: {"action": "add_road", "parameters": {"length_km": 15, "orientation": "north"}}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: designSchema,
            },
        });

        const cleanedText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedText) as GeminiDesignResponse;
    } catch (error) {
        console.error("Error fetching design from Gemini API:", error);
        if (error instanceof Error) {
           return `An error occurred while analyzing the design prompt: ${error.message}`;
        }
        return "An unknown error occurred while analyzing the design prompt.";
    }
};