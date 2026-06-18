import { createClient } from '@supabase/supabase-js';

// These should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxsixllbppablltuvtkj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cf8BqtzedCI5qHgtt0gWRA_TihclIWq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
});

// Helper to resolve local assets with the correct basePath for GitHub Pages
export function resolveAssetPath(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  
  const prefix = "/jaguaroccasions";
  if (path.startsWith(prefix)) return path;

  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    return `${prefix}${path}`;
  }

  if (typeof window !== "undefined" && window.location.pathname.startsWith(prefix)) {
    return `${prefix}${path}`;
  }

  return path;
}

// Resilient Mock Products Database (Fallback in case Supabase table is not populated)
export const mockProducts = [
  {
    id: "1",
    name: "كاب كويتي",
    priceSale: 85,
    priceRent: 40,
    description: "كيب تخرج بتصميم كويتي أصيل، مصنوع من أجود أنواع المخمل. يتميز بتفاصيل ذهبية دقيقة وحياكة يدوية متقنة تضمن لك إطلالة استثنائية في يوم تخرجك. متوفر للبيع والإيجار.",
    image: resolveAssetPath("/products/gallery/graduation_photo_01.jpg"),
    images: [
      resolveAssetPath("/products/gallery/graduation_photo_01.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_02.jpg"),
      resolveAssetPath("/products/gallery/graduation_photo_03.jpg"),
    ],
    status: "available",
    categoryId: "gowns",
    code: "JG-001",
    stockQuantity: 12,
    isFeatured: true,
    isHidden: false,
    sortOrder: 0
  },
  {
    id: "2",
    name: "شال تخرج مطرز",
    priceSale: 45,
    priceRent: 20,
    description: "شال تخرج مطرز بخيوط حريرية. يمكنك طلب كتابة اسمك وسنة التخرج بألوان متعددة. نسيج ناعم ومقاوم للتجعد.",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop",
    images: [],
    status: "available",
    categoryId: "sashes",
    code: "JG-002",
    stockQuantity: 24,
    isFeatured: true,
    isHidden: false,
    sortOrder: 1
  },
  {
    id: "3",
    name: "بروش مخصص بالاسم",
    priceSale: 25,
    priceRent: 12,
    description: "بروش تخرج معدني أنيق ومطلي بالذهب عيار 18 قيراط. يتم قصه بالليزر بالاسم أو الشعار الذي تفضله. هدية تذكارية رائعة.",
    image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop",
    images: [],
    status: "reserved",
    categoryId: "pins",
    code: "JG-003",
    stockQuantity: 5,
    isFeatured: false,
    isHidden: false,
    sortOrder: 2
  },
  {
    id: "4",
    name: "قبعة تخرج مخمل كلاسيكية",
    priceSale: 95,
    priceRent: 45,
    description: "قبعة تخرج كلاسيكية مصنوعة من القطيفة مع شراشيب حريرية طويلة متدلية بلون ذهبي لامع.",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    images: [],
    status: "available",
    categoryId: "caps",
    code: "JG-004",
    stockQuantity: 15,
    isFeatured: true,
    isHidden: false,
    sortOrder: 3
  }
];

// Resilient Mock Settings Database
export const defaultSettings: Record<string, string> = {
  store_name: "جاغوار Occasions",
  announcement_text: "تنسيق وتطريز لكافة مستلزمات التخرج 🎓",
  hero_title: "لحظة تخرجك، بأرقى المعايير",
  hero_subtitle: "اكتشف مجموعاتنا الحصرية من كيبان التخرج، القبعات، والشالات المطرزة بالاسم. إيجار وبيع مع خدمة حجز متكاملة.",
  whatsapp_number: "",
  whatsapp_link: "",
  contact_phone: "",
  contact_email: "",
  instagram_link: "",
  tiktok_link: "",
  facebook_link: "",
  twitter_link: "",
  snapchat_link: "",
  google_maps_link: "",
  location: "طرابلس، ليبيا",
  about_text: "جاغوار Occasions هو خياركم الأول للتميز والظهور بأرقى إطلالة في حفلات تخرجكم.",
  footer_text: "جميع الحقوق محفوظة © 2026 جاغوار Occasions",
  categories_title: "الأقسام المميزة",
  categories_subtitle: "اكتشف مجموعاتنا المصنفة بعناية",
  trending_title: "الأكثر طلباً",
  trending_subtitle: "تصاميم حصرية تميز إطلالتك في يوم تخرجك",
  hero_badge: "تشكيلة تخرج 2026 متوفرة الآن",
  trust_badge_1_title: "ضمان الجودة",
  trust_badge_1_desc: "أجود الخامات المستخدمة بضمان الاسترجاع",
  trust_badge_2_title: "توصيل آمن",
  trust_badge_2_desc: "شحن سريع لجميع المدن الليبية",
  trust_badge_3_title: "دعم 24/7",
  trust_badge_3_desc: "فريق مخصص للرد على استفساراتكم",
  trust_badge_4_title: "تصاميم حصرية",
  trust_badge_4_desc: "تشكيلات فريدة لتناسب جميع الأذواق",
  working_hours: "مواعيد التواصل والاستلام المعتادة من الساعة 12:00 ظهرًا إلى الساعة 6:00 مساءً، مع ضرورة تأكيد الموعد مسبقًا عبر الواتساب لضمان توفر الخدمة في الوقت المناسب.",
  rental_policy: "سياسة الإيجار:\nيتم تسليم القطعة المؤجرة قبل موعد المناسبة بيوم، ويتم إرجاعها بعد المناسبة بيوم.\n\nفي حال كانت المناسبة يوم السبت، يكون الاستلام يوم الخميس، والإرجاع يوم الأحد، وذلك لأن يوم الجمعة خارج أيام التسليم والاستلام.\n\nيرجى تأكيد موعد الاستلام والإرجاع عبر الواتساب قبل إتمام الطلب.\n\nفي حال تلف القطعة المؤجرة أو فقدانها أو إرجاعها بحالة غير مناسبة، قد يتم احتساب رسوم إضافية تعادل قيمة الإيجار أو حسب حالة القطعة.\n\nمواعيد التواصل والاستلام المعتادة من الساعة 12:00 ظهرًا إلى الساعة 6:00 مساءً، مع ضرورة تأكيد الموعد مسبقًا عبر الواتساب لضمان توفر الخدمة في الوقت المناسب."
};

