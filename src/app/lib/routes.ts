import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // For now, just echo back the message
    // You'll want to replace this with actual AI processing later
    return NextResponse.json({
      message: `Echo: ${message}`,
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
