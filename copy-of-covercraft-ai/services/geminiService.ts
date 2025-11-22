import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
// The API key is expected to be available in process.env.API_KEY
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCoverLetter = async (resumeText: string, jobDescription: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }

  if (!resumeText.trim()) {
    throw new Error("Resume content is missing.");
  }

  if (!jobDescription.trim()) {
    throw new Error("Job description is missing.");
  }

  const modelId = 'gemini-2.5-flash';
  
  const systemInstruction = `
    You are an expert career coach and professional copywriter specializing in crafting high-impact cover letters.
    Your goal is to write a compelling, professional, and personalized cover letter.
    
    Guidelines:
    1. Tone: Professional, confident, and enthusiastic.
    2. Structure: Standard business letter format.
    3. Content: 
       - Analyze the provided RESUME to identify key skills and experiences.
       - Analyze the JOB DESCRIPTION to understand what the employer is looking for.
       - Bridge the gap: Explicitly match the candidate's strongest relevant achievements to the job requirements.
       - Avoid generic fluff; be specific about metrics and results where possible based on the resume.
    4. Formatting: Use clean paragraphs. Do not use placeholders like "[Your Name]" unless the resume doesn't contain the name. Try to infer details from the resume.
    5. Output: Return ONLY the body of the cover letter. Do not include introductory text like "Here is your cover letter".
  `;

  const prompt = `
    RESUME CONTENT:
    ${resumeText}

    ---
    
    JOB DESCRIPTION:
    ${jobDescription}

    ---
    
    Please write a tailored cover letter based on the above information.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slight creativity, but mostly focused
      },
    });

    return response.text || "Failed to generate text.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate cover letter. Please try again.");
  }
};