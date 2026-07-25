import Groq from "groq-sdk";
import { PAKISTAN_EMERGENCY_HELPLINES } from "@/lib/constants/pakistan";

export const GROQ_MODEL = "llama-3.3-70b-versatile";

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }
  return new Groq({ apiKey });
}

export function buildHelplinesText(): string {
  return PAKISTAN_EMERGENCY_HELPLINES.map((h) => `${h.name}: ${h.phone} (${h.scope})`).join("; ");
}
