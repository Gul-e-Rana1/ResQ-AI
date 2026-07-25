export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiChatResponse {
  reply: string;
  topicAllowed: boolean;
  disasterType: string | null;
  urgency: string | null;
  language: string;
  extractedLocation: string | null;
}

export async function sendAiChatMessage(
  messages: AiChatMessage[],
  language?: string,
): Promise<AiChatResponse> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, language }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "AI service is unavailable" }));
    throw new Error(body.error || "AI service is unavailable");
  }

  return res.json();
}

export interface AiEmergencyAssessment {
  disasterType: string;
  urgency: string;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  suggestedActions: string[];
}

export async function assessEmergency(input: {
  title: string;
  description: string;
  peopleCount?: number;
}): Promise<AiEmergencyAssessment | null> {
  try {
    const res = await fetch("/api/ai/assess-emergency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
