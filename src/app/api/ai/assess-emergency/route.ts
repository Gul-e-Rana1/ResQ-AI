import { NextRequest, NextResponse } from "next/server";
import { DISASTER_TYPES } from "@/lib/constants/pakistan";
import { getGroqClient, GROQ_MODEL } from "@/lib/ai/groq";

export const runtime = "nodejs";

function buildSystemPrompt() {
  return `You are an emergency triage assistant for ResQ AI, a disaster relief platform in Pakistan. Given a description of an emergency, assess it and respond with ONLY a single JSON object, no markdown, matching exactly this shape:
{
  "disaster_type": one of [${DISASTER_TYPES.join(", ")}],
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "risk_level": "low" | "medium" | "high",
  "summary": a one-sentence neutral summary of the situation,
  "suggested_actions": an array of 3-5 short, concrete, immediately actionable safety steps for the people affected while help is on the way
}
Base urgency on threat to life, number of people affected, and time sensitivity. If the description is not actually describing an emergency, still return your best-effort classification with urgency "LOW".`;
}

export async function POST(request: NextRequest) {
  let body: { title?: string; description?: string; peopleCount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = (body.title || "").trim();
  const description = (body.description || "").trim();

  if (!description || description.length > 2000) {
    return NextResponse.json(
      { error: "Description is required and must be under 2000 characters" },
      { status: 400 },
    );
  }

  let groq;
  try {
    groq = getGroqClient();
  } catch {
    return NextResponse.json({ error: "AI service is not configured" }, { status: 503 });
  }

  const userContent = `Title: ${title || "N/A"}\nDescription: ${description}\nPeople affected: ${
    body.peopleCount ?? "unknown"
  }`;

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const suggestedActions = Array.isArray(parsed.suggested_actions)
      ? (parsed.suggested_actions as unknown[]).filter((a): a is string => typeof a === "string").slice(0, 5)
      : [];

    return NextResponse.json({
      disasterType: DISASTER_TYPES.includes(parsed.disaster_type as never)
        ? parsed.disaster_type
        : "other",
      urgency: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.urgency as string)
        ? parsed.urgency
        : "MEDIUM",
      riskLevel: ["low", "medium", "high"].includes(parsed.risk_level as string)
        ? parsed.risk_level
        : "medium",
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      suggestedActions,
    });
  } catch (error) {
    console.error("Groq AI assessment request failed:", error);
    return NextResponse.json({ error: "AI service is temporarily unavailable" }, { status: 502 });
  }
}
