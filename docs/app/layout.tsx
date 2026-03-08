import { RootProvider } from "fumadocs-ui/provider/next";
import { Inconsolata, Rubik } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./global.css";

const mainFont = Rubik({
  subsets: ["latin"],
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});

export const metadata: Metadata = {
  title: "decoders | Elegant validation library for TypeScript",
  description:
    "Elegant and battle-tested validation library for type-safe input data for TypeScript.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${mainFont.className} ${inconsolata.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
