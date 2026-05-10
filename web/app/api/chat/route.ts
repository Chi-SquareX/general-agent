import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const requestApiKey =
      req.headers.get("x-api-key") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    const response = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(requestApiKey ? { "x-api-key": requestApiKey } : {}),
        ...(process.env.ANTHROPIC_API_KEY && !requestApiKey
          ? { "x-api-key": process.env.ANTHROPIC_API_KEY }
          : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Backend request failed" },
        { status: response.status }
      );
    }

    // Stream the response through
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
