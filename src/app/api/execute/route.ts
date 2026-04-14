import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const pistonUrl = process.env.PISTON_API_URL || "http://localhost:2000";

        const response = await fetch(`${pistonUrl}/api/v2/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { message: `Piston error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Execute proxy error:", error);
        return NextResponse.json(
            { message: "Failed to reach code execution service" },
            { status: 502 }
        );
    }
}
