import { serverFetch } from "@/services/serverApi";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Veuillez vous connecter" },
      { status: 401 },
    );
  }

  const body = await request.json();
  
  const data = await serverFetch(
    `/conversations/${body.conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message: body.message }),
    },
  );

  return NextResponse.json(data);
}