// 4 main categories requested - clean from promotional adjectives
export const defaultCategories = [
  { id: "gowns", name: "كيبان تخرج", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop", desc: "تشكيلة كيبان كويتية وكلاسيكية", is_active: true, sort_order: 0, slug: "gowns" },
  { id: "sashes", name: "شيلان تخرج", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop", desc: "شيلات مطرزة مخصصة بالأسماء", is_active: true, sort_order: 1, slug: "sashes" },
  { id: "caps", name: "قبعات تخرج", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop", desc: "قبعات مخمل وستان تناسب جميع الأذواق", is_active: true, sort_order: 2, slug: "caps" },
  { id: "pins", name: "إكسسوارات التخرج", image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop", desc: "بروشات وإكسسوارات تخرج معدنية ومطلية بالذهب", is_active: true, sort_order: 3, slug: "pins" },
];

// =====================================================================
// 📂 دالة الرفع السحابي لـ Supabase Storage
// =====================================================================
export async function uploadProductImage(file: File, filename?: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const namePart = filename || `jaguar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const filePath = `${Date.now()}_${namePart}.${fileExt}`;

    // Try uploading to 'jaguar-media' bucket first
    const { data, error } = await supabase.storage
      .from('jaguar-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      // Fallback: Try 'product-images' bucket
      const { data: data2, error: error2 } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error2) throw error2;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      return publicUrl;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('jaguar-media')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.warn("Storage upload failed, reading as Base64:", err);
    // Fallback: Read file as Base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as Base64"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

// =====================================================================
// 📂 الأقسام (Categories)
// =====================================================================
export async function getSupabaseCategories(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Failed to get categories from Supabase:", err);
    return [];
  }
}

export async function addSupabaseCategory(category: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .insert([{
        name: category.name,
        slug: category.slug || category.id || Math.random().toString(36).substring(2, 9),
        image: category.image || "",
        desc: category.desc || "",
        sort_order: category.sort_order || 0,
        is_active: category.is_active !== undefined ? category.is_active : true,
        is_featured: category.is_featured !== undefined ? category.is_featured : false
      }]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to add category:", err);
    return false;
  }
}

export async function updateSupabaseCategory(id: string, updates: any): Promise<boolean> {
  try {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.desc !== undefined) dbUpdates.desc = updates.desc;
    if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;
    if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
    if (updates.is_featured !== undefined) dbUpdates.is_featured = updates.is_featured;

    const { error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update category ${id}:`, err);
    return false;
  }
}

export async function deleteSupabaseCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to delete category ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 📂 الأقسام الفرعية (Subcategories)
// =====================================================================
export async function getSupabaseSubcategories(categoryId?: string): Promise<any[]> {
  try {
    let query = supabase.from('subcategories').select('*').order('sort_order', { ascending: true });
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Failed to get subcategories:", err);
    return [];
  }
}

export async function addSupabaseSubcategory(sub: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subcategories')
      .insert([{
        category_id: sub.category_id,
        name: sub.name,
        image: sub.image || "",
        desc: sub.desc || "",
        is_featured: sub.is_featured !== undefined ? sub.is_featured : false,
        sort_order: sub.sort_order || 0,
        is_active: sub.is_active !== undefined ? sub.is_active : true
      }]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to add subcategory:", err);
    return false;
  }
}

export async function updateSupabaseSubcategory(id: string, updates: any): Promise<boolean> {
  try {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.desc !== undefined) dbUpdates.desc = updates.desc;
    if (updates.is_featured !== undefined) dbUpdates.is_featured = updates.is_featured;
    if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;
    if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

    const { error } = await supabase
      .from('subcategories')
      .update(dbUpdates)
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update subcategory ${id}:`, err);
    return false;
  }
}

export async function deleteSupabaseSubcategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to delete subcategory ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 📂 الأقسام المميزة بالصفحة الرئيسية (Homepage Featured Items)
// =====================================================================
export async function getSupabaseFeaturedItems(): Promise<any[]> {
  try {
    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    const { data: subs, error: subErr } = await supabase
      .from('subcategories')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (catErr) throw catErr;
    if (subErr) throw subErr;

    // Map categories to unified shape
    const featuredCats = (cats || []).map(c => ({
      id: c.id,
      name: c.name,
      image: c.image || "",
      desc: c.desc || "",
      isSubcategory: false,
      sort_order: c.sort_order || 0
    }));

    // Map subcategories to unified shape
    const featuredSubs = (subs || []).map(s => ({
      id: s.id,
      name: s.name,
      image: s.image || "",
      desc: s.desc || "",
      isSubcategory: true,
      categoryId: s.category_id,
      sort_order: s.sort_order || 0
    }));

    const combined = [...featuredCats, ...featuredSubs].sort((a, b) => a.sort_order - b.sort_order);

    if (combined.length === 0) {
      // Fallback
      return defaultCategories.map(c => ({ ...c, isSubcategory: false }));
    }

    return combined;
  } catch (err) {
    console.warn("Failed to get featured items from Supabase, using defaults:", err);
    return defaultCategories.map(c => ({ ...c, isSubcategory: false }));
  }
}

// =====================================================================
// 📂 تبديل الترتيب الفوري لقاعدة البيانات (Database Sorting Swappers)
// =====================================================================
export async function swapCategoryOrderInDb(id1: string, order1: number, id2: string, order2: number): Promise<boolean> {
  try {
    const { error: err1 } = await supabase.from('categories').update({ sort_order: order2 }).eq('id', id1);
    const { error: err2 } = await supabase.from('categories').update({ sort_order: order1 }).eq('id', id2);
    if (err1 || err2) throw err1 || err2;
    return true;
  } catch (err) {
    console.error("Failed to swap category order:", err);
    return false;
  }
}

export async function swapSubcategoryOrderInDb(id1: string, order1: number, id2: string, order2: number): Promise<boolean> {
  try {
    const { error: err1 } = await supabase.from('subcategories').update({ sort_order: order2 }).eq('id', id1);
    const { error: err2 } = await supabase.from('subcategories').update({ sort_order: order1 }).eq('id', id2);
    if (err1 || err2) throw err1 || err2;
    return true;
  } catch (err) {
    console.error("Failed to swap subcategory order:", err);
    return false;
  }
}

export async function swapProductOrderInDb(id1: string, order1: number, id2: string, order2: number): Promise<boolean> {
  try {
    const { error: err1 } = await supabase.from('products').update({ sort_order: order2 }).eq('id', id1);
    const { error: err2 } = await supabase.from('products').update({ sort_order: order1 }).eq('id', id2);
    if (err1 || err2) throw err1 || err2;
    return true;
  } catch (err) {
    console.error("Failed to swap product order:", err);
    return false;
  }
}

// RFC 4122 v4 UUID Generator for client-side resiliency
export function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// =====================================================================
// 📂 المنتجات (Products)
// =====================================================================
export async function getSupabaseProducts(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(item => {
      // Coalesce both pricing formats
      const pSale = item.price_sale !== null && item.price_sale !== undefined ? Number(item.price_sale) : (item.sale_price !== null && item.sale_price !== undefined ? Number(item.sale_price) : 0);
      const pRent = item.price_rent !== null && item.price_rent !== undefined ? Number(item.price_rent) : (item.rent_price !== null && item.rent_price !== undefined ? Number(item.rent_price) : 0);
      
      // Determine item_mode fallback if it's missing or null
      let itemMode = item.item_mode;
      if (!itemMode) {
        itemMode = (pSale > 0 && pRent > 0) ? 'both' : (pSale > 0 ? 'sale' : 'rent');
      }

      // Map stable English status keys to Arabic labels for UI backward compatibility
      let statusLabel = "متوفر";
      const s = (item.status || "").trim();
      if (s === "available" || s === "متوفر") statusLabel = "متوفر";
      else if (s === "unavailable" || s === "غير متوفر") statusLabel = "غير متوفر";
      else if (s === "reserved" || s === "محجوز") statusLabel = "محجوز";
      else if (s === "sold" || s === "مباع") statusLabel = "مباع";
      else if (s === "hidden" || s === "مخفي") statusLabel = "مخفي";
      else if (s) statusLabel = s;

      const statusKey = s === "متوفر" || s === "available" ? "available" :
                        s === "غير متوفر" || s === "unavailable" ? "unavailable" :
                        s === "محجوز" || s === "reserved" ? "reserved" :
                        s === "مباع" || s === "sold" ? "sold" :
                        s === "مخفي" || s === "hidden" ? "hidden" : "available";

      // Resolve category name from joined categories relation or fallback
      const catName = (item.categories as any)?.name || item.category || "";

      return {
        id: item.id,
        name: item.name,
        priceSale: pSale,
        priceRent: pRent,
        description: item.description,
        image: resolveAssetPath(item.image || ""),
        images: item.images ? item.images.map((img: string) => resolveAssetPath(img)) : [],
        status: statusLabel,
        statusKey: statusKey,
        categoryId: item.category_id,
        category: catName,
        subcategoryId: item.subcategory_id,
        stockQuantity: item.stock_quantity || 0,
        isFeatured: item.is_featured || false,
        isHidden: item.is_hidden || false,
        code: item.code,
        sortOrder: item.sort_order || 0,
        itemMode: itemMode
      };
    });
  } catch (err) {
    console.warn("Supabase products fetch failed:", err);
    return [];
  }
}

export async function addSupabaseProduct(product: any) {
  try {
    // Standardize database status key (must be stable English string)
    let dbStatus = "available";
    const s = (product.status || "").trim();
    if (s === "متوفر" || s === "available") dbStatus = "available";
    else if (s === "غير متوفر" || s === "unavailable") dbStatus = "unavailable";
    else if (s === "محجوز" || s === "reserved") dbStatus = "reserved";
    else if (s === "مباع" || s === "sold") dbStatus = "sold";
    else if (s === "مخفي" || s === "hidden") dbStatus = "hidden";

    // Standardize prices: empty string -> null
    const priceSaleVal = product.priceSale !== "" && product.priceSale !== null && product.priceSale !== undefined ? Number(product.priceSale) : null;
    const priceRentVal = product.priceRent !== "" && product.priceRent !== null && product.priceRent !== undefined ? Number(product.priceRent) : null;

    const dbItem: any = {
      name: product.name,
      // Sync both pricing column formats for absolute database compatibility
      sale_price: priceSaleVal,
      price_sale: priceSaleVal,
      rent_price: priceRentVal,
      price_rent: priceRentVal,
      description: product.description || "",
      image: product.image || "",
      images: product.images || [],
      status: dbStatus,
      category_id: product.categoryId || null,
      subcategory_id: product.subcategoryId || null,
      stock_quantity: Number(product.stockQuantity || 10),
      is_featured: product.isFeatured || false,
      is_hidden: product.isHidden || false,
      code: product.code || `JG-${Math.floor(100000 + Math.random() * 900000)}`,
      sort_order: Number(product.sortOrder || 0),
      item_mode: product.itemMode || "both"
    };

    // Client-side UUID generator fallback (never send id: null to DB)
    if (product.id && product.id.trim() !== "") {
      dbItem.id = product.id;
    } else {
      dbItem.id = generateUUID();
    }

    const { data, error } = await supabase
      .from('products')
      .insert([dbItem])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Supabase product insert failed:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateSupabaseProduct(productId: string, updates: any) {
  try {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    
    if (updates.priceSale !== undefined) {
      const pSaleVal = updates.priceSale !== "" && updates.priceSale !== null && updates.priceSale !== undefined ? Number(updates.priceSale) : null;
      dbUpdates.sale_price = pSaleVal;
      dbUpdates.price_sale = pSaleVal;
    }
    if (updates.priceRent !== undefined) {
      const pRentVal = updates.priceRent !== "" && updates.priceRent !== null && updates.priceRent !== undefined ? Number(updates.priceRent) : null;
      dbUpdates.rent_price = pRentVal;
      dbUpdates.price_rent = pRentVal;
    }

    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    
    if (updates.status !== undefined) {
      let dbStatus = "available";
      const s = (updates.status || "").trim();
      if (s === "متوفر" || s === "available") dbStatus = "available";
      else if (s === "غير متوفر" || s === "unavailable") dbStatus = "unavailable";
      else if (s === "محجوز" || s === "reserved") dbStatus = "reserved";
      else if (s === "مباع" || s === "sold") dbStatus = "sold";
      else if (s === "مخفي" || s === "hidden") dbStatus = "hidden";
      dbUpdates.status = dbStatus;
    }

    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.subcategoryId !== undefined) dbUpdates.subcategory_id = updates.subcategoryId;
    if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = Number(updates.stockQuantity);
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
    if (updates.isHidden !== undefined) dbUpdates.is_hidden = updates.isHidden;
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = Number(updates.sortOrder);
    if (updates.itemMode !== undefined) dbUpdates.item_mode = updates.itemMode;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', productId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Supabase product update failed for ${productId}:`, err);
    return { success: false, error: err?.message || String(err) };
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

// =====================================================================
// 📂 الإعدادات (Settings)
// =====================================================================
export async function getSupabaseSettings(): Promise<Record<string, string>> {
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

export async function updateSupabaseSetting(key: string, value: string): Promise<boolean> {
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

// =====================================================================
// 📂 الطلبيات والحجوزات (Orders & Items)
// =====================================================================
export async function getSupabaseOrders(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to get orders from Supabase:", err);
    return [];
  }
}

export async function addSupabaseOrder(order: any, items: any[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const orderItemsPayload = items.map(item => ({
      product_id: item.product_id || item.id || null,
      product_name: item.product_name || item.name,
      product_image: item.product_image || item.image || "",
      quantity: Number(item.quantity || 1),
      price_at_purchase: Number(item.price_at_purchase || item.price || 0),
      item_mode: item.item_mode || item.mode || 'sale'
    }));

    const { data, error } = await supabase
      .rpc('create_order_with_items', {
        p_guest_name: order.guest_name,
        p_guest_phone: order.guest_phone,
        p_guest_backup_phone: order.guest_backup_phone || "",
        p_guest_city: order.guest_city,
        p_guest_street: order.guest_street,
        p_guest_address_detail: order.guest_address_detail || "",
        p_customer_notes: order.customer_notes || "",
        p_payment_method: order.payment_method || 'cash_on_delivery',
        p_total_amount: Number(order.total_amount),
        p_tracking_number: order.tracking_number,
        p_items: orderItemsPayload,
        p_event_date: order.event_date || null,
        p_pickup_date: order.pickup_date || null,
        p_return_date: order.return_date || null,
        p_is_preliminary: order.is_preliminary || false
      });

    if (error) throw error;

    // Safe direct update of optional Google Maps location link
    if (order.google_maps_link) {
      try {
        await supabase
          .from('orders')
          .update({ google_maps_link: order.google_maps_link })
          .eq('id', data);
      } catch (mapErr) {
        console.warn("Could not save maps link to DB order:", mapErr);
      }
    }

    return { success: true, data: { id: data } };
  } catch (err: any) {
    console.error("Failed to create order via RPC in Supabase:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateSupabaseOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('admin_update_order_status', {
        p_order_id: orderId,
        p_status: status,
        p_passcode: '9922'
      });
    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error(`Failed to update order status ${orderId} via RPC:`, err);
    return false;
  }
}

export async function updateSupabaseOrderDetails(orderId: string, updates: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('admin_update_order_details', {
        p_order_id: orderId,
        p_guest_name: updates.guest_name,
        p_guest_phone: updates.guest_phone,
        p_guest_backup_phone: updates.guest_backup_phone || "",
        p_guest_city: updates.guest_city,
        p_guest_street: updates.guest_street,
        p_guest_address_detail: updates.guest_address_detail || "",
        p_customer_notes: updates.customer_notes || "",
        p_total_amount: Number(updates.total_amount),
        p_status: updates.status,
        p_passcode: '9922',
        p_event_date: updates.event_date || null,
        p_pickup_date: updates.pickup_date || null,
        p_return_date: updates.return_date || null,
        p_is_preliminary: updates.is_preliminary || false
      });

    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error(`Failed to update order ${orderId} details via RPC:`, err);
    return false;
  }
}

export async function deleteSupabaseOrder(orderId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('admin_delete_order', {
        p_order_id: orderId,
        p_passcode: '9922'
      });
    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error(`Failed to delete order ${orderId} via RPC:`, err);
    return false;
  }
}

