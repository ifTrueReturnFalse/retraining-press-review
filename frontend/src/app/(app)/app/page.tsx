import ChatLayout from "@/components/ChatLayout/ChatLayout";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { conversation: string };
}) {
  const params = await searchParams;
  const conversationId = params?.conversation
    ? Number(params.conversation)
    : undefined;

  return <ChatLayout conversationId={conversationId} />;
}
