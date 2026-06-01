(async function () {
  const S = window.JaguarShared;
  S.setupNav();
  S.setupFloatingWhatsapp();

  const heroMedia = S.byId("heroMedia");
  if (heroMedia) {
    const hero = await S.fetchHeroImage();
    heroMedia.style.backgroundImage = `url('${hero}')`;
  }

  const categories = await S.fetchCategories();

  // Fill hidden grid (used by chip builder observer)
  const categoriesGrid = S.byId("categoriesGrid");
  if (categoriesGrid) {
    categoriesGrid.innerHTML = categories.map(cat => `
      <a class="card category-card" href="category.html?slug=${encodeURIComponent(cat.slug)}">
        <strong>${cat.name}</strong>
        <span>عرض المنتجات</span>
      </a>
    `).join("");
  }

  // Stats counters
  const productsCount   = S.byId("productsCount");
  const categoriesCount = S.byId("categoriesCount");
  const availableCount  = S.byId("availableCount");

  let allProducts = [];
  if (productsCount || availableCount) {
    allProducts = await S.fetchProducts({});
  }

  if (categoriesCount) categoriesCount.textContent = categories.length;
  if (productsCount)   productsCount.textContent   = allProducts.length;
  if (availableCount)  availableCount.textContent  = allProducts.filter(p => p.status === "available").length;

  // Featured products
  const featuredGrid = S.byId("featuredProducts");
  if (featuredGrid) {
    let products = await S.fetchProducts({ featured: true });
    if (!products.length) products = allProducts.length ? allProducts : await S.fetchProducts({});
    featuredGrid.innerHTML = products.slice(0, 8).map(S.renderProductCard).join("");
  }

  // WhatsApp numbers — styled cards
  const whatsappList = S.byId("whatsappList");
  if (whatsappList) {
    const numbers = await S.fetchWhatsappNumbers();
    whatsappList.innerHTML = numbers.map(n => `
      <div class="contact-line">
        <span>${n.label || "واتساب"}</span>
        <strong><a href="${S.whatsappUrl({ name: "استفسار عام", code: "عام" }, n.phone)}" target="_blank" rel="noopener">${n.phone}</a></strong>
      </div>
    `).join("");
  }
})();
