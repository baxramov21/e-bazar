const { createClient } = require('@supabase/supabase-js');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdmin() {
  console.log("Seeding admin user...");

  const adminEmail = "admin@bozor.uz";
  
  // 1. Create user in auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: 'password123',
    email_confirm: true
  });

  if (userError) {
    if (userError.message.includes("already been registered")) {
      console.log("Admin user already exists in auth.users");
    } else {
      console.error("Failed to create admin auth user:", userError.message);
      process.exit(1);
    }
  }

  // 2. Fetch the ID (either newly created or existing)
  const { data: existingUser } = await supabase.auth.admin.listUsers();
  const adminId = existingUser.users.find(u => u.email === adminEmail)?.id;

  if (!adminId) {
    console.error("Could not determine Admin ID.");
    process.exit(1);
  }

  // 3. Upsert profile as 'admin'
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: adminId,
    full_name: 'Bozor Admin',
    role: 'admin',
    kyb_status: 'verified'
  });

  if (profileError) {
    console.error("Failed to upsert admin profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin seeded successfully!");
}

seedAdmin();
