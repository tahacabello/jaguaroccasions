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
export async function uploadProductImage(file: File, filename: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${Date.now()}_${filename}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error("Storage upload failed, returning object url:", err);
    return URL.createObjectURL(file);
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

    return data.map(item => ({
      id: item.id,
      name: item.name,
      priceSale: Number(item.sale_price || 0),
      priceRent: Number(item.rent_price || 0),
      description: item.description,
      image: resolveAssetPath(item.image || ""),
      images: item.images ? item.images.map((img: string) => resolveAssetPath(img)) : [],
      status: item.status,
      categoryId: item.category_id,
      subcategoryId: item.subcategory_id,
      stockQuantity: item.stock_quantity || 0,
      isFeatured: item.is_featured || false,
      isHidden: item.is_hidden || false,
      code: item.code,
      sortOrder: item.sort_order || 0
    }));
  } catch (err) {
    console.warn("Supabase products fetch failed:", err);
    return [];
  }
}

export async function addSupabaseProduct(product: any) {
  try {
    const dbItem = {
      name: product.name,
      sale_price: Number(product.priceSale || 0),
      rent_price: Number(product.priceRent || 0),
      description: product.description || "",
      image: product.image || "",
      images: product.images || [],
      status: product.status || "available",
      category_id: product.categoryId || null,
      subcategory_id: product.subcategoryId || null,
      stock_quantity: Number(product.stockQuantity || 10),
      is_featured: product.isFeatured || false,
      is_hidden: product.isHidden || false,
      code: product.code || `JG-${Math.floor(100000 + Math.random() * 900000)}`,
      sort_order: Number(product.sortOrder || 0)
    };

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
    if (updates.priceSale !== undefined) dbUpdates.sale_price = Number(updates.priceSale);
    if (updates.priceRent !== undefined) dbUpdates.rent_price = Number(updates.priceRent);
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.subcategoryId !== undefined) dbUpdates.subcategory_id = updates.subcategoryId;
    if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = Number(updates.stockQuantity);
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
    if (updates.isHidden !== undefined) dbUpdates.is_hidden = updates.isHidden;
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = Number(updates.sortOrder);

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


