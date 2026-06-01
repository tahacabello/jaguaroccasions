import { createClient } from '@supabase/supabase-js';

// These should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxsixllbppablltuvtkj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cf8BqtzedCI5qHgtt0gWRA_TihclIWq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Resilient Mock Products Database (Fallback in case Supabase table is not populated)
export const mockProducts = [
  {
    id: "1",
    name: "كاب كويتي فاخر",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج بتصميم كويتي أصيل مع شال مطرز بالاسم بخط عربي ذهبي فاخر. مصنوع من أجود أنواع الساتان والمخمل الأسود مع تفاصيل ذهبية وشراشيب حريرية. يشمل القبعة والشال. متوفر للبيع والإيجار.",
    image: "/products/kuwaiti-cap-1.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-001",
    sales: 48
  },
  {
    id: "2",
    name: "كاب تخرج مع باقة ورد",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج كويتي أنيق مع شال مطرز بالذهبي. تصميم عصري يناسب جميع المناسبات الأكاديمية. خامة ساتان فاخرة مع حياكة متقنة وتفاصيل ذهبية.",
    image: "/products/kuwaiti-cap-2.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-002",
    sales: 35
  },
  {
    id: "3",
    name: "كاب تخرج مع شال أحمر",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج فاخر بقبعة بوردو مميزة وشال أحمر مطرز بخط عربي ذهبي. تصميم فريد يجمع بين الأناقة والتميز. مناسب لحفلات التخرج الجامعية.",
    image: "/products/kuwaiti-cap-3.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-003",
    sales: 22
  },
  {
    id: "4",
    name: "كاب كويتي كلاسيك Class 2026",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج كويتي كلاسيكي من المخمل الأسود الفاخر مع شال مطرز يحمل عبارة Class 2026 بخط ذهبي أنيق. تصميم فخم يليق بلحظة التخرج المميزة.",
    image: "/products/kuwaiti-cap-4.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-004",
    sales: 30
  },
  {
    id: "5",
    name: "كاب تخرج مع باقة زهور",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج أنيق بتصميم كويتي مع شال مطرز بالذهبي ورقم السنة. إطلالة راقية ومثالية لتصوير لحظات التخرج الخالدة.",
    image: "/products/kuwaiti-cap-5.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-005",
    sales: 28
  },
  {
    id: "6",
    name: "طقم تخرج جماعي - شال ذهبي",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج مع شال ذهبي فاخر مطرز بالاسم. مثالي للطلب الجماعي لمجموعات التخرج. خصم خاص على الطلبات الجماعية (5 قطع فأكثر).",
    image: "/products/kuwaiti-cap-6.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-006",
    sales: 42
  },
  {
    id: "7",
    name: "كاب تخرج مع بالون ذهبي",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج كويتي من المخمل الأسود مع شال مطرز. تصميم عصري وأنيق مع إكسسوارات التخرج. يشمل القبعة والشال والشراشيب الذهبية.",
    image: "/products/kuwaiti-cap-7.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-007",
    sales: 19
  },
  {
    id: "8",
    name: "كاب تخرج احتفالي",
    priceSale: 375,
    priceRent: 85,
    description: "كاب تخرج كويتي فاخر من المخمل الأسود الممتاز. مثالي للحظات الاحتفالية المميزة. تطريز يدوي بخيوط ذهبية فاخرة مع شراشيب حريرية.",
    image: "/products/kuwaiti-cap-8.jpg",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-008",
    sales: 15
  }
];

// Resilient Mock Settings Database
export const defaultSettings: Record<string, string> = {
  contact_phone: "+218 92 123 4567",
  contact_email: "info@jaguar.ly",
  location: "ليبيا - طرابلس، شارع النصر",
  contact_location_link: "https://maps.app.goo.gl/9Zc4k2g18uH3q9pY6",
  telegram_bot_token: "8840923993:AAEz0V-OvMlYsEzD_S4McSCNf7NMR_fcs3o",
  telegram_chat_id: "889242214",
  hero_image: "",
  announcement_text: "توصيل لجميع أنحاء ليبيا 🎓",
  hero_title: "لحظة تخرجك، بأرقى المعايير",
  hero_subtitle: "اكتشف مجموعتنا الحصرية من كابات التخرج، القبعات، والشالات الفاخرة. بيع وإيجار مع خدمة توصيل لجميع أنحاء ليبيا."
};

