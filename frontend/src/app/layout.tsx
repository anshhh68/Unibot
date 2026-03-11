import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  title: "UNIBOT — Smart University Chatbot",
  description: "Seamlessly connects students anytime, anywhere. 24/7 AI-powered access to course details, schedules, and administrative procedures.",
  keywords: "university, chatbot, AI, student, courses, education",
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const hasGoogleAuth = googleClientId && !googleClientId.startsWith('your-');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const inner = (
    <AuthProvider>
      {children}
    </AuthProvider>
  );

  return (
    <html lang="en">
      <body>
        {hasGoogleAuth ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            {inner}
          </GoogleOAuthProvider>
        ) : inner}
      </body>
    </html>
  );
}
