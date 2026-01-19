import OpenAI from "openai";

// Configuration for different providers
const getClientConfig = () => {
  const zhipuKey = process.env.ZHIPU_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (zhipuKey) {
    return {
      apiKey: zhipuKey,
      baseURL: "https://open.bigmodel.cn/api/paas/v4/",
      defaultModel: "glm-4-flash", // Free model
    };
  }
  return {
    apiKey: openaiKey,
    baseURL: undefined, // Default OpenAI URL
    defaultModel: "gpt-4o",
  };
};

const config = getClientConfig();

// Initialize OpenAI client (compatible with Zhipu)
const openai = new OpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseURL,
});

export async function generateJSON<T>(prompt: string, systemPrompt: string): Promise<T> {
  if (!config.apiKey) {
    throw new Error("Missing API Key. Please configure ZHIPU_API_KEY or OPENAI_API_KEY in .env.local");
  }

  try {
    const response = await openai.chat.completions.create({
      model: config.defaultModel, 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, 
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    return JSON.parse(content) as T;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}

// Helper with specific temperature
export async function generateJSONWithTemp<T>(
  prompt: string, 
  systemPrompt: string, 
  temperature: number
): Promise<T> {
  if (!config.apiKey) {
    throw new Error("Missing API Key. Please configure ZHIPU_API_KEY or OPENAI_API_KEY in .env.local");
  }

  try {
    const response = await openai.chat.completions.create({
      model: config.defaultModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: temperature,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    return JSON.parse(content) as T;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