// =====================================================================
// 📂 ملفات وحسابات المشتركين (Customer Profiles)
// =====================================================================
export async function getSupabaseCustomerProfiles(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .rpc('admin_get_customer_profiles', {
        p_passcode: '9922'
      });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to get customer profiles via RPC:", err);
    return [];
  }
}

export async function getSupabaseUserProfile(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, first_name, last_name, phone_number, backup_phone, city, street, additional_address, is_admin, username, email, google_maps_link, created_at, updated_at')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn(`Failed to get profile for ${userId}, trying mock:`, err);
    // Fallback to local storage mock profiles
    if (typeof window !== "undefined") {
      const mockProfiles = JSON.parse(localStorage.getItem("jaguar_mock_profiles") || "[]");
      const found = mockProfiles.find((p: any) => p.id === userId);
      if (found) return found;
    }
    return null;
  }
}

export async function updateSupabaseUserProfile(userId: string, profile: any): Promise<boolean> {
  try {
    const parts = (profile.name || "").trim().split(" ");
    const firstName = parts[0] || "زبون";
    const lastName = parts.slice(1).join(" ") || "جديد";

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: profile.name,
        first_name: firstName,
        last_name: lastName,
        phone_number: profile.phone,
        backup_phone: profile.backup_phone || "",
        city: profile.city,
        street: profile.street || "",
        additional_address: profile.additional_address || "",
        username: profile.username || "",
        email: profile.email || "",
        google_maps_link: profile.google_maps_link || "",
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn("Direct DB profile update failed, syncing mock locally...", error.message);
    }

    // Sync to local mock profiles anyway to support hybrid local/production testing
    if (typeof window !== "undefined") {
      const mockProfiles = JSON.parse(localStorage.getItem("jaguar_mock_profiles") || "[]");
      const idx = mockProfiles.findIndex((p: any) => p.id === userId);
      if (idx !== -1) {
        mockProfiles[idx] = {
          ...mockProfiles[idx],
          name: profile.name,
          first_name: firstName,
          last_name: lastName,
          phone_number: profile.phone,
          backup_phone: profile.backup_phone || "",
          city: profile.city,
          street: profile.street || "",
          additional_address: profile.additional_address || "",
          username: profile.username || "",
          email: profile.email || "",
          google_maps_link: profile.google_maps_link || ""
        };
        localStorage.setItem("jaguar_mock_profiles", JSON.stringify(mockProfiles));
      }
    }

    return true;
  } catch (err) {
    console.error(`Failed to update profile for ${userId}:`, err);
    return false;
  }
}

