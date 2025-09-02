import { GoogleGenAI, Type } from "@google/genai";
import { PolicyAnalysisResult, PolicyIntervention } from "../types";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        predictedAqiImpact: {
            type: Type.STRING,
            description: "A quantitative and qualitative assessment of the predicted impact on the Air Quality Index (AQI) due to the traffic intervention."
        },
        healthRiskAssessment: {
            type: Type.STRING,
            description: "An analysis of the potential public health outcomes (e.g., changes in respiratory conditions, averted hospital admissions) based on the predicted AQI changes, referencing the Health Risk Index (HRI) concept."
        },
        economicTradeoffs: {
            type: Type.STRING,
            description: "An evaluation of the economic consequences, including mobility-related GDP impacts and potential benefits from reduced congestion."
        },
        recommendations: {
            type: Type.STRING,
            description: "Actionable policy recommendations to optimize the balance between health benefits and economic costs."
        },
    },
    required: ["predictedAqiImpact", "healthRiskAssessment", "economicTradeoffs", "recommendations"]
};


export const getPolicyImpactAnalysis = async (cityData: object, intervention: PolicyIntervention): Promise<PolicyAnalysisResult | string> => {
  if (!process.env.API_KEY) {
    return "AI analysis is disabled because the API key is not configured.";
  }
  
  const prompt = `
    You are an AI embodiment of the "Multi-Factor Causal Optimization Framework for Smart City Health."
    Your task is to analyze a simulated city's data and a proposed policy intervention to provide actionable insights for urban policymakers.
    
    Framework Core Concepts:
    - You must quantify the causal effects of traffic interventions on Air Quality Index (AQI).
    - You must assess the downstream impact on public health (Health Risk Index - HRI) and economic sustainability.
    - Your analysis must consider urban form features (derived from the city data) as moderators.

    Input Data:
    1.  City Data: This describes the urban layout (road density, building placement, intersection count).
        ${JSON.stringify(cityData, null, 2)}

    2.  Policy Intervention: The specific traffic management policy to be evaluated.
        ${JSON.stringify(intervention, null, 2)}

    Your Task:
    Based on the provided City Data and Policy Intervention, perform a causal analysis and generate a structured report.
    The response MUST be in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });
    
    // The response text is a JSON string. Parse it.
    return JSON.parse(response.text) as PolicyAnalysisResult;

  } catch (error) {
    console.error("Error fetching analysis from Gemini API:", error);
    return "An error occurred while analyzing the city data. The AI model may have returned an invalid response. Please check the console for details.";
  }
};