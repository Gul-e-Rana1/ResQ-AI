import type { AppProps } from "next/app";
import { AppProviders } from "@/providers/AppProviders";
import "@/index.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