// Upload product image to Supabase Storage (falls back to base64 if bucket not configured)
export async function uploadProductImage(file: File): Promise<string> {
  // Try Supabase Storage first
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `product_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (!error && data) {
      const { data: pub } = supabase.storage.from('product-images').getPublicUrl(data.path);
      return pub.publicUrl;
    }
  } catch { /* fall through */ }

  // Fallback: base64 data URL (works without Supabase Storage setup)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('فشل قراءة الصورة'));
    reader.readAsDataURL(file);
  });
}

// Database helper functions for Products
export async function getSupabaseProducts() {

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return mockProducts;

    // Map database snake_case keys to camelCase keys for React codebase consistency
    return data.map(item => ({
      id: item.id,
      name: item.name,
      priceSale: Number(item.price_sale),
      priceRent: Number(item.price_rent),
      description: item.description,
      image: item.image,
      status: item.status,
      category: item.category,
      categoryId: item.category_id,
      code: item.code,
      sales: item.sales || 0
    }));
  } catch (err) {
    console.warn("Supabase products fetch failed, using mock fallbacks:", err);
    return mockProducts;
  }
}

export async function addSupabaseProduct(product: any) {
  try {
    const dbItem = {
      id: product.id,
      name: product.name,
      price_sale: product.priceSale,
      price_rent: product.priceRent,
      description: product.description || "",
      image: product.image,
      status: product.status || "متوفر",
      category: product.category,
      category_id: product.categoryId || "gowns",
      code: product.code || `JG-00${product.id}`,
      sales: 0
    };

    const { error } = await supabase
      .from('products')
      .insert([dbItem]);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase product insert failed:", err);
    return false;
  }
}

export async function updateSupabaseProduct(productId: string, updates: any) {
  try {
    // Map updates keys to database snake_case columns
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.priceSale !== undefined) dbUpdates.price_sale = updates.priceSale;
    if (updates.priceRent !== undefined) dbUpdates.price_rent = updates.priceRent;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.code !== undefined) dbUpdates.code = updates.code;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Supabase product update failed for ${productId}:`, err);
    return false;
  }
}

export async function deleteSupabaseProduct(productId: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Supabase product deletion failed for ${productId}:`, err);
    return false;
  }
}

// Database helper functions for Settings
export async function getSupabaseSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) throw error;
    
    const settingsMap = { ...defaultSettings };
    if (data && data.length > 0) {
      data.forEach(item => {
        settingsMap[item.key] = item.value;
      });
    }
    return settingsMap;
  } catch (err) {
    console.warn("Supabase settings fetch failed, using default fallbacks:", err);
    return defaultSettings;
  }
}

export async function updateSupabaseSetting(key: string, value: string) {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Supabase setting update failed for ${key}:`, err);
    return false;
  }
}

// Resilient Mock Profiles Database
export const mockProfiles = [
  { id: "usr-1", first_name: "أحمد", last_name: "الورفلي", phone_number: "+218 91 345 6789", address_line1: "السياحية - قرب جامع طيبة", city: "طرابلس", created_at: "2026-05-30T10:14:00Z" },
  { id: "usr-2", first_name: "معتز", last_name: "بن علي", phone_number: "+218 92 654 3210", address_line1: "الفويهات - شارع دبي", city: "بنغازي", created_at: "2026-05-29T15:24:00Z" },
  { id: "usr-3", first_name: "روان", last_name: "الشركسي", phone_number: "+218 91 789 4561", address_line1: "الرويسات", city: "مصراتة", created_at: "2026-05-28T18:40:00Z" },
  { id: "usr-4", first_name: "منى", last_name: "الترهوني", phone_number: "+218 92 123 7890", address_line1: "وسط المدينة", city: "الخمس", created_at: "2026-05-27T11:05:00Z" }
];

// Database helper functions for User Profiles
export async function getSupabaseProfiles() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return mockProfiles;
    
    return data;
  } catch (err) {
    console.warn("Supabase profiles fetch failed, returning mock profiles fallback:", err);
    return mockProfiles;
  }
}

export async function updateSupabaseProfile(profileId: string, updates: any) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Supabase profile update failed for ${profileId}:`, err);
    return false;
  }
}

