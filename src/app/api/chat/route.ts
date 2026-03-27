import { NextRequest, NextResponse } from "next/server";
import { getAiResponse } from "@/lib/chat-service";

export async function POST(req: NextRequest) {
  try {
    const { message, userName, role } = await req.json();

    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "Invalid message." }, { status: 400 });
    }

    // Use name from request body (passed from client), fallback gracefully
    const name = (typeof userName === "string" && userName.trim()) ? userName.trim() : 
                  (role === "faculty" ? "Professor" : "Student");

    const aiText = await getAiResponse(message, name);

    return NextResponse.json({
      query_id: Date.now(),
      message,
      response: aiText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
