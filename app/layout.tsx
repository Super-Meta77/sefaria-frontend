import type React from "react";
import type { Metadata } from "next";
import { Inter, Noto_Sans_Hebrew } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/components/data-provider";
import { LanguageProvider } from "@/components/language-context";
import SiteHeader from "@/components/site-header";
import FooterGate from "@/components/footer-gate";
import { DynamicLangAttribute } from "@/components/dynamic-lang-attribute";
import ClientRoot from "./ClientRoot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const hebrewFont = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-hebrew",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sefaria - Enhanced Digital Library of Jewish Texts",
  description:
    "A modern, enhanced version of Sefaria with AI-powered insights, interactive visualizations, and collaborative annotations.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={`${inter.variable} ${hebrewFont.variable} font-sans antialiased`}>
        <LanguageProvider>
          <DynamicLangAttribute />
          <DataProvider>
            <ClientRoot>{children}</ClientRoot>
            <FooterGate />
          </DataProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
