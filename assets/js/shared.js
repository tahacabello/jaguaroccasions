
const DEFAULT_CATEGORIES = [
  { id: "cat-gowns", name: "كيبان التخرج", slug: "graduation-gowns", sort_order: 1 },
  { id: "cat-caps", name: "قبعات التخرج", slug: "graduation-caps", sort_order: 2 },
  { id: "cat-sashes", name: "شالات التخرج", slug: "graduation-sashes", sort_order: 3 },
  { id: "cat-pins", name: "بروشات التخرج", slug: "graduation-pins", sort_order: 4 },
  { id: "cat-accessories", name: "إكسسوارات التصوير", slug: "photo-accessories", sort_order: 5 },
  { id: "cat-kids", name: "كيبان الأطفال", slug: "kids-gowns", sort_order: 6 }
];

const DEFAULT_PRODUCTS = [
  {
    id: "demo-kuwaiti-cap",
    category_id: "cat-gowns",
    category_name: "كيبان التخرج",
    name: "كاب كويتي",
    code: "JG-001",
    status: "available",
    item_mode: "both",
    rent_price: 85,
    sale_price: 375,
    currency: "LYD",
    description: "نموذج تجريبي. يمكن للأدمن تعديل المنتج أو حذفه من لوحة التحكم بعد ربط Supabase.",
    is_featured: true,
    primary_image: "assets/images/demo-kuwaiti-cap.webp"
  }
];

const STATUS_LABELS = {
  available: "متوفر",
  reserved: "محجوز",
  unavailable: "غير متوفر"
};

const MODE_LABELS = {
  sale: "بيع",
  rent: "إيجار",
  both: "بيع وإيجار"
};

function byId(id) {
  return document.getElementById(id);
}

function normalizePhone(phone) {
  if (!phone) return "";
  let p = String(phone).replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("00")) p = p.slice(2);
  if (p.startsWith("0")) p = "218" + p.slice(1);
  return p;
}

function formatPrice(value, currency = "LYD") {
  if (value === null || value === undefined || value === "") return "";
  return `${Number(value).toLocaleString("ar-LY")} ${currency}`;
}

function productPriceLine(product) {
  const parts = [];
  if (product.rent_price) parts.push(`الإيجار: ${formatPrice(product.rent_price, product.currency)}`);
  if (product.sale_price) parts.push(`البيع: ${formatPrice(product.sale_price, product.currency)}`);
  return parts.join(" · ") || "السعر يحدد من لوحة الإدارة";
}

function whatsappMessage(product) {
  const name = product?.name || "منتج";
  const code = product?.code || "";
  const mode = MODE_LABELS[product?.item_mode] || "";
  const codeText = code ? `، الكود: ${code}` : "";
  const modeText = mode ? `، النوع: ${mode}` : "";
  return `السلام عليكم، نرغب في الاستفسار عن المنتج: ${name}${codeText}${modeText}`;
}

