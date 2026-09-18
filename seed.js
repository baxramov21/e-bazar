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

const productsData = [
  { name: "Kartoshka (Oq, Navoiy)", category: "Sabzavotlar", unit: "kg", price: 3500, imgTheme: "potato" },
  { name: "Kartoshka (Qizil, Samarqand)", category: "Sabzavotlar", unit: "kg", price: 4200, imgTheme: "red-potato" },
  { name: "Pomidor (Issiqxona, Zangiota)", category: "Sabzavotlar", unit: "kg", price: 12000, imgTheme: "tomato" },
  { name: "Piyoz (Sariq, Jizzax)", category: "Sabzavotlar", unit: "kg", price: 2500, imgTheme: "onion" },
  { name: "Sabzi (Qizil)", category: "Sabzavotlar", unit: "kg", price: 3000, imgTheme: "carrot" },
  { name: "Karam (Oq boshli)", category: "Sabzavotlar", unit: "kg", price: 2800, imgTheme: "cabbage" },
  { name: "Olma (Besh yulduz, Namangan)", category: "Meva-sabzavot", unit: "kg", price: 15000, imgTheme: "apple" },
  { name: "Uzum (Kishmish, Farg'ona)", category: "Meva-sabzavot", unit: "kg", price: 18000, imgTheme: "grapes" },
  { name: "Gilos (Katta, Toshkent)", category: "Meva-sabzavot", unit: "kg", price: 35000, imgTheme: "cherry" },
  { name: "Qovun (Mirzacho'l)", category: "Meva-sabzavot", unit: "kg", price: 4500, imgTheme: "melon" },
  { name: "Tarvuz (Surxondaryo)", category: "Meva-sabzavot", unit: "kg", price: 2000, imgTheme: "watermelon" },
  { name: "Mol go'shti (Suyaksiz)", category: "Oziq-ovqat", unit: "kg", price: 75000, imgTheme: "beef" },
  { name: "Qo'y go'shti", category: "Oziq-ovqat", unit: "kg", price: 80000, imgTheme: "lamb-meat" },
  { name: "Paxta yog'i (Tozalanmagan)", category: "Oziq-ovqat", unit: "litre", price: 14000, imgTheme: "cooking-oil" },
  { name: "Kungaboqar yog'i (Tozalangan)", category: "Oziq-ovqat", unit: "litre", price: 17000, imgTheme: "sunflower-oil" },
  { name: "Bug'doy (Oliy nav)", category: "Qishloq xo'jaligi", unit: "ton", price: 3100000, imgTheme: "wheat" },
  { name: "Shakar (Oq)", category: "Oziq-ovqat", unit: "kg", price: 13500, imgTheme: "sugar" },
  { name: "Un (1-nav, Qozog'iston)", category: "Oziq-ovqat", unit: "kg", price: 4800, imgTheme: "flour" },
  { name: "Tuxum (Oliy nav, 10 dona)", category: "Oziq-ovqat", unit: "dona", price: 12000, imgTheme: "eggs" },
  { name: "Asal (Tog' asali, Jizzax)", category: "Oziq-ovqat", unit: "kg", price: 45000, imgTheme: "honey" }
];

const regions = ["Toshkent viloyati", "Surxondaryo", "Navoiy", "Farg'ona", "Samarqand", "Buxoro", "Xorazm", "Andijon"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log("Seeding database with 20 hyper-realistic mock listings...");

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

  // Create Buyer Nazar Usmon
  const uniqueBuyerEmail = `buyer_${Date.now()}@example.com`;
  const { data: buyerData, error: buyerError } = await supabase.auth.admin.createUser({
    email: uniqueBuyerEmail,
    password: 'password123',
    email_confirm: true
  });
  
  if (buyerError) {
    console.error("Failed to create buyer user:", buyerError.message);
  }
  const buyerId = buyerData?.user?.id;

  if (buyerId) {
    await supabase.from('profiles').insert({
      id: buyerId,
      role: 'buyer',
      full_name: 'Nazar Usmon',
      company_name: 'Baraka Savdo',
      region: 'Samarqand',
      address: 'Urgut tumani',
      trust_score: 4.8
    });
  }

  const listingsToInsert = productsData.map((prod, i) => ({
    title: prod.name,
    category: prod.category,
    subcategory: 'Asosiy',
    description: `Eng sifatli ${prod.name} mahsuloti. B2B savdo uchun maxsus taklif. O'zbekiston bo'ylab yetkazib beriladi.`,
    unit: prod.unit,
    price_per_unit: prod.price,
    currency: 'UZS',
    moq: Math.floor(Math.random() * 50) + 10,
    available_quantity: Math.floor(Math.random() * 5000) + 500,
    location_region: getRandomItem(regions),
    delivery_regions: ['Toshkent shahri', 'Toshkent viloyati', 'Barcha viloyatlar'],
    delivery_days: Math.floor(Math.random() * 5) + 1,
    delivery_cost_per_ton: Math.floor(Math.random() * 200000) + 50000,
    stock_status: Math.random() > 0.1 ? 'available' : 'low_stock',
    supplier_id: supplierId,
    images: [`https://loremflickr.com/800/600/${prod.imgTheme}`]
  }));

  const { data: insertedListings, error: listingsError } = await supabase.from('listings').insert(listingsToInsert).select();

  if (listingsError) {
    console.error("Failed to insert listings:", listingsError.message);
    process.exit(1);
  }

  // Create Mock Orders from Nazar Usmon
  if (buyerId && insertedListings && insertedListings.length > 0) {
    const mockOrders = [
      {
        buyer_id: buyerId,
        supplier_id: supplierId,
        listing_id: insertedListings[0].id,
        status: 'pending',
        quantity: 50,
        unit: insertedListings[0].unit,
        price_per_unit: insertedListings[0].price_per_unit,
        delivery_cost: insertedListings[0].delivery_cost_per_ton * 50,
        delivery_address: 'Samarqand, Urgut bozori',
        notes: "Iltimos ertaroq yetkazib bering"
      },
      {
        buyer_id: buyerId,
        supplier_id: supplierId,
        listing_id: insertedListings[1].id,
        status: 'in_delivery',
        quantity: 120,
        unit: insertedListings[1].unit,
        price_per_unit: insertedListings[1].price_per_unit,
        delivery_cost: insertedListings[1].delivery_cost_per_ton * 120,
        delivery_address: 'Samarqand, Siyob bozori',
        notes: "Mashina raqamini tashlab yuboring"
      }
    ];
    await supabase.from('orders').insert(mockOrders);
  }

  console.log("Successfully inserted 20 mock products and orders into the database!");
}

seed().catch(console.error);
