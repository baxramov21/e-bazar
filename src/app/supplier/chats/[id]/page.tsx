import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChatUI from "@/components/chat/ChatUI";

export const dynamic = "force-dynamic";

export default async function SupplierChatRoomPage({ params }: { params: any }) {
  const supabase = await createClient();
  const { id } = await params;

  // Mock ID
  const mockSupplierId = "22222222-2222-2222-2222-222222222222"; 
  const { data: profile } = await supabase.from("profiles").select("id").eq("role", "supplier").limit(1).single();
  const supplierId = profile?.id || mockSupplierId;

  // Fetch the order
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:profiles!buyer_id(company_name, full_name)
    `)
    .eq("id", id)
    .eq("supplier_id", supplierId)
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

  return <ChatUI order={order} messages={messages || []} currentUserId={supplierId} role="supplier" />;
}
