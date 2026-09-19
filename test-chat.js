const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from("chat_messages").insert({
    order_id: "a059f3af-3ef8-46b4-b829-71052ced7c41", // from screenshot
    sender_id: "11111111-1111-1111-1111-111111111111",
    content: "Test"
  });
  console.log("Error:", error);
}
test();
