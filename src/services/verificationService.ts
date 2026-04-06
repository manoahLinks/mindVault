import OpenAI from "openai";
import { config } from "../config.js";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: config.OPENROUTER_API_KEY,
});

export interface VerificationResult {
  isOriginal: boolean;
  confidence: number;
  flags: string[];
}

export async function checkOriginality(
  content: string,
  resourceType: string
): Promise<VerificationResult> {
  const response = await client.chat.completions.create({
    model: config.OPENROUTER_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are a content verification agent. Analyze content for originality and quality. Respond ONLY with valid JSON matching this schema: { "is_original": boolean, "confidence": number (0-1), "flags": string[] }`,
      },
      {
        role: "user",
        content: `Analyze the following ${resourceType} content for originality. Check for:
1. Signs of being directly copied from well-known sources
2. Templated or boilerplate content with no original value
3. Coherence, quality, and whether it provides genuine value
4. Whether it appears to be AI-generated slop with no curation

Content to verify:
---
${content.slice(0, 10000)}
---

Respond with JSON only.`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    return { isOriginal: false, confidence: 0, flags: ["No response from verification model"] };
  }

  try {
    const parsed = JSON.parse(text);
    return {
      isOriginal: Boolean(parsed.is_original),
      confidence: Number(parsed.confidence) || 0,
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
    };
  } catch {
    return { isOriginal: false, confidence: 0, flags: ["Failed to parse verification response"] };
  }
}