export async function adminUpdateCustomerProfile(userId: string, profile: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('admin_update_customer_profile', {
        p_user_id: userId,
        p_first_name: profile.first_name,
        p_last_name: profile.last_name,
        p_phone_number: profile.phone_number,
        p_backup_phone: profile.backup_phone || "",
        p_city: profile.city,
        p_street: profile.street || "",
        p_additional_address: profile.additional_address || "",
        p_passcode: '9922'
      });
    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error(`Failed to update customer profile ${userId} via RPC:`, err);
    return false;
  }
}

export async function adminDeleteCustomer(userId: string): Promise<boolean> {
  try {
    console.log(`Invoking Edge Function to delete customer: ${userId}`);
    // Invoke the Edge Function first
    const { data, error } = await supabase.functions.invoke('admin_delete_customer', {
      body: { user_id: userId, passcode: '9922' }
    });

    if (!error && data?.success) {
      console.log("✅ Edge Function deletion succeeded!");
      return true;
    }

    console.warn("⚠️ Edge Function failed or not deployed, falling back to secure RPC...", error);
  } catch (edgeErr) {
    console.warn("⚠️ Edge Function invocation threw error, falling back to secure RPC...", edgeErr);
  }

  // Fallback to secure Definer RPC
  try {
    console.log(`Calling secure fallback RPC to delete customer: ${userId}`);
    const { data, error } = await supabase.rpc('admin_delete_customer', {
      p_user_id: userId,
      p_passcode: '9922'
    });
    if (error) throw error;
    return !!data;
  } catch (rpcErr) {
    console.error(`❌ Fallback RPC deletion failed:`, rpcErr);
    return false;
  }
}

export async function adminCreateCustomerAccount(
  profile: any,
  passcode: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(resolveAssetPath("/api/admin/create-customer"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: profile.username,
        password: profile.password,
        full_name: profile.full_name,
        email: profile.email || null,
        phone: profile.phone || "",
        backup_phone: profile.backup_phone || "",
        city: profile.city || "tripoli",
        street: profile.street || "",
        address_details: profile.address_details || "",
        google_maps_link: profile.google_maps_link || "",
        passcode: passcode,
      }),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || "فشل إنشاء الحساب عبر الخادم.");
    }

    // In case of mock local simulation fallback
    if (resData.mocked) {
      if (typeof window !== "undefined") {
        const mockProfiles = JSON.parse(localStorage.getItem("jaguar_mock_profiles") || "[]");
        mockProfiles.push({
          id: resData.user.id,
          username: profile.username,
          email: profile.email || `${profile.username}@jaguar.local`,
          name: profile.full_name,
          first_name: profile.full_name,
          last_name: "",
          phone_number: profile.phone,
          backup_phone: profile.backup_phone,
          city: profile.city,
          street: profile.street,
          additional_address: profile.address_details,
          google_maps_link: profile.google_maps_link,
          is_admin: false,
          password: profile.password
        });
        localStorage.setItem("jaguar_mock_profiles", JSON.stringify(mockProfiles));
      }
    }

    return { success: true, data: resData.user };
  } catch (err: any) {
    console.error("Admin user creation failed:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function adminResetCustomerPassword(
  userId: string,
  newPassword: string,
  passcode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(resolveAssetPath("/api/admin/reset-password"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        newPassword,
        passcode,
      }),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || "فشل إعادة تعيين كلمة المرور عبر الخادم.");
    }

    if (resData.mocked) {
      if (typeof window !== "undefined") {
        const mockProfiles = JSON.parse(localStorage.getItem("jaguar_mock_profiles") || "[]");
        const idx = mockProfiles.findIndex((p: any) => p.id === userId);
        if (idx !== -1) {
          mockProfiles[idx].password = newPassword;
          localStorage.setItem("jaguar_mock_profiles", JSON.stringify(mockProfiles));
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Admin password reset failed:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function resolveAuthEmail(identifier: string): Promise<string> {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return trimmed;
  }

  try {
    const { data, error } = await supabase.rpc("get_user_email_by_login_identifier", {
      p_identifier: trimmed
    });

    if (error) throw error;
    if (data) return data;
  } catch (err) {
    console.warn("DB email lookup failed, trying local storage profiles:", err);
  }

  // Fallback to local storage mock profiles
  if (typeof window !== "undefined") {
    const mockProfiles = JSON.parse(localStorage.getItem("jaguar_mock_profiles") || "[]");
    const found = mockProfiles.find(
      (p: any) => p.username === trimmed || p.phone_number === trimmed || p.email === trimmed
    );
    if (found) {
      return found.email;
    }
  }

  throw new Error("لم يتم العثور على بريد إلكتروني مسجل لهذا الحساب. يرجى التأكد من اسم المستخدم أو الهاتف.");
}

// =====================================================================
// 📂 الأقسام المميزة التجميلية بالرئيسية (Featured Cards Table Helpers)
// =====================================================================
export async function getSupabaseFeaturedCards(): Promise<any[]> {
  try {
    const { data: cards, error } = await supabase
      .from('featured_cards')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Fetch all categories & subcategories to resolve fallback names & images
    const categories = await getSupabaseCategories();
    const subcategories = await getSupabaseSubcategories();

    if (!cards || cards.length === 0) {
      // Seed fallback cards based on default categories
      return defaultCategories.map((c, idx) => ({
        id: c.id,
        display_title: c.name,
        display_subtitle: c.desc || "",
        display_image_url: c.image || "",
        linked_type: "category",
        linked_id: c.id,
        is_visible: true,
        sort_order: idx,
        name: c.name,
        desc: c.desc || "",
        image: c.image || "",
        categoryId: c.id,
        isSubcategory: false
      }));
    }

    return cards.map(card => {
      let linkedItem: any = null;
      if (card.linked_type === 'category') {
        linkedItem = categories.find(c => c.id === card.linked_id);
      } else {
        linkedItem = subcategories.find(s => s.id === card.linked_id);
      }

      const name = card.display_title || linkedItem?.name || "بدون اسم";
      const desc = card.display_subtitle || linkedItem?.desc || "";
      const image = card.display_image_url || linkedItem?.image || "";
      const categoryId = card.linked_type === 'subcategory' 
        ? (linkedItem?.category_id || linkedItem?.categoryId || "")
        : card.linked_id;

      return {
        ...card,
        name,
        desc,
        image,
        categoryId,
        isSubcategory: card.linked_type === 'subcategory'
      };
    });
  } catch (err) {
    console.warn("Failed to fetch featured cards from Supabase:", err);
    return defaultCategories.map((c, idx) => ({
      id: c.id,
      display_title: c.name,
      display_subtitle: c.desc || "",
      display_image_url: c.image || "",
      linked_type: "category",
      linked_id: c.id,
      is_visible: true,
      sort_order: idx,
      name: c.name,
      desc: c.desc || "",
      image: c.image || "",
      categoryId: c.id,
      isSubcategory: false
    }));
  }
}

export async function addSupabaseFeaturedCard(card: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('featured_cards')
      .insert([{
        display_title: card.display_title || null,
        display_subtitle: card.display_subtitle || null,
        display_image_url: card.display_image_url || null,
        linked_type: card.linked_type,
        linked_id: card.linked_id,
        is_visible: card.is_visible !== undefined ? card.is_visible : true,
        sort_order: card.sort_order || 0
      }]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to add featured card:", err);
    return false;
  }
}

export async function updateSupabaseFeaturedCard(id: string, updates: any): Promise<boolean> {
  try {
    const dbUpdates: any = {};
    if (updates.display_title !== undefined) dbUpdates.display_title = updates.display_title;
    if (updates.display_subtitle !== undefined) dbUpdates.display_subtitle = updates.display_subtitle;
    if (updates.display_image_url !== undefined) dbUpdates.display_image_url = updates.display_image_url;
    if (updates.linked_type !== undefined) dbUpdates.linked_type = updates.linked_type;
    if (updates.linked_id !== undefined) dbUpdates.linked_id = updates.linked_id;
    if (updates.is_visible !== undefined) dbUpdates.is_visible = updates.is_visible;
    if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;

    const { error } = await supabase
      .from('featured_cards')
      .update(dbUpdates)
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update featured card ${id}:`, err);
    return false;
  }
}

export async function deleteSupabaseFeaturedCard(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('featured_cards')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to delete featured card ${id}:`, err);
    return false;
  }
}

export async function swapFeaturedCardOrderInDb(id1: string, order1: number, id2: string, order2: number): Promise<boolean> {
  try {
    const { error: err1 } = await supabase.from('featured_cards').update({ sort_order: order2 }).eq('id', id1);
    const { error: err2 } = await supabase.from('featured_cards').update({ sort_order: order1 }).eq('id', id2);
    if (err1 || err2) throw err1 || err2;
    return true;
  } catch (err) {
    console.error("Failed to swap featured card order:", err);
    return false;
  }
}

// Resilient Image Helper with High-Quality Fallbacks for Categories
export function getCategoryImage(cat: any): string {
  if (!cat || !cat.image || cat.image.startsWith("blob:") || cat.image.startsWith("data:")) {
    const slug = (cat?.slug || cat?.id || "").toLowerCase();
    if (slug.includes("gown") || slug.includes("كيب") || slug.includes("كاب")) {
      return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";
    }
    if (slug.includes("sash") || slug.includes("شال") || slug.includes("شيل")) {
      return "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop";
    }
    if (slug.includes("cap") || slug.includes("قبع")) {
      return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop";
    }
    if (slug.includes("pin") || slug.includes("بروش") || slug.includes("إكسسوار")) {
      return "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop";
    }
    return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";
  }
  return resolveAssetPath(cat.image);
}

// Resilient Image Helper with High-Quality Fallbacks for Products
export function getProductImage(product: any): string {
  if (!product || !product.image || product.image.startsWith("blob:") || product.image.startsWith("data:")) {
    const code = (product?.code || product?.id || "").toLowerCase();
    if (code.includes("gown") || code.includes("كيب") || code.includes("كاب")) {
      return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";
    }
    if (code.includes("sash") || code.includes("شال") || code.includes("شيل")) {
      return "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop";
    }
    if (code.includes("cap") || code.includes("قبع")) {
      return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop";
    }
    return "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop";
  }
  return resolveAssetPath(product.image);
}

// =====================================================================
// 📂 بناء الصفحة الرئيسية الديناميكي (Dynamic Homepage Sections Builder)
// =====================================================================

export async function getSupabaseHomepageSections(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*, homepage_section_items(*)')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    // Sort items inside each section client-side for safety
    return data.map(section => {
      const items = (section.homepage_section_items || [])
        .sort((a: any, b: any) => a.sort_order - b.sort_order);
      return {
        ...section,
        homepage_section_items: items
      };
    });
  } catch (err) {
    console.warn("Failed to get homepage sections from Supabase:", err);
    return [];
  }
}

