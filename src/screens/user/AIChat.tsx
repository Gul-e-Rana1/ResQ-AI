import React, { useState, useRef, useEffect } from "react";
import {
  Send, MapPin, ChevronRight, RotateCcw, Bot, User, Loader2, Zap
} from "lucide-react";
import { Badge } from "../../components/ui";
import { sanitizeAndFormatMarkdown } from "../../lib/security";
import { sendAiChatMessage } from "@/lib/services/ai";
import { recommendCamps, type CampRecommendation } from "@/lib/services/camps";
import { useGeolocation } from "@/hooks/useGeolocation";
import { DISASTER_TYPES } from "@/lib/constants/pakistan";
import { AI_CHAT_STORAGE_KEY } from "@/lib/constants/storage";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "camps";
  camps?: CampRecommendation[];
}

const suggestedPrompts = [
  "What should I do during a flood?",
  "Find camps near me with capacity",
  "How do I submit an emergency?",
  "What's the risk level in my area?",
  "What to pack in an emergency kit?",
  "How do I evacuate safely?",
];

const initialMessages: Message[] = [
  {
    id: "init",
    role: "assistant",
    content: "Hello! I'm ResQ AI, your emergency response assistant.\n\nI can help you find nearby relief camps, provide emergency guidance, assess risk levels, and guide you through the relief process. What do you need help with today?",
    timestamp: "09:14 AM",
    type: "text",
  },
];

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

function loadStoredMessages(): Message[] {
  if (typeof window === "undefined") return initialMessages;
  try {
    const raw = window.sessionStorage.getItem(AI_CHAT_STORAGE_KEY);
    if (!raw) return initialMessages;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMessages;
  } catch {
    return initialMessages;
  }
}

export default function AIChat({ onNavigate }: Props) {
  const [messages, setMessages] = useState<Message[]>(loadStoredMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { coords, locate } = useGeolocation();

  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // sessionStorage unavailable (e.g. private browsing quota) — chat still works in-memory
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await sendAiChatMessage(
        history.map((m) => ({ role: m.role, content: m.content })),
      );

      let campRecs: CampRecommendation[] = [];
      if (res.topicAllowed && res.isEmergency && res.extractedLocation && res.disasterType && coords) {
        const matchedDisasterType = DISASTER_TYPES.find((d) => d === res.disasterType);
        if (matchedDisasterType) {
          try {
            campRecs = await recommendCamps({
              disasterType: matchedDisasterType,
              userLocation: coords,
              limit: 3,
            });
          } catch {
            campRecs = [];
          }
        }
      }

      const assistantMsg: Message = {
        id: Date.now().toString() + "-r",
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        type: campRecs.length > 0 ? "camps" : "text",
        camps: campRecs,
      };
      setMessages((p) => [...p, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: Date.now().toString() + "-e",
        role: "assistant",
        content: "Sorry, the AI assistant is temporarily unavailable, please try again.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      };
      setMessages((p) => [...p, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#059669] rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">ResQ AI Assistant</p>
            <p className="text-xs text-[#059669] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] blink" /> Online · Powered by ResQ AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple">AI Powered</Badge>
          <button
            onClick={() => setMessages(initialMessages)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#64748B] transition-all"
            title="Clear chat"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4 bg-[#F8FAFC]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 fade-in-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} />
              </div>
            )}

            <div className={`max-w-[80%] space-y-3 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === "user"
                    ? "bg-[#2563EB] text-white rounded-tr-sm"
                    : "bg-white border border-[#E2E8F0] text-[#334155] rounded-tl-sm shadow-sm"
                  }`}
              >
                <div
                  className="whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeAndFormatMarkdown(msg.content),
                  }}
                />
              </div>

              {/* Camp cards */}
              {msg.type === "camps" && msg.camps && msg.camps.length > 0 && (
                <div className="space-y-2 w-full">
                  {msg.camps.map((rec) => (
                    <div
                      key={rec.camp.id}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-3 hover:border-[#CBD5E1] hover:shadow-sm cursor-pointer transition-all group"
                      onClick={() => onNavigate("camp_details", rec.camp.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">{rec.camp.name}</p>
                          <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                            <MapPin size={10} />{" "}
                            {rec.distanceKm !== null ? `${rec.distanceKm.toFixed(1)} km` : `${rec.camp.district}, ${rec.camp.province}`} ·{" "}
                            <span className={rec.camp.capacity_available > 20 ? "text-[#059669]" : "text-[#EA580C]"}>
                              {rec.camp.capacity_available} spots available
                            </span>
                          </p>
                        </div>
                        <ChevronRight size={13} className="text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors" />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => onNavigate("nearby_camps")}
                    className="text-xs text-[#2563EB] font-medium hover:underline"
                  >
                    View all camps on map →
                  </button>
                </div>
              )}

              <p className="text-[10px] text-[#94A3B8]">{msg.timestamp}</p>
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start fade-in-up">
            <div className="w-7 h-7 rounded-full bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 2 && (
        <div className="px-4 md:px-6 py-3 bg-white border-t border-[#E2E8F0]">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={11} className="text-[#94A3B8]" />
            <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Quick questions</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => sendMessage(p)}
                className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-xs text-[#334155] hover:bg-[#EFF6FF] hover:border-[#DBEAFE] hover:text-[#2563EB] transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 md:px-6 py-4 bg-white border-t border-[#E2E8F0] flex-shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask me anything about emergency relief..."
              rows={1}
              className="w-full px-4 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] resize-none outline-none hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-2 focus:ring-[#DBEAFE] focus:ring-offset-0 transition-all max-h-32 overflow-y-auto"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-[#94A3B8] mt-2 text-center">
          ResQ AI provides guidance to help you — for life-threatening emergencies, always call emergency services directly.
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => ({ props: {} });
