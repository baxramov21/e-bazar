const { createClient } = require('@supabase/supabase-js');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// For local testing, ensure you pass --env-file=.env.local when running node
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Run with: node --env-file=.env.local src/scripts/seed-market.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const productsData = [
  { name: "Kartoshka (Oq, Navoiy)", category: "Sabzavotlar", subcategory: "Kartoshka", unit: "kg", price: 3500, imgTheme: "potato" },
  { name: "Kartoshka (Qizil, Samarqand)", category: "Sabzavotlar", subcategory: "Kartoshka", unit: "kg", price: 4200, imgTheme: "red-potato" },
  { name: "Pomidor (Issiqxona, Zangiota)", category: "Sabzavotlar", subcategory: "Pomidor", unit: "kg", price: 12000, imgTheme: "tomato" },
  { name: "Piyoz (Sariq, Jizzax)", category: "Sabzavotlar", subcategory: "Piyoz", unit: "kg", price: 2500, imgTheme: "onion" },
  { name: "Sabzi (Qizil)", category: "Sabzavotlar", subcategory: "Sabzi", unit: "kg", price: 3000, imgTheme: "carrot" },
  { name: "Karam (Oq boshli)", category: "Sabzavotlar", subcategory: "Karam", unit: "kg", price: 2800, imgTheme: "cabbage" },
  { name: "Olma (Besh yulduz, Namangan)", category: "Meva", subcategory: "Olma", unit: "kg", price: 15000, imgTheme: "apple" },
  { name: "Uzum (Kishmish, Farg'ona)", category: "Meva", subcategory: "Uzum", unit: "kg", price: 18000, imgTheme: "grapes" },
  { name: "Gilos (Katta, Toshkent)", category: "Meva", subcategory: "Gilos", unit: "kg", price: 35000, imgTheme: "cherry" },
  { name: "Qovun (Mirzacho'l)", category: "Poliz", subcategory: "Qovun", unit: "kg", price: 4500, imgTheme: "melon" },
  { name: "Tarvuz (Surxondaryo)", category: "Poliz", subcategory: "Tarvuz", unit: "kg", price: 2000, imgTheme: "watermelon" },
  { name: "Mol go'shti (Suyaksiz)", category: "Go'sht", subcategory: "Mol", unit: "kg", price: 75000, imgTheme: "beef" },
  { name: "Qo'y go'shti", category: "Go'sht", subcategory: "Qo'y", unit: "kg", price: 80000, imgTheme: "lamb-meat" },
  { name: "Paxta yog'i (Tozalanmagan)", category: "Yog'", subcategory: "Paxta yog'i", unit: "litre", price: 14000, imgTheme: "cooking-oil" },
  { name: "Kungaboqar yog'i (Tozalangan)", category: "Yog'", subcategory: "Kungaboqar", unit: "litre", price: 17000, imgTheme: "sunflower-oil" },
  { name: "Bug'doy (Oliy nav)", category: "Don", subcategory: "Bug'doy", unit: "ton", price: 3100000, imgTheme: "wheat" },
  { name: "Shakar (Oq)", category: "Oziq-ovqat", subcategory: "Shakar", unit: "kg", price: 13500, imgTheme: "sugar" },
  { name: "Un (1-nav, Qozog'iston)", category: "Oziq-ovqat", subcategory: "Un", unit: "kg", price: 4800, imgTheme: "flour" },
  { name: "Tuxum (Oliy nav, 10 dona)", category: "Oziq-ovqat", subcategory: "Tuxum", unit: "dona", price: 12000, imgTheme: "eggs" },
  { name: "Asal (Tog' asali, Jizzax)", category: "Oziq-ovqat", subcategory: "Asal", unit: "kg", price: 45000, imgTheme: "honey" }
];

const regions = ["Toshkent shahri", "Toshkent viloyati", "Surxondaryo", "Navoiy", "Farg'ona", "Samarqand", "Buxoro", "Xorazm", "Andijon", "Qashqadaryo", "Namangan", "Jizzax", "Sirdaryo"];
const adjectives = ["Premium", "Sifatli", "Toza", "Yangi", "Organik", "Arzon", "Katta", "Shirin", "Export bop"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePrice(basePrice) {
  // +/- 15% variance
  const variance = basePrice * 0.15;
  const randomVariance = (Math.random() * variance * 2) - variance;
  // Round to nearest 100 UZS
  return Math.round((basePrice + randomVariance) / 100) * 100;
}

async function getOrCreateSupplier() {
  const email = 'mega_market_supplier@example.com';
  let { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  let supplier = users?.users?.find(u => u.email === email);
  if (!supplier) {
    const { data: newUser } = await supabase.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true
    });
    supplier = newUser?.user;

    if (supplier) {
      await supabase.from('profiles').insert({
        id: supplier.id,
        role: 'supplier',
        full_name: 'Bozor Analitika Market Maker',
        company_name: 'Global Agro Trade',
        region: 'Toshkent shahri',
        kyb_status: 'verified',
        trust_score: 5.0
      });
    }
  }
  return supplier?.id;
}

async function seed() {
  console.log("Generating 2,000 market products...");
  
  const supplierId = await getOrCreateSupplier();
  if (!supplierId) {
    console.error("Could not get or create supplier.");
    process.exit(1);
  }

  const batchSize = 500;
  let totalInserted = 0;

  for (let batch = 0; batch < 4; batch++) {
    const listings = [];
    for (let i = 0; i < batchSize; i++) {
      const baseProduct = getRandomItem(productsData);
      const randomAdj = getRandomItem(adjectives);
      const price = generatePrice(baseProduct.price);
      
      listings.push({
        supplier_id: supplierId,
        title: `${randomAdj} ${baseProduct.name}`,
        category: baseProduct.category,
        subcategory: baseProduct.subcategory,
        description: `Bizning mahsulotimiz juda sifatli va ishonchli. Bozor narxidan kelishilgan holatda sotiladi.`,
        unit: baseProduct.unit,
        price_per_unit: price,
        currency: 'UZS',
        moq: Math.floor(Math.random() * 50) + 10, // 10 to 60
        available_quantity: Math.floor(Math.random() * 5000) + 100,
        location_region: getRandomItem(regions),
        delivery_regions: ['Barcha viloyatlar'],
        delivery_days: Math.floor(Math.random() * 7) + 1,
        delivery_cost_per_ton: Math.floor(Math.random() * 300000) + 50000,
        stock_status: 'available',
        is_active: true,
        images: [`https://loremflickr.com/800/600/${baseProduct.imgTheme}`]
      });
    }

    console.log(`Inserting batch ${batch + 1} of 4 (${batchSize} items)...`);
    const { error } = await supabase.from('listings').insert(listings);
    if (error) {
      console.error("Error inserting batch:", error.message);
    } else {
      totalInserted += batchSize;
    }
  }

  console.log(`Successfully inserted ${totalInserted} listings into the database!`);
}

seed().catch(console.error);
