const { createClient } = require('@supabase/supabase-js');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const productNames = [
  "Oliy navli bug'doy", "Zangiota pomidori", "Navoiy sementi M400", "Paxta yog'i", 
  "Samarqand uzumi", "Kalsiyli selitra", "Sariq piyoz", "Mis simi",
  "Toshkent gilosi", "Farg'ona anori", "Shisha idishlar", "Qurilish g'ishti",
  "Temir armatura", "Paxta tolasi", "Makkajo'xori urug'i", "Kartoshka (Qizil)",
  "Olmaliq ruxi", "O'g'it (Ammiak selitrasi)", "Asal (Tog' asali)", "Qovun (Mirzacho'l)",
  "Tarvuz", "G'alla kombayni ehtiyot qismlari", "Dizel yoqilg'isi", "Plastik quvurlar",
  "Qadoqlash qutilari", "Parranda go'shti", "Tuxum (Oliy nav)", "Pishloq",
  "Shakar", "Kungaboqar yog'i"
];

const categories = ["Qishloq xo'jaligi", "Sabzavotlar", "Sanoat", "Oziq-ovqat", "Meva-sabzavot", "Qurilish"];
const units = ["ton", "kg", "litre", "dona", "metr"];
const regions = ["Toshkent viloyati", "Surxondaryo", "Navoiy", "Farg'ona", "Samarqand", "Buxoro", "Xorazm", "Andijon"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log("Seeding database with 30 mock listings...");

  const uniqueEmail = `agro_supplier_${Date.now()}@example.com`;
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: uniqueEmail,
    password: 'password123',
    email_confirm: true
  });

  if (userError) {
    console.error("Failed to create auth user:", userError.message);
    process.exit(1);
  }

  const supplierId = userData.user.id;
  
  await supabase.from('profiles').insert({
    id: supplierId,
    role: 'supplier',
    full_name: 'Jasur Ahmedov (Mega Supplier)',
    company_name: 'Agro-Mega Eksport MChJ',
    region: 'Toshkent viloyati',
    address: 'Qibray tumani',
    tin: '987654321',
    kyb_status: 'verified',
    trust_score: 4.9
  });

  const listingsToInsert = Array.from({ length: 30 }).map((_, i) => ({
    title: `${productNames[i]} - ${i + 1}`,
    category: getRandomItem(categories),
    subcategory: 'Turli xil',
    description: `Eng sifatli ${productNames[i]} mahsuloti. B2B savdo uchun maxsus taklif.`,
    unit: getRandomItem(units),
    price_per_unit: Math.floor(Math.random() * 50000) + 1000,
    currency: 'UZS',
    moq: Math.floor(Math.random() * 100) + 10,
    available_quantity: Math.floor(Math.random() * 10000) + 1000,
    location_region: getRandomItem(regions),
    delivery_regions: ['Toshkent shahri', 'Toshkent viloyati', 'Barcha viloyatlar'],
    delivery_days: Math.floor(Math.random() * 5) + 1,
    delivery_cost_per_ton: Math.floor(Math.random() * 500000),
    stock_status: Math.random() > 0.1 ? 'available' : 'low_stock',
    supplier_id: supplierId
  }));

  const { error: listingsError } = await supabase.from('listings').insert(listingsToInsert);

  if (listingsError) {
    console.error("Failed to insert listings:", listingsError.message);
    process.exit(1);
  }

  console.log("Successfully inserted 30 mock products into the database!");
}

seed().catch(console.error);
