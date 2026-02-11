import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
