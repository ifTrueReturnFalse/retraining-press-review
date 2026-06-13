import { RawConversationResponse } from "@/models/chatModel";
import { serverFetch } from "@/services/serverApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const parameters = await params;
  const data = await serverFetch<RawConversationResponse>(
    `/conversations/${parameters.id}`,
    { method: "GET" },
  );

  return NextResponse.json(data);
}
