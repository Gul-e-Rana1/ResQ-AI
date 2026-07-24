import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "ResQ AI",
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    services: {
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      database: Boolean(process.env.DATABASE_URL),
      groq: Boolean(process.env.GROQ_API_KEY),
      email: Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST),
    },
  });
}
