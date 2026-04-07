import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNIBOT — Smart University Chatbot",
  description: "Seamlessly connects students anytime, anywhere. 24/7 AI-powered access to course details, schedules, and administrative procedures.",
  keywords: "university, chatbot, AI, student, courses, education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Google Identity Services — must load before any GSI calls */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
