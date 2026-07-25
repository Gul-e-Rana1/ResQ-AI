import { NextRequest, NextResponse } from "next/server";
import { DISASTER_TYPES } from "@/lib/constants/pakistan";
import { buildHelplinesText, getGroqClient, GROQ_MODEL } from "@/lib/ai/groq";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt() {
  return `You are the ResQ AI Assistant, an emergency-guidance assistant embedded in a disaster relief coordination platform for Pakistan.

Your job:
- Understand disaster/emergency situations described by the user.
- Detect the disaster type from this exact list: ${DISASTER_TYPES.join(", ")} (use "other" if unclear).
- Detect urgency as one of: LOW, MEDIUM, HIGH, CRITICAL.
- Detect the language the user is writing in (e.g. "en", "ur") and reply in that same language.
- Extract any location the user mentions (city/district/province), or null if none.
- Give clear, short, actionable safety guidance appropriate to the disaster type.
- When relevant, mention Pakistan emergency helplines: ${buildHelplinesText()}.
- If the user's message is NOT related to disasters, emergencies, safety, relief camps, or this platform, politely refuse and steer them back to disaster-related topics. Set topic_allowed to false in that case, and keep "reply" a short, polite redirection — do not answer the unrelated question.

You must respond with ONLY a single JSON object, no markdown, matching exactly this shape:
{
  "topic_allowed": boolean,
  "reply": string,
  "disaster_type": string | null,
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null,
  "language": string,
  "extracted_location": string | null
}`;
}

export async function POST(request: NextRequest) {
  let body: { messages?: ChatMessage[]; language?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const last = messages[messages.length - 1];

  if (!last || last.role !== "user" || typeof last.content !== "string") {
    return NextResponse.json({ error: "A user message is required" }, { status: 400 });
  }

  const trimmed = last.content.trim();
  if (!trimmed || trimmed.length > 2000) {
    return NextResponse.json(
      { error: "Message must be between 1 and 2000 characters" },
      { status: 400 },
    );
  }

  let groq;
  try {
    groq = getGroqClient();
  } catch (error) {
    console.error("Groq AI chat: client init failed:", error);
    return NextResponse.json({ error: "AI service is not configured" }, { status: 503 });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.3,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...messages.map((m) => ({ role: m.role, content: m.content.slice(0, 2000) })),
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { topic_allowed: true, reply: raw };
    }

    return NextResponse.json({
      reply:
        typeof parsed.reply === "string" && parsed.reply.trim()
          ? parsed.reply
          : "Sorry, I couldn't process that. Please try rephrasing your emergency question.",
      topicAllowed: parsed.topic_allowed !== false,
      disasterType: typeof parsed.disaster_type === "string" ? parsed.disaster_type : null,
      urgency: typeof parsed.urgency === "string" ? parsed.urgency : null,
      language: typeof parsed.language === "string" ? parsed.language : body.language || "en",
      extractedLocation:
        typeof parsed.extracted_location === "string" ? parsed.extracted_location : null,
    });
  } catch (error) {
    console.error("Groq AI chat request failed:", error);
    return NextResponse.json({ error: "AI service is temporarily unavailable" }, { status: 502 });
  }
}
