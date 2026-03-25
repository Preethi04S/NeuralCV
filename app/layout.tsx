import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuralCV | AI Resume Intelligence",
  description: "Paste your resume and job description. Get your ATS score, skills gaps, and rewrite suggestions in seconds. Free. No signup.",
  openGraph: {
    title: "NeuralCV | Know Your Score Before They Do",
    description: "AI-powered resume analysis. ATS score, skills gap, keyword match, and rewrite suggestions in seconds.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
