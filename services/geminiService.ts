
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

// Always use the named parameter `apiKey`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const solveMathProblem = async (prompt: string): Promise<AIResponse> => {
  try {
    // Correct way to generate content using `ai.models.generateContent`.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Solve this math problem or evaluate this expression: "${prompt}". Provide a clear answer, step-by-step reasoning, and a brief explanation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: "The final numerical or simplified answer.",
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The logical steps taken to reach the solution.",
            },
            explanation: {
              type: Type.STRING,
              description: "A short, helpful explanation of the concepts used.",
            },
          },
          required: ["answer", "steps", "explanation"],
        },
      },
    });

    // Use `response.text` property directly, do not call as a method.
    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text.trim()) as AIResponse;
  } catch (error) {
    console.error("AI Math Solver Error:", error);
    throw error;
  }
};
