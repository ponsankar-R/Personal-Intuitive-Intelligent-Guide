// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Initialize the client with your environment variable API Key
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// /**
//  * Upgraded the model from the retired 'gemini-1.5-flash' to the current generation 'gemini-3.5-flash'
//  * (You can also use 'gemini-3.1-flash-lite' if you prefer lower latency/costs)
//  */
// export const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

// export async function generateContent(prompt: string) {
//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   return response.text();
// }


import OpenAI from "openai";

// Initialize OpenAI client configured to point directly to Groq's hardware
const groq = new OpenAI({
  apiKey: process.env.GROK_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Using Meta's flagship open model via Groq's ultra-fast inference
 * Alternatively, you can use 'llama-3.1-8b-instant' for low-latency testing
 */
export const modelName = "llama-3.3-70b-versatile";

export async function generateContent(prompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: modelName,
    
    // This strictly forces Groq to output only valid raw JSON (no backticks)
    response_format: { type: "json_object" }, 
    
    messages: [
      {
        role: "system",
        content: "You are a diagnostic engine. Your output MUST be a single, structurally perfect JSON object matching the exact key signatures requested by the user. Do not wrap code in markdown formatting or triple backticks.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    // Low temperature ensures deterministic, well-formed structural JSON data
    temperature: 0.1, 
  });

  // Extract the cleanly parsed JSON text structure safely
  return response.choices[0]?.message?.content || "{}";
}