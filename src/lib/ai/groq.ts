import Groq from "groq-sdk";
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";
import { PAKISTAN_EMERGENCY_HELPLINES } from "@/lib/constants/pakistan";

export const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-safeguard-20b",
  "groq/compound",
  "groq/compound-mini",
] as const;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  return new Groq({ apiKey });
}

export async function createChatCompletionWithFallback(
  groq: Groq,
  params: Omit<ChatCompletionCreateParamsNonStreaming, "model">,
): Promise<ChatCompletion> {
  let lastError: unknown;
  for (const model of GROQ_MODELS) {
    try {
      return await groq.chat.completions.create({ ...params, model, stream: false });
    } catch (error) {
      lastError = error;
      console.error(`Groq model ${model} failed, trying next:`, error);
    }
  }
  throw lastError;
}

export function buildHelplinesText(): string {
  return PAKISTAN_EMERGENCY_HELPLINES.map((h) => `${h.name}: ${h.phone} (${h.scope})`).join("; ");
}