
(async function () {
  const S = window.JaguarShared;
  S.setupNav();
  S.setupFloatingWhatsapp();

  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");

  const cats = await S.fetchCategories();
  const currentCat = cats.find(c => c.slug === slug) || cats[0];
  const title = S.byId("categoryTitle");
  if (title) title.textContent = currentCat?.name || "المنتجات";

  const categorySelect = S.byId("filterCategory");
  if (categorySelect) {
    categorySelect.innerHTML = `<option value="">كل الأقسام</option>` + cats.map(c => `<option value="${c.slug}">${c.name}</option>`).join("");
    categorySelect.value = slug || "";
  }

  const grid = S.byId("productsGrid");
  const searchInput = S.byId("searchInput");
  const statusSelect = S.byId("filterStatus");
  const modeSelect = S.byId("filterMode");
  const resetBtn = S.byId("resetFilters");

  let allProducts = await S.fetchProducts({});

  function render() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const cat = categorySelect?.value || "";
    const status = statusSelect?.value || "";
    const mode = modeSelect?.value || "";

    let list = allProducts.filter(p => {
      const matchesQ = !q || `${p.name || ""} ${p.code || ""} ${p.description || ""}`.toLowerCase().includes(q);
      const matchesCat = !cat || p.category_slug === cat || cats.find(c => c.slug === cat)?.id === p.category_id;
      const matchesStatus = !status || p.status === status;
      const matchesMode = !mode || p.item_mode === mode || p.item_mode === "both";
      return matchesQ && matchesCat && matchesStatus && matchesMode;
    });

    if (grid) {
      grid.innerHTML = list.length
        ? list.map(S.renderProductCard).join("")
        : `<div class="notice">لا توجد منتجات مطابقة حاليًا.</div>`;
    }
  }

  [searchInput, categorySelect, statusSelect, modeSelect].forEach(el => el && el.addEventListener("input", render));
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (categorySelect) categorySelect.value = "";
      if (statusSelect) statusSelect.value = "";
      if (modeSelect) modeSelect.value = "";
      render();
    });
  }

  render();
})();
