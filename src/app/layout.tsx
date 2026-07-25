import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "@/index.css";
import { AppProviders } from "@/providers/AppProviders";

export const metadata: Metadata = {
  title: "ResQ AI",
  description:
    "AI-assisted disaster relief coordination for emergencies, approved camps, helplines, and response teams in Pakistan.",
  applicationName: "ResQ AI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
