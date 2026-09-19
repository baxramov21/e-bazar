import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChatUI from "@/components/chat/ChatUI";

export const dynamic = "force-dynamic";

export default async function BuyerChatRoomPage({ params }: { params: any }) {
  const supabase = await createClient();
  const { id } = await params;

  // Mock ID
  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; 
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const buyerId = profile?.id || mockBuyerId;

  // Fetch the order
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      supplier:profiles!supplier_id(company_name, full_name)
    `)
    .eq("id", id)
    .eq("buyer_id", buyerId)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  return <ChatUI order={order} messages={messages || []} currentUserId={buyerId} role="buyer" />;
}
