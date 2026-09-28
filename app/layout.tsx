import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "MF Navarro — Multimedia Designer",
  description:
    "Multimedia Designer creating brand identities, marketing content, motion graphics, e-commerce, photo and video, and visual experiences for brands and products.",
  openGraph: {
    title: "MF Navarro — Multimedia Designer",
    description:
      "Multimedia Designer creating brand identities, marketing content, motion graphics, e-commerce, photo and video, and visual experiences for brands and products.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MF Navarro — Multimedia Designer",
    description:
      "Multimedia Designer creating brand identities, marketing content, motion graphics, e-commerce, photo and video, and visual experiences for brands and products.",
  },
  icons: { icon: "data:," },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
