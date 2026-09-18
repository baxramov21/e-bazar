const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log("Seeding database with mock listings...");

  // 1. Create a mock user in auth.users
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'agro_supplier@example.com',
    password: 'password123',
    email_confirm: true
  });

  if (userError) {
    console.error("Failed to create auth user:", userError.message);
    process.exit(1);
  }

  const supplierId = userData.user.id;
  console.log("Created mock supplier in auth.users:", supplierId);

  // 2. Create the profile for the mock user
  const { error: profileError } = await supabase.from('profiles').insert({
    id: supplierId,
    role: 'supplier',
    full_name: 'Jasur Ahmedov',
    company_name: 'Agro-Export MChJ',
    region: 'Toshkent viloyati',
    address: 'Qibray tumani, 5-uy',
    tin: '123456789',
    kyb_status: 'verified',
    trust_score: 4.8
  });

  if (profileError) {
    console.error("Failed to create profile:", profileError.message);
    process.exit(1);
  }
  
  console.log("Created mock profile in profiles table.");

  // 3. Create 10 mock listings
  const listingsToInsert = [
    {
      title: 'Oliy navli bug\'doy (3-sinf)',
      category: 'Qishloq xo\'jaligi',
      subcategory: 'G\'alla',
      description: 'Qozog\'istondan keltirilgan oliy navli bug\'doy. Namlik 14%.',
      unit: 'ton',
      price_per_unit: 2800000,
      currency: 'UZS',
      moq: 20,
      available_quantity: 500,
      location_region: 'Toshkent viloyati',
      delivery_regions: ['Toshkent shahri', 'Toshkent viloyati', 'Sirdaryo'],
      delivery_days: 2,
      delivery_cost_per_ton: 150000,
      stock_status: 'available',
      supplier_id: supplierId
    },
    {
      title: 'Zangiota qizil pomidori',
      category: 'Sabzavotlar',
      subcategory: 'Pomidor',
      description: 'Eksportbop issiqxona pomidori. Yirik va qattiq.',
      unit: 'kg',
      price_per_unit: 12000,
      currency: 'UZS',
      moq: 500,
      available_quantity: 2000,
      location_region: 'Toshkent viloyati',
      delivery_regions: ['Toshkent shahri'],
      delivery_days: 1,
      delivery_cost_per_ton: 500000,
      stock_status: 'available',
      supplier_id: supplierId
    },
    {
      title: 'Navoiy sementi M400',
      category: 'Sanoat',
      subcategory: 'Qurilish mollari',
      description: 'Zavoddan to\'g\'ridan-to\'g\'ri yetkazib beriladi.',
      unit: 'ton',
      price_per_unit: 850000,
      currency: 'UZS',
      moq: 30,
      available_quantity: 1000,
      location_region: 'Navoiy',
      delivery_regions: ['Buxoro', 'Samarqand', 'Navoiy'],
      delivery_days: 3,
      delivery_cost_per_ton: 120000,
      stock_status: 'available',
      supplier_id: supplierId
    },
    {
      title: 'Paxta yog\'i (Oliy nav)',
      category: 'Oziq-ovqat',
      subcategory: 'Yog\' mahsulotlari',
      description: 'Tozalanmagan paxta yog\'i, ishlab chiqaruvchidan.',
      unit: 'litre',
      price_per_unit: 14000,
      currency: 'UZS',
      moq: 1000,
      available_quantity: 5000,
      location_region: 'Farg\'ona',
      delivery_regions: ['Andijon', 'Namangan', 'Farg\'ona'],
      delivery_days: 2,
      delivery_cost_per_ton: 0,
      stock_status: 'available',
      supplier_id: supplierId
    },
    {
      title: 'Samarqand uzumi (Husayni)',
      category: 'Meva-sabzavot',
      subcategory: 'Uzum',
      description: 'Yangi uzilgan, eksport uchun qadoqlangan.',
      unit: 'kg',
      price_per_unit: 15000,
      currency: 'UZS',
      moq: 100,
      available_quantity: 800,
      location_region: 'Samarqand',
      delivery_regions: ['Toshkent shahri', 'Samarqand'],
      delivery_days: 1,
      delivery_cost_per_ton: 800000,
      stock_status: 'available',
      supplier_id: supplierId
    },
    {
      title: 'Kalsiyli selitra (O\'g\'it)',
      category: 'Sanoat',
      subcategory: 'Kimyoviy o\'g\'itlar',
      description: 'Chirchiq zavodi mahsuloti.',
      unit: 'ton',
      price_per_unit: 3200000,
      currency: 'UZS',
      moq: 10,
      available_quantity: 150,
      location_region: 'Toshkent viloyati',
      delivery_regions: ['Toshkent viloyati', 'Sirdaryo', 'Jizzax'],
      delivery_days: 2,
      delivery_cost_per_ton: 180000,
      stock_status: 'low_stock',
      supplier_id: supplierId
    },
    {
      title: 'Piyoz (Sariq, eksportbop)',
      category: 'Sabzavotlar',
      subcategory: 'Piyoz',
      description: 'Surxondaryo erta pishar piyozi. Qoplangan.',
      unit: 'kg',
      price_per_unit: 3500,
      currency: 'UZS',
      moq: 5000,
      available_quantity: 20000,
      location_region: 'Surxondaryo',
      delivery_regions: ['Barcha viloyatlar'],
      delivery_days: 3,
      delivery_cost_per_ton: 400000,
      stock_status: 'available',
      supplier_id: supplierId
    },
    {
      title: 'Olmaliq mis simi',
      category: 'Sanoat',
      subcategory: 'Metallurgiya',
      description: 'Kabel ishlab chiqarish uchun mis simlar.',
      unit: 'kg',
      price_per_unit: 85000,
      currency: 'UZS',
      moq: 500,
      available_quantity: 2500,
      location_region: 'Toshkent viloyati',
      delivery_regions: ['Toshkent shahri', 'Toshkent viloyati'],
      delivery_days: 2,
      delivery_cost_per_ton: 100000,
      stock_status: 'available',
      supplier_id: supplierId
    }
  ];

  const { error: listingsError } = await supabase.from('listings').insert(listingsToInsert);

  if (listingsError) {
    console.error("Failed to insert listings:", listingsError.message);
    process.exit(1);
  }

  console.log("Successfully inserted 8 mock products into the database!");
}

seed().catch(console.error);