export async function addSupabaseHomepageSection(section: any): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('homepage_sections')
      .insert([{
        title: section.title,
        subtitle: section.subtitle || null,
        image_url: section.image_url || null,
        section_type: section.section_type || 'mixed',
        sort_order: section.sort_order || 0,
        is_visible: section.is_visible !== undefined ? section.is_visible : true
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to add homepage section:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateSupabaseHomepageSection(id: string, updates: any): Promise<boolean> {
  try {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
    if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;
    if (updates.section_type !== undefined) dbUpdates.section_type = updates.section_type;
    if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;
    if (updates.is_visible !== undefined) dbUpdates.is_visible = updates.is_visible;

    const { error } = await supabase
      .from('homepage_sections')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update homepage section ${id}:`, err);
    return false;
  }
}

export async function deleteSupabaseHomepageSection(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('homepage_sections')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to delete homepage section ${id}:`, err);
    return false;
  }
}

export async function swapHomepageSectionOrderInDb(id1: string, order1: number, id2: string, order2: number): Promise<boolean> {
  try {
    const { error: err1 } = await supabase.from('homepage_sections').update({ sort_order: order2 }).eq('id', id1);
    const { error: err2 } = await supabase.from('homepage_sections').update({ sort_order: order1 }).eq('id', id2);
    if (err1 || err2) throw err1 || err2;
    return true;
  } catch (err) {
    console.error("Failed to swap homepage sections order:", err);
    return false;
  }
}

// Items under section
export async function addSupabaseHomepageSectionItem(item: any): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('homepage_section_items')
      .insert([{
        section_id: item.section_id,
        display_title: item.display_title || null,
        display_subtitle: item.display_subtitle || null,
        display_image_url: item.display_image_url || null,
        linked_type: item.linked_type,
        linked_id: item.linked_id,
        sort_order: item.sort_order || 0,
        is_visible: item.is_visible !== undefined ? item.is_visible : true
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to add homepage section item:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateSupabaseHomepageSectionItem(id: string, updates: any): Promise<boolean> {
  try {
    const dbUpdates: any = {};
    if (updates.display_title !== undefined) dbUpdates.display_title = updates.display_title;
    if (updates.display_subtitle !== undefined) dbUpdates.display_subtitle = updates.display_subtitle;
    if (updates.display_image_url !== undefined) dbUpdates.display_image_url = updates.display_image_url;
    if (updates.is_visible !== undefined) dbUpdates.is_visible = updates.is_visible;
    if (updates.sort_order !== undefined) dbUpdates.sort_order = updates.sort_order;

    const { error } = await supabase
      .from('homepage_section_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update homepage section item ${id}:`, err);
    return false;
  }
}

export async function deleteSupabaseHomepageSectionItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('homepage_section_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to delete homepage section item ${id}:`, err);
    return false;
  }
}

export async function swapHomepageSectionItemOrderInDb(id1: string, order1: number, id2: string, order2: number): Promise<boolean> {
  try {
    const { error: err1 } = await supabase.from('homepage_section_items').update({ sort_order: order2 }).eq('id', id1);
    const { error: err2 } = await supabase.from('homepage_section_items').update({ sort_order: order1 }).eq('id', id2);
    if (err1 || err2) throw err1 || err2;
    return true;
  } catch (err) {
    console.error("Failed to swap homepage section item order:", err);
    return false;
  }
}

export async function seedDefaultHomepageSections(): Promise<boolean> {
  try {
    // 1. Create a section for Categories
    const { data: catSec, error: catSecErr } = await supabase
      .from('homepage_sections')
      .insert([{
        title: "الأقسام المميزة",
        subtitle: "اكتشف مجموعاتنا المصنفة بعناية",
        section_type: "categories",
        sort_order: 0,
        is_visible: true
      }])
      .select()
      .single();

    if (catSecErr) throw catSecErr;

    // Fetch active categories
    const categories = await getSupabaseCategories();
    if (categories && categories.length > 0) {
      const catItems = categories.map((c, index) => ({
        section_id: catSec.id,
        linked_type: "category",
        linked_id: c.id,
        sort_order: index,
        is_visible: true
      }));
      const { error: catItemsErr } = await supabase
        .from('homepage_section_items')
        .insert(catItems);
      if (catItemsErr) console.error("Error seeding default category items:", catItemsErr);
    }

    // 2. Create a section for Products
    const { data: prodSec, error: prodSecErr } = await supabase
      .from('homepage_sections')
      .insert([{
        title: "الأكثر طلباً",
        subtitle: "تصاميم حصرية تميز إطلالتك في يوم تخرجك",
        section_type: "products",
        sort_order: 1,
        is_visible: true
      }])
      .select()
      .single();

    if (prodSecErr) throw prodSecErr;

    // Fetch active products
    const products = await getSupabaseProducts();
    const featuredProds = products.slice(0, 4);
    if (featuredProds && featuredProds.length > 0) {
      const prodItems = featuredProds.map((p, index) => ({
        section_id: prodSec.id,
        linked_type: "product",
        linked_id: p.id,
        sort_order: index,
        is_visible: true
      }));
      const { error: prodItemsErr } = await supabase
        .from('homepage_section_items')
        .insert(prodItems);
      if (prodItemsErr) console.error("Error seeding default product items:", prodItemsErr);
    }

    return true;
  } catch (err) {
    console.error("Failed to seed default homepage sections:", err);
    return false;
  }
}

// =====================================================================
// 📜 نظام طلبات التعديل والموافقة الآمنة (Order Change Requests APIs)
// =====================================================================

export interface OrderChangeRequest {
  id: string;
  order_id: string;
  user_id: string;
  requested_changes: {
    event_date?: string | null;
    pickup_date?: string | null;
    return_date?: string | null;
    return_option?: "same_day" | "next_day";
    is_preliminary_reservation?: boolean;
    customer_notes?: string;
    customer_phone?: string;
    customer_backup_phone?: string;
    customer_city?: string;
    customer_street?: string;
    customer_address_details?: string;
    [key: string]: any;
  };
  customer_note?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  admin_note?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  order?: any; // populated for admin
}

// Fallback localStorage Helpers
function getMockChangeRequests(): OrderChangeRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("jaguar_order_change_requests");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveMockChangeRequests(requests: OrderChangeRequest[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jaguar_order_change_requests", JSON.stringify(requests));
  } catch (err) {
    console.error("Failed to save mock change requests:", err);
  }
}

export async function submitSupabaseOrderChangeRequest(
  orderId: string,
  userId: string,
  changes: any,
  customerNote: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // 1. Try checking for existing pending request
    const { data: existing, error: checkError } = await supabase
      .from('order_change_requests')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let result;
    if (existing) {
      // Update existing pending request
      const { data, error } = await supabase
        .from('order_change_requests')
        .update({
          requested_changes: changes,
          customer_note: customerNote,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert new pending request
      const { data, error } = await supabase
        .from('order_change_requests')
        .insert([{
          order_id: orderId,
          user_id: userId,
          requested_changes: changes,
          customer_note: customerNote,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.warn("DB change request submission failed, using local fallback:", err);
    
    // LocalStorage Fallback
    const requests = getMockChangeRequests();
    const existingIdx = requests.findIndex(r => r.order_id === orderId && r.status === 'pending');
    
    const nowStr = new Date().toISOString();
    let mockReq: OrderChangeRequest;

    if (existingIdx !== -1) {
      requests[existingIdx] = {
        ...requests[existingIdx],
        requested_changes: changes,
        customer_note: customerNote,
        updated_at: nowStr
      };
      mockReq = requests[existingIdx];
    } else {
      mockReq = {
        id: Math.random().toString(36).substring(2, 9),
        order_id: orderId,
        user_id: userId,
        requested_changes: changes,
        customer_note: customerNote,
        status: 'pending',
        created_at: nowStr,
        updated_at: nowStr
      };
      requests.push(mockReq);
    }
    
    saveMockChangeRequests(requests);
    return { success: true, data: mockReq };
  }
}

export async function cancelSupabaseOrderChangeRequest(
  requestId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('order_change_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("DB change request cancellation failed, using local fallback:", err);
    
    // LocalStorage Fallback
    const requests = getMockChangeRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx !== -1) {
      requests[idx].status = 'cancelled';
      requests[idx].updated_at = new Date().toISOString();
      saveMockChangeRequests(requests);
      return true;
    }
    return false;
  }
}

export async function getSupabaseOrderChangeRequestsForUser(
  userId: string
): Promise<OrderChangeRequest[]> {
  try {
    const { data, error } = await supabase
      .from('order_change_requests')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("DB fetch change requests failed, using local fallback:", err);
    return getMockChangeRequests().filter(r => r.user_id === userId);
  }
}

export async function getSupabasePendingChangeRequestsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('order_change_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.warn("DB pending requests count failed, using local fallback:", err);
    return getMockChangeRequests().filter(r => r.status === 'pending').length;
  }
}

export async function getSupabaseAllChangeRequests(): Promise<OrderChangeRequest[]> {
  try {
    const { data: requests, error } = await supabase
      .from('order_change_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // We can also fetch the order details for these requests
    const { data: orders } = await supabase
      .from('orders')
      .select('*');

    const ordersMap = (orders || []).reduce((acc: any, ord: any) => {
      acc[ord.id] = ord;
      return acc;
    }, {});

    return (requests || []).map(r => ({
      ...r,
      order: ordersMap[r.order_id] || null
    }));
  } catch (err) {
    console.warn("DB all change requests failed, using local fallback:", err);
    const requests = getMockChangeRequests();
    
    // Try to get mock orders or real orders to attach
    let orders: any[] = [];
    try {
      const { data } = await supabase.from('orders').select('*');
      orders = data || [];
    } catch {}

    const ordersMap = orders.reduce((acc: any, ord: any) => {
      acc[ord.id] = ord;
      return acc;
    }, {});

    return requests.map(r => ({
      ...r,
      order: ordersMap[r.order_id] || null
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

// Admin approvals secure calls
export async function adminApproveChangeRequest(
  requestId: string,
  adminNote: string,
  passcode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .rpc('admin_approve_change_request', {
        p_request_id: requestId,
        p_admin_note: adminNote,
        p_passcode: passcode
      });

    if (error) throw error;
    return { success: !!data };
  } catch (err: any) {
    console.warn("DB secure approval RPC failed, trying whitelisted client update:", err);

    if (passcode !== '9922') {
      return { success: false, error: "رمز مرور المسؤول غير صحيح." };
    }

    try {
      // Find the request from local storage or database
      let req: OrderChangeRequest | null = null;
      
      try {
        const { data } = await supabase
          .from('order_change_requests')
          .select('*')
          .eq('id', requestId)
          .single();
        req = data;
      } catch {}

      if (!req) {
        const requests = getMockChangeRequests();
        req = requests.find(r => r.id === requestId) || null;
      }

      if (!req || req.status !== 'pending') {
        return { success: false, error: "طلب التعديل غير موجود أو ليس معلقاً." };
      }

      const whitelist = req.requested_changes;
      const cleanUpdates: any = {};
      
      // Strict Whitelist Filtering Client-Side for resilient fallback
      if (whitelist.event_date !== undefined) cleanUpdates.event_date = whitelist.event_date;
      if (whitelist.pickup_date !== undefined) cleanUpdates.pickup_date = whitelist.pickup_date;
      if (whitelist.return_date !== undefined) cleanUpdates.return_date = whitelist.return_date;
      if (whitelist.customer_notes !== undefined) cleanUpdates.customer_notes = whitelist.customer_notes;
      if (whitelist.customer_phone !== undefined) cleanUpdates.guest_phone = whitelist.customer_phone;
      if (whitelist.customer_backup_phone !== undefined) cleanUpdates.guest_backup_phone = whitelist.customer_backup_phone;
      if (whitelist.customer_city !== undefined) cleanUpdates.guest_city = whitelist.customer_city;
      if (whitelist.customer_street !== undefined) cleanUpdates.guest_street = whitelist.customer_street;
      if (whitelist.customer_address_details !== undefined) cleanUpdates.guest_address_detail = whitelist.customer_address_details;
      
      // Handle preliminary conversion safely
      if (whitelist.is_preliminary_reservation !== undefined) {
        cleanUpdates.is_preliminary = whitelist.is_preliminary_reservation;
      } else if (whitelist.is_preliminary !== undefined) {
        cleanUpdates.is_preliminary = whitelist.is_preliminary;
      }

      // 1. Update the real order
      const { error: ordErr } = await supabase
        .from('orders')
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.order_id);

      if (ordErr) {
        console.warn("Could not update order in DB directly, applying local mock order update...");
      }

      // 2. Mark request as approved
      try {
        const { error: reqErr } = await supabase
          .from('order_change_requests')
          .update({
            status: 'approved',
            admin_note: adminNote,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', requestId);
        if (reqErr) throw reqErr;
      } catch {
        // Fallback for requests stored locally
        const requests = getMockChangeRequests();
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx !== -1) {
          requests[idx].status = 'approved';
          requests[idx].admin_note = adminNote;
          requests[idx].reviewed_at = new Date().toISOString();
          saveMockChangeRequests(requests);
        }
      }

      return { success: true };
    } catch (fallbackErr: any) {
      console.error("Fallback approval completely failed:", fallbackErr);
      return { success: false, error: fallbackErr?.message || String(fallbackErr) };
    }
  }
}

export async function adminRejectChangeRequest(
  requestId: string,
  adminNote: string,
  passcode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .rpc('admin_reject_change_request', {
        p_request_id: requestId,
        p_admin_note: adminNote,
        p_passcode: passcode
      });

    if (error) throw error;
    return { success: !!data };
  } catch (err: any) {
    console.warn("DB secure rejection RPC failed, trying whitelisted client update:", err);

    if (passcode !== '9922') {
      return { success: false, error: "رمز مرور المسؤول غير صحيح." };
    }

    try {
      // Mark request as rejected
      try {
        const { error: reqErr } = await supabase
          .from('order_change_requests')
          .update({
            status: 'rejected',
            admin_note: adminNote,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', requestId);
        if (reqErr) throw reqErr;
      } catch {
        // Fallback for requests stored locally
        const requests = getMockChangeRequests();
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx !== -1) {
          requests[idx].status = 'rejected';
          requests[idx].admin_note = adminNote;
          requests[idx].reviewed_at = new Date().toISOString();
          saveMockChangeRequests(requests);
        }
      }

      return { success: true };
    } catch (fallbackErr: any) {
      return { success: false, error: fallbackErr?.message || String(fallbackErr) };
    }
  }
}

// =====================================================================
// 📜 نظام إلغاء الطلبيات من قبل العملاء (Order Cancellation Requests)
// =====================================================================

export async function requestOrderCancellation(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('request_order_cancellation', {
      p_order_id: orderId
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn("DB request cancellation failed, trying local fallback:", err);
    try {
      const requests = getMockChangeRequests();
      const existingIdx = requests.findIndex(r => r.order_id === orderId && r.status === 'pending');
      const nowStr = new Date().toISOString();
      if (existingIdx !== -1) {
        requests[existingIdx].status = 'pending';
        requests[existingIdx].updated_at = nowStr;
      } else {
        const mockReq: OrderChangeRequest = {
          id: Math.random().toString(36).substring(2, 9),
          order_id: orderId,
          user_id: 'mock-user-id',
          requested_changes: { request_type: 'cancellation' },
          customer_note: 'طلب إلغاء الطلب من الزبون',
          status: 'pending',
          created_at: nowStr,
          updated_at: nowStr
        };
        requests.push(mockReq);
      }
      saveMockChangeRequests(requests);
      return { success: true };
    } catch (fallbackErr: any) {
      return { success: false, error: fallbackErr?.message || String(fallbackErr) };
    }
  }
}

export async function approveOrderCancellation(
  orderId: string,
  passcode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('approve_order_cancellation', {
      p_order_id: orderId,
      p_passcode: passcode
    });
    if (error) throw error;
    return { success: !!data };
  } catch (err: any) {
    console.warn("DB approve cancellation failed, trying local fallback:", err);
    if (passcode !== '9922') {
      return { success: false, error: "رمز مرور المسؤول غير صحيح." };
    }
    try {
      const requests = getMockChangeRequests();
      const idx = requests.findIndex(r => r.order_id === orderId && r.status === 'pending');
      if (idx !== -1) {
        requests[idx].status = 'approved';
        requests[idx].reviewed_at = new Date().toISOString();
        saveMockChangeRequests(requests);
      }
      return { success: true };
    } catch (fallbackErr: any) {
      return { success: false, error: fallbackErr?.message || String(fallbackErr) };
    }
  }
}

export async function rejectOrderCancellation(
  orderId: string,
  passcode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('reject_order_cancellation', {
      p_order_id: orderId,
      p_passcode: passcode
    });
    if (error) throw error;
    return { success: !!data };
  } catch (err: any) {
    console.warn("DB reject cancellation failed, trying local fallback:", err);
    if (passcode !== '9922') {
      return { success: false, error: "رمز مرور المسؤول غير صحيح." };
    }
    try {
      const requests = getMockChangeRequests();
      const idx = requests.findIndex(r => r.order_id === orderId && r.status === 'pending');
      if (idx !== -1) {
        requests[idx].status = 'rejected';
        requests[idx].reviewed_at = new Date().toISOString();
        saveMockChangeRequests(requests);
      }
      return { success: true };
    } catch (fallbackErr: any) {
      return { success: false, error: fallbackErr?.message || String(fallbackErr) };
    }
  }
}
// =====================================================================
// ⚙️ Settings Functions
// =====================================================================
export async function getSettings(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    
    const settingsMap: Record<string, string> = {
      store_name: "جاغوار للمناسبات",
      admin_pin: "9922",
      theme_primary: "#d4af37",
      theme_dark_mode: "true",
      print_header: "جاغوار للمناسبات - طرابلس",
      print_footer: "شكراً لتعاملكم معنا"
    };

    if (data) {
      data.forEach(item => {
        settingsMap[item.key] = item.value;
      });
    }
    return settingsMap;
  } catch (err) {
    console.warn("Failed to fetch settings, using defaults:", err);
    return {
      store_name: "جاغوار للمناسبات",
      admin_pin: "9922",
      theme_primary: "#d4af37",
      theme_dark_mode: "true",
      print_header: "جاغوار للمناسبات - طرابلس",
      print_footer: "شكراً لتعاملكم معنا"
    };
  }
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update setting ${key}:`, err);
    return false;
  }
}

// =====================================================================
// 📦 Products Functions
// =====================================================================
export async function getProducts(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export async function addProduct(product: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      name: product.name,
      image: product.image || null,
      code: product.code || `JG-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: product.barcode || `BAR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      category: product.category,
      size: product.size || null,
      colors: product.colors || null,
      notes: product.notes || null,
      quantity: Number(product.quantity || 1),
      status: product.status || 'available',
      price_sale: Number(product.price_sale || 0),
      price_rent: Number(product.price_rent || 0),
      item_mode: product.item_mode || 'both',
      is_edged: !!product.is_edged,
      layer_type: product.layer_type || null,
      fabric_type: product.fabric_type || null,
      color_sash: product.color_sash || null,
      color_print: product.color_print || null,
      color_embroidery: product.color_embroidery || null
    };

    const { data, error } = await supabase.from('products').insert([payload]).select().single();
    if (error) throw error;

    await logActivity('add', 'products', id, { name: product.name, code: payload.code });
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to add product:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateProduct(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
    await logActivity('edit', 'products', id, updates);
    return true;
  } catch (err) {
    console.error(`Failed to update product ${id}:`, err);
    return false;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'products', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete product ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 👥 Customers Functions
// =====================================================================
export async function getCustomers(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    return [];
  }
}

export async function addCustomer(customer: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      name: customer.name,
      whatsapp: customer.whatsapp || null,
      phone: customer.phone || null,
      address: customer.address || null,
      id_type: customer.id_type || null,
      id_name: customer.id_name || null
    };

    const { data, error } = await supabase.from('customers').insert([payload]).select().single();
    if (error) throw error;

    await logActivity('add', 'customers', id, { name: customer.name });
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to add customer:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateCustomer(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').update(updates).eq('id', id);
    if (error) throw error;
    await logActivity('edit', 'customers', id, updates);
    return true;
  } catch (err) {
    console.error(`Failed to update customer ${id}:`, err);
    return false;
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'customers', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete customer ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 📅 Reservations Functions
// =====================================================================
export async function getReservations(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        customers:customer_id(*),
        items:reservation_items(
          *,
          products:product_id(*)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch reservations:", err);
    return [];
  }
}

export async function addReservation(reservation: any, items: any[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const resId = generateUUID();
    const reservationNumber = reservation.reservation_number || `RES-${Date.now().toString().slice(-6)}`;
    
    // 1. Insert reservation
    const resPayload = {
      id: resId,
      reservation_number: reservationNumber,
      customer_id: reservation.customer_id,
      start_date: reservation.start_date,
      pickup_date: reservation.pickup_date,
      return_date: reservation.return_date,
      total_amount: Number(reservation.total_amount || 0),
      deposit: Number(reservation.deposit || 0),
      remaining: Number(reservation.remaining || 0),
      payment_status: reservation.payment_status || 'unpaid',
      status: reservation.status || 'active',
      notes: reservation.notes || null,
      delivery_method: reservation.delivery_method || 'store_pickup'
    };

    const { error: resErr } = await supabase.from('reservations').insert([resPayload]);
    if (resErr) throw resErr;

    // 2. Insert items
    const itemsPayload = items.map(item => ({
      reservation_id: resId,
      product_id: item.product_id,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));

    const { error: itemsErr } = await supabase.from('reservation_items').insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    // 3. Register deposit payment if > 0
    if (Number(reservation.deposit) > 0) {
      await addPayment({
        amount: Number(reservation.deposit),
        date: reservation.start_date,
        movement_type: 'deposit',
        linked_operation_type: 'reservation',
        linked_operation_id: resId,
        notes: `عربون الحجز رقم ${reservationNumber}`,
        payment_status: 'completed'
      });
    }

    // 4. Update product statuses to 'reserved'
    for (const item of items) {
      await updateProduct(item.product_id, { status: 'reserved' });
    }

    await logActivity('add', 'reservations', resId, { reservation_number: reservationNumber });
    return { success: true, data: { id: resId, reservation_number: reservationNumber } };
  } catch (err: any) {
    console.error("Failed to add reservation:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateReservation(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('reservations').update(updates).eq('id', id);
    if (error) throw error;
    await logActivity('edit', 'reservations', id, updates);
    return true;
  } catch (err) {
    console.error(`Failed to update reservation ${id}:`, err);
    return false;
  }
}

export async function deleteReservation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'reservations', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete reservation ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 🔑 Rentals Functions
// =====================================================================
export async function getRentals(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customers:customer_id(*),
        items:rental_items(
          *,
          products:product_id(*)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch rentals:", err);
    return [];
  }
}

export async function addRental(rental: any, items: any[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const rentId = generateUUID();
    const operationNumber = rental.operation_number || `RNT-${Date.now().toString().slice(-6)}`;

    // 1. Insert rental
    const rentPayload = {
      id: rentId,
      operation_number: operationNumber,
      customer_id: rental.customer_id,
      start_date: rental.start_date,
      end_date: rental.end_date,
      actual_delivery_date: rental.actual_delivery_date || null,
      expected_return_date: rental.expected_return_date,
      actual_return_date: rental.actual_return_date || null,
      rental_value: Number(rental.rental_value || 0),
      deposit: Number(rental.deposit || 0),
      remaining: Number(rental.remaining || 0),
      status: rental.status || 'rented',
      return_status: rental.return_status || 'not_returned',
      notes: rental.notes || null,
      delay_fine: Number(rental.delay_fine || 0)
    };

    const { error: rentErr } = await supabase.from('rentals').insert([rentPayload]);
    if (rentErr) throw rentErr;

    // 2. Insert items
    const itemsPayload = items.map(item => ({
      rental_id: rentId,
      product_id: item.product_id,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));

    const { error: itemsErr } = await supabase.from('rental_items').insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    // 3. Register deposit payment if > 0
    if (Number(rental.deposit) > 0) {
      await addPayment({
        amount: Number(rental.deposit),
        date: rental.start_date,
        movement_type: 'deposit',
        linked_operation_type: 'rental',
        linked_operation_id: rentId,
        notes: `عربون إيجار رقم ${operationNumber}`,
        payment_status: 'completed'
      });
    }

    // 4. Update products status to 'rented'
    for (const item of items) {
      await updateProduct(item.product_id, { status: 'rented' });
    }

    await logActivity('add', 'rentals', rentId, { operation_number: operationNumber });
    return { success: true, data: { id: rentId, operation_number: operationNumber } };
  } catch (err: any) {
    console.error("Failed to add rental:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function updateRental(id: string, updates: any): Promise<boolean> {
  try {
    const { error } = await supabase.from('rentals').update(updates).eq('id', id);
    if (error) throw error;
    await logActivity('edit', 'rentals', id, updates);
    return true;
  } catch (err) {
    console.error(`Failed to update rental ${id}:`, err);
    return false;
  }
}

export async function deleteRental(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('rentals').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'rentals', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete rental ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 💰 Sales Functions
// =====================================================================
export async function getOrders(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers:customer_id(*),
        items:order_items(
          *,
          products:product_id(*)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch orders (sales):", err);
    return [];
  }
}

export async function addOrder(order: any, items: any[]): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const orderId = generateUUID();
    const orderNumber = order.order_number || `SLS-${Date.now().toString().slice(-6)}`;

    // 1. Insert order record
    const orderPayload = {
      id: orderId,
      order_number: orderNumber,
      customer_id: order.customer_id,
      total_amount: Number(order.total_amount || 0),
      payment_status: order.payment_status || 'paid',
      status: order.status || 'completed',
      customer_notes: order.notes || order.customer_notes || null,
      deposit: Number(order.deposit || 0),
      remaining: Number(order.remaining || 0),
      event_date: order.event_date || null,
      pickup_date: order.pickup_date || null,
      return_date: order.return_date || null,
      is_preliminary: order.is_preliminary || false
    };

    const { error: orderErr } = await supabase.from('orders').insert([orderPayload]);
    if (orderErr) throw orderErr;

    // 2. Insert items
    const itemsPayload = items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    // 3. Register payment
    await addPayment({
      amount: Number(order.deposit !== undefined ? order.deposit : order.total_amount),
      date: new Date().toISOString().split('T')[0],
      movement_type: order.payment_status === 'paid' ? 'cash' : 'partial',
      linked_operation_type: 'order',
      linked_operation_id: orderId,
      notes: `فاتورة بيع رقم ${orderNumber}`,
      payment_status: 'completed'
    });

    // 4. Update products status to 'sold' (and decrement stock quantity)
    for (const item of items) {
      if (item.product_id) {
        // Get current stock
        const { data: prodData } = await supabase.from('products').select('quantity').eq('id', item.product_id).single();
        const currentQty = prodData?.quantity || 1;
        const newQty = Math.max(0, currentQty - Number(item.quantity));
        
        await updateProduct(item.product_id, { 
          status: newQty === 0 ? 'sold' : 'available',
          quantity: newQty
        });
      }
    }

    await logActivity('add', 'orders', orderId, { order_number: orderNumber });
    return { success: true, data: { id: orderId, order_number: orderNumber } };
  } catch (err: any) {
    console.error("Failed to add order (sale):", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'orders', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete order ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 💸 Payments Functions
// =====================================================================
export async function getPayments(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch payments:", err);
    return [];
  }
}

export async function addPayment(payment: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      amount: Number(payment.amount),
      date: payment.date || new Date().toISOString().split('T')[0],
      movement_type: payment.movement_type, // cash, transfer, partial, deposit, final_payment, refund
      linked_operation_type: payment.linked_operation_type || null,
      linked_operation_id: payment.linked_operation_id || null,
      notes: payment.notes || null,
      payment_status: payment.payment_status || 'completed'
    };

    const { data, error } = await supabase.from('payments').insert([payload]).select().single();
    if (error) throw error;

    await logActivity('add', 'payments', id, { amount: payment.amount, type: payment.movement_type });
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to add payment:", err);
    return { success: false, error: err.message || String(err) };
  }
}

export async function deletePayment(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
    await logActivity('delete', 'payments', id, { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete payment ${id}:`, err);
    return false;
  }
}

// =====================================================================
// 🚚 Deliveries Functions
// =====================================================================
export async function getDeliveries(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('deliveries').select('*').order('delivery_date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch deliveries:", err);
    return [];
  }
}

export async function addDelivery(delivery: any): Promise<boolean> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      linked_operation_type: delivery.linked_operation_type,
      linked_operation_id: delivery.linked_operation_id,
      delivery_date: delivery.delivery_date || new Date().toISOString().split('T')[0],
      notes: delivery.notes || null,
      status: delivery.status || 'delivered'
    };

    const { error } = await supabase.from('deliveries').insert([payload]);
    if (error) throw error;

    // Log activity
    await logActivity('add', 'deliveries', id, { linked_type: delivery.linked_operation_type, operation_id: delivery.linked_operation_id });
    return true;
  } catch (err) {
    console.error("Failed to record delivery:", err);
    return false;
  }
}

// =====================================================================
// 🔄 Returns Functions
// =====================================================================
export async function getReturns(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('returns').select('*').order('return_date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch returns:", err);
    return [];
  }
}

export async function addReturn(returnRecord: any): Promise<boolean> {
  try {
    const id = generateUUID();
    const payload = {
      id,
      linked_operation_type: returnRecord.linked_operation_type,
      linked_operation_id: returnRecord.linked_operation_id,
      return_date: returnRecord.return_date || new Date().toISOString().split('T')[0],
      notes: returnRecord.notes || null,
      status: returnRecord.status || 'returned'
    };

    const { error } = await supabase.from('returns').insert([payload]);
    if (error) throw error;

    // Log activity
    await logActivity('add', 'returns', id, { linked_type: returnRecord.linked_operation_type, operation_id: returnRecord.linked_operation_id });
    return true;
  } catch (err) {
    console.error("Failed to record return:", err);
    return false;
  }
}

// =====================================================================
// 🔔 Notifications Functions
// =====================================================================
export async function getNotifications(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to mark notification ${id} as read:`, err);
    return false;
  }
}

export async function addNotification(notification: any): Promise<boolean> {
  try {
    const payload = {
      id: generateUUID(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      is_read: false,
      linked_operation_type: notification.linked_operation_type || null,
      linked_operation_id: notification.linked_operation_id || null
    };
    const { error } = await supabase.from('notifications').insert([payload]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Failed to add notification:", err);
    return false;
  }
}

// =====================================================================
// 📜 Activity Log Functions
// =====================================================================
export async function getActivityLogs(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to fetch activity logs:", err);
    return [];
  }
}

export async function logActivity(actionType: 'add' | 'edit' | 'delete', tableName: string, recordId: string, details: any): Promise<boolean> {
  try {
    const payload = {
      id: generateUUID(),
      action_by: 'المالك',
      action_type: actionType,
      table_name: tableName,
      record_id: recordId,
      details: details ? JSON.parse(JSON.stringify(details)) : null
    };

    const { error } = await supabase.from('activity_logs').insert([payload]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("Failed to write activity log:", err);
    return false;
  }
}
