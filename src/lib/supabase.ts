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
    priceSale: 85,
    priceRent: 40,
    description: "كاب تخرج بتصميم كويتي أصيل، مصنوع من أجود أنواع المخمل الفاخر. يتميز بتفاصيل ذهبية دقيقة وحياكة يدوية متقنة تضمن لك إطلالة استثنائية في يوم تخرجك. متوفر للبيع والإيجار.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-001",
    sales: 24
  },
  {
    id: "2",
    name: "شال تخرج مطرز",
    priceSale: 45,
    priceRent: 20,
    description: "شال تخرج مطرز بخيوط حريرية فاخرة. يمكنك طلب كتابة اسمك وسنة التخرج بألوان متعددة. نسيج ناعم ومقاوم للتجعد.",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "شالات التخرج",
    categoryId: "sashes",
    code: "JG-002",
    sales: 42
  },
  {
    id: "3",
    name: "بروش مخصص",
    priceSale: 25,
    priceRent: 12,
    description: "بروش تخرج معدني أنيق ومطلي بالذهب عيار 18 قيراط. يتم قصه بالليزر بالاسم أو الشعار الذي تفضله. هدية تذكارية رائعة.",
    image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop",
    status: "محجوز",
    category: "بروشات التخرج",
    categoryId: "pins",
    code: "JG-003",
    sales: 18
  },
  {
    id: "4",
    name: "روب تخرج أطفال",
    priceSale: 60,
    priceRent: 30,
    description: "روب تخرج للأطفال بتصميم مريح وألوان زاهية تناسب حفلات تخرج الروضة والابتدائي. خامة خفيفة وباردة تناسب الصيف.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-004",
    sales: 15
  },
  {
    id: "5",
    name: "طقم كاب وشال",
    priceSale: 120,
    priceRent: 55,
    description: "طقم تخرج ملكي متكامل يشمل الكاب الكويتي الفاخر مع شال مطرز مخصص بالاسم. وفر أكثر مع هذا الطقم المميز.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    status: "متوفر",
    category: "كابات التخرج",
    categoryId: "gowns",
    code: "JG-005",
    sales: 30
  },
  {
    id: "6",
    name: "قبعة تخرج مخمل",
    priceSale: 95,
    priceRent: 45,
    description: "قبعة تخرج كلاسيكية مصنوعة من القطيفة الفاخرة مع شراشيب حريرية طويلة متدلية بلون ذهبي لامع.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    status: "غير متوفر",
    category: "قبعات التخرج",
    categoryId: "caps",
    code: "JG-006",
    sales: 5
  }
];

// Resilient Mock Settings Database
export const defaultSettings: Record<string, string> = {
  contact_phone: "+218 92 123 4567",
  contact_email: "info@jaguar.ly",
  location: "ليبيا - طرابلس، شارع النصر",
  announcement_text: "توصيل لجميع أنحاء ليبيا 🎓",
  hero_title: "لحظة تخرجك، بأرقى المعايير",
  hero_subtitle: "اكتشف مجموعتنا الحصرية من كابات التخرج، القبعات، والشالات الفاخرة. بيع وإيجار مع خدمة توصيل لجميع أنحاء ليبيا."
};

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