function whatsappUrl(product, phone) {
  const primary = phone || (window.JAGUAR_CONFIG && window.JAGUAR_CONFIG.WHATSAPP_PRIMARY);
  const normalized = normalizePhone(primary);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(whatsappMessage(product))}`;
}

function statusBadge(status) {
  const label = STATUS_LABELS[status] || status || "غير محدد";
  return `<span class="badge ${status || ""}">${label}</span>`;
}

function modeBadge(mode) {
  const label = MODE_LABELS[mode] || mode || "غير محدد";
  return `<span class="badge">${label}</span>`;
}

function placeholderImage() {
  return "assets/images/default-hero.webp";
}

async function fetchCategories() {
  if (!window.jaguarSupabase) return DEFAULT_CATEGORIES;
  const { data, error } = await window.jaguarSupabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error || !data?.length) return DEFAULT_CATEGORIES;
  return data;
}

async function fetchProducts(options = {}) {
  if (!window.jaguarSupabase) return DEFAULT_PRODUCTS;
  let query = window.jaguarSupabase
    .from("products")
    .select(`
      *,
      categories(name, slug),
      product_images(image_url, is_primary, sort_order)
    `)
    .eq("is_hidden", false)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (options.featured) query = query.eq("is_featured", true);
  if (options.categorySlug) query = query.eq("categories.slug", options.categorySlug);
  if (options.categoryId) query = query.eq("category_id", options.categoryId);
  if (options.status) query = query.eq("status", options.status);
  if (options.mode) query = query.in("item_mode", [options.mode, "both"]);

  const { data, error } = await query;
  if (error || !data) return DEFAULT_PRODUCTS;
  return data.map((p) => ({
    ...p,
    category_name: p.categories?.name,
    category_slug: p.categories?.slug,
    primary_image:
      p.product_images?.find((img) => img.is_primary)?.image_url ||
      p.product_images?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.image_url ||
      "assets/images/default-hero.webp"
  }));
}

async function fetchProduct(id) {
  if (!window.jaguarSupabase) return DEFAULT_PRODUCTS.find(p => p.id === id) || DEFAULT_PRODUCTS[0];
  const { data, error } = await window.jaguarSupabase
    .from("products")
    .select(`
      *,
      categories(name, slug),
      product_images(*)
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  data.category_name = data.categories?.name;
  data.category_slug = data.categories?.slug;
  data.images = (data.product_images || []).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0));
  data.primary_image =
    data.images.find(img => img.is_primary)?.image_url ||
    data.images[0]?.image_url ||
    "assets/images/default-hero.webp";
  return data;
}

async function fetchHeroImage() {
  if (!window.jaguarSupabase) return "assets/images/default-hero.webp";
  const { data, error } = await window.jaguarSupabase
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1);
  if (error || !data?.length) return "assets/images/default-hero.webp";
  return data[0].image_url || "assets/images/default-hero.webp";
}

async function fetchWhatsappNumbers() {
  if (!window.jaguarSupabase) {
    return [
      { phone: "0921544663", is_primary: true, label: "الرقم الأساسي" },
      { phone: "0925813109", is_primary: false, label: "واتساب إضافي" },
      { phone: "0927561171", is_primary: false, label: "واتساب إضافي" }
    ];
  }
  const { data, error } = await window.jaguarSupabase
    .from("whatsapp_numbers")
    .select("*")
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error || !data?.length) return [];
  return data;
}

function renderProductCard(product) {
  return `
    <article class="card product-card">
      <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-img-wrap">
        <img src="${product.primary_image || placeholderImage()}" alt="${product.name || ""}" loading="lazy">
      </a>
      <div class="product-info">
        <div class="product-code">${product.code || ""}</div>
        <h3 class="product-title">${product.name || "منتج بدون اسم"}</h3>
        <div class="product-meta">
          ${statusBadge(product.status)}
          ${modeBadge(product.item_mode)}
        </div>
        <div class="price-line">${productPriceLine(product)}</div>
        <a class="btn small" href="${whatsappUrl(product)}" target="_blank" rel="noopener">اطلب عبر واتساب</a>
      </div>
    </article>
  `;
}

function setupNav() {
  const menuBtn = byId("mobileMenuBtn");
  const navLinks = byId("navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  }
}

function setupFloatingWhatsapp() {
  const el = byId("floatingWhatsapp");
  if (el) {
    el.href = whatsappUrl({ name: "استفسار عام", code: "عام" });
  }
}

window.JaguarShared = {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  STATUS_LABELS,
  MODE_LABELS,
  byId,
  normalizePhone,
  formatPrice,
  productPriceLine,
  whatsappMessage,
  whatsappUrl,
  statusBadge,
  modeBadge,
  fetchCategories,
  fetchProducts,
  fetchProduct,
  fetchHeroImage,
  fetchWhatsappNumbers,
  renderProductCard,
  setupNav,
  setupFloatingWhatsapp
};
