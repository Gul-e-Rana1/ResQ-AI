import Groq from "groq-sdk";
import { getServerEnv } from "@/lib/env";
import { PAKISTAN_EMERGENCY_HELPLINES } from "@/lib/constants/pakistan";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export function getGroqClient(): Groq {
  const env = getServerEnv();
  return new Groq({ apiKey: env.GROQ_API_KEY });
}

export function buildHelplinesText(): string {
  return PAKISTAN_EMERGENCY_HELPLINES.map((h) => `${h.name}: ${h.phone} (${h.scope})`).join("; ");
}
