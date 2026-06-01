import { createClient } from '@supabase/supabase-js';

// These should be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uxsixllbppablltuvtkj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cf8BqtzedCI5qHgtt0gWRA_TihclIWq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    name: "كيبان كويتي فاخر",
    priceSale: 85,
    priceRent: 40,
    description: "كيب تخرج بتصميم كويتي أصيل، مصنوع من أجود أنواع المخمل الفاخر. يتميز بتفاصيل ذهبية دقيقة وحياكة يدوية متقنة تضمن لك إطلالة استثنائية في يوم تخرجك. متوفر للبيع والإيجار.",
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
    description: "شال تخرج مطرز بخيوط حريرية فاخرة. يمكنك طلب كتابة اسمك وسنة التخرج بألوان متعددة. نسيج ناعم ومقاوم للتجعد.",
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
    description: "قبعة تخرج كلاسيكية مصنوعة من القطيفة الفاخرة مع شراشيب حريرية طويلة متدلية بلون ذهبي لامع.",
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
  store_name: "جاغوار للمناسبات",
  announcement_text: "تنسيق وتطريز فاخر لكافة مستلزمات التخرج 🎓",
  hero_title: "لحظة تخرجك، بأرقى المعايير",
  hero_subtitle: "اكتشف مجموعتنا الحصرية والراقية من كيبان التخرج، القبعات، والشالات المطرزة بالاسم. إيجار وبيع مع خدمة حجز متكاملة.",
  whatsapp_number: "+218921234567",
  contact_phone: "+218921234567",
  instagram_link: "https://instagram.com",
  tiktok_link: "https://tiktok.com",
  location: "طرابلس، ليبيا",
  about_text: "جاغوار للمناسبات هو خياركم الأول للتميز والظهور بأرقى إطلالة في حفلات تخرجكم.",
  footer_text: "جميع الحقوق محفوظة © 2026 جاغوار للمناسبات"
};

// 4 main categories requested - clean from promotional adjectives
export const defaultCategories = [
  { id: "gowns", name: "كيبان تخرج", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop", desc: "تشكيلة كيبان كويتية وكلاسيكية فاخرة", is_active: true, sort_order: 0 },
  { id: "sashes", name: "شيلان تخرج", image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop", desc: "شيلان مطرزة مخصصة بالأسماء", is_active: true, sort_order: 1 },
  { id: "caps", name: "قبعات تخرج", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop", desc: "قبعات مخمل وستان تناسب جميع الأذواق", is_active: true, sort_order: 2 },
  { id: "pins", name: "إكسسوارات التخرج", image: "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=800&auto=format&fit=crop", desc: "بروشات وإكسسوارات تخرج معدنية ومطلية بالذهب", is_active: true, sort_order: 3 },
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
    if (!data || data.length === 0) return defaultCategories;

    return data;
  } catch (err) {
    console.warn("Failed to get categories from Supabase, using defaults:", err);
    return defaultCategories;
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
        is_active: category.is_active !== undefined ? category.is_active : true
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
    if (!data || data.length === 0) return mockProducts;

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
    console.warn("Supabase products fetch failed, using mock fallbacks:", err);
    return mockProducts;
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
    // 1. Create order
    const { data: dbOrder, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: order.customer_id || null,
        guest_name: order.guest_name,
        guest_phone: order.guest_phone,
        guest_backup_phone: order.guest_backup_phone || "",
        guest_city: order.guest_city,
        guest_street: order.guest_street,
        guest_address_detail: order.guest_address_detail || "",
        customer_notes: order.customer_notes || "",
        status: order.status || 'new_order',
        payment_method: order.payment_method || 'cash_on_delivery',
        total_amount: Number(order.total_amount),
        tracking_number: order.tracking_number
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const orderItemsPayload = items.map(item => ({
      order_id: dbOrder.id,
      product_id: item.product_id || item.id || null,
      product_name: item.product_name || item.name,
      product_image: item.product_image || item.image || "",
      quantity: Number(item.quantity || 1),
      price_at_purchase: Number(item.price_at_purchase || item.price || 0),
      item_mode: item.item_mode || item.mode || 'sale'
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) throw itemsError;

    return { success: true, data: dbOrder };
  } catch (err: any) {
    console.error("Failed to create order in Supabase:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateSupabaseOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update order status ${orderId}:`, err);
    return false;
  }
}

export async function updateSupabaseOrderDetails(orderId: string, updates: any): Promise<boolean> {
  try {
    const dbUpdates: any = {};
    if (updates.guest_name !== undefined) dbUpdates.guest_name = updates.guest_name;
    if (updates.guest_phone !== undefined) dbUpdates.guest_phone = updates.guest_phone;
    if (updates.guest_backup_phone !== undefined) dbUpdates.guest_backup_phone = updates.guest_backup_phone;
    if (updates.guest_city !== undefined) dbUpdates.guest_city = updates.guest_city;
    if (updates.guest_street !== undefined) dbUpdates.guest_street = updates.guest_street;
    if (updates.guest_address_detail !== undefined) dbUpdates.guest_address_detail = updates.guest_address_detail;
    if (updates.customer_notes !== undefined) dbUpdates.customer_notes = updates.customer_notes;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.payment_method !== undefined) dbUpdates.payment_method = updates.payment_method;
    if (updates.total_amount !== undefined) dbUpdates.total_amount = Number(updates.total_amount);

    const { error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update order ${orderId}:`, err);
    return false;
  }
}

export async function deleteSupabaseOrder(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to delete order ${orderId}:`, err);
    return false;
  }
}

// =====================================================================
// 📂 ملفات وحسابات المشتركين (Customer Profiles)
// =====================================================================
export async function getSupabaseCustomerProfiles(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Failed to get customer profiles:", err);
    return [];
  }
}

export async function getSupabaseUserProfile(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn(`Failed to get profile for ${userId}:`, err);
    return null;
  }
}

export async function updateSupabaseUserProfile(userId: string, profile: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: profile.name,
        phone: profile.phone,
        backup_phone: profile.backup_phone || "",
        city: profile.city,
        street: profile.street,
        additional_address: profile.additional_address || "",
        updated_at: new Date().toISOString()
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Failed to update profile for ${userId}:`, err);
    return false;
  }
}
