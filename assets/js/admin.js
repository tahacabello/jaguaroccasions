
(function () {
  const S = window.JaguarShared;
  const supa = window.jaguarSupabase;
  const loginScreen = S.byId("loginScreen");
  const adminScreen = S.byId("adminScreen");
  const loginForm = S.byId("loginForm");
  const loginNotice = S.byId("loginNotice");
  const logoutBtn = S.byId("logoutBtn");
  const productForm = S.byId("productForm");
  const productsTable = S.byId("productsTable");
  const categorySelect = S.byId("productCategory");
  const configNotice = S.byId("configNotice");
  const heroForm = S.byId("heroForm");
  const settingsForm = S.byId("settingsForm");

  function showNotice(el, message, type = "") {
    if (!el) return;
    el.className = `notice ${type}`;
    el.textContent = message;
    el.classList.remove("hidden");
  }

  function hideNotice(el) {
    if (el) el.classList.add("hidden");
  }

  async function isAdmin() {
    if (!supa) return false;
    const { data, error } = await supa.rpc("is_admin");
    return !error && data === true;
  }

  async function init() {
    if (!window.JAGUAR_IS_CONFIGURED) {
      showNotice(configNotice, "لم يتم ربط Supabase بعد. افتحي ملف assets/js/config.js وضعي SUPABASE_URL و SUPABASE_ANON_KEY.", "error");
      loginScreen.classList.remove("hidden");
      return;
    }

    const { data } = await supa.auth.getSession();
    if (data.session && await isAdmin()) {
      await showAdmin();
    } else {
      loginScreen.classList.remove("hidden");
      adminScreen.classList.add("hidden");
    }
  }

  async function showAdmin() {
    loginScreen.classList.add("hidden");
    adminScreen.classList.remove("hidden");
    await loadCategories();
    await loadProducts();
  }

  async function loadCategories() {
    const { data, error } = await supa
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return;
    categorySelect.innerHTML = data.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  async function loadProducts() {
    const { data, error } = await supa
      .from("products")
      .select("*, categories(name), product_images(image_url, is_primary)")
      .order("created_at", { ascending: false });
    if (error) {
      productsTable.innerHTML = `<tr><td colspan="7">تعذر تحميل المنتجات.</td></tr>`;
      return;
    }

    productsTable.innerHTML = data.map(p => `
      <tr>
        <td>${p.code || ""}</td>
        <td>${p.name || ""}</td>
        <td>${p.categories?.name || ""}</td>
        <td>${S.productPriceLine(p)}</td>
        <td>${S.STATUS_LABELS[p.status] || p.status}</td>
        <td>${p.is_archived ? "مؤرشف" : (p.is_hidden ? "مخفي" : "ظاهر")}</td>
        <td>
          <button class="btn small secondary" data-edit="${p.id}">تعديل</button>
          <button class="btn small ghost" data-archive="${p.id}">${p.is_archived ? "إلغاء الأرشفة" : "أرشفة"}</button>
          <button class="btn small danger" data-delete="${p.id}">حذف</button>
        </td>
      </tr>
    `).join("");

    productsTable.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => fillProduct(btn.dataset.edit, data)));
    productsTable.querySelectorAll("[data-archive]").forEach(btn => btn.addEventListener("click", () => toggleArchive(btn.dataset.archive, data)));
    productsTable.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => deleteProduct(btn.dataset.delete)));
  }

  function fillProduct(id, list) {
    const p = list.find(x => x.id === id);
    if (!p) return;
    productForm.product_id.value = p.id;
    productForm.name.value = p.name || "";
    productForm.code.value = p.code || "";
    productForm.category_id.value = p.category_id || "";
    productForm.item_mode.value = p.item_mode || "both";
    productForm.rent_price.value = p.rent_price || "";
    productForm.sale_price.value = p.sale_price || "";
    productForm.status.value = p.status || "available";
    productForm.is_featured.checked = Boolean(p.is_featured);
    productForm.is_hidden.checked = Boolean(p.is_hidden);
    productForm.description.value = p.description || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function compressAndWatermark(file) {
    const imageBitmap = await createImageBitmap(file);
    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / imageBitmap.width);
    const width = Math.round(imageBitmap.width * scale);
    const height = Math.round(imageBitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    const logo = new Image();
    logo.src = "assets/logo/jaguar-logo-white-transparent.png";
    await new Promise((resolve) => { logo.onload = resolve; logo.onerror = resolve; });

    const logoW = Math.max(120, Math.round(width * 0.22));
    const logoH = Math.round(logo.height * logoW / logo.width);
    const pad = Math.round(width * 0.035);
    ctx.globalAlpha = 0.78;
    ctx.shadowColor = "rgba(0,0,0,.45)";
    ctx.shadowBlur = 10;
    ctx.drawImage(logo, width - logoW - pad, height - logoH - pad, logoW, logoH);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    return await new Promise(resolve => canvas.toBlob(resolve, "image/webp", 0.82));
  }

  async function uploadImages(productId, files) {
    if (!files?.length) return;
    for (const [index, file] of Array.from(files).entries()) {
      const blob = await compressAndWatermark(file);
      const path = `products/${productId}/${Date.now()}-${index}.webp`;
      const { error: uploadError } = await supa.storage
        .from("jaguar-media")
        .upload(path, blob, { contentType: "image/webp", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supa.storage.from("jaguar-media").getPublicUrl(path);

      const { error: insertError } = await supa.from("product_images").insert({
        product_id: productId,
        image_url: urlData.publicUrl,
        path,
        is_primary: index === 0,
        sort_order: index + 1,
        alt_text: productForm.name.value
      });

      if (insertError) throw insertError;
    }
  }

  async function saveProduct(e) {
    e.preventDefault();
    const fd = new FormData(productForm);
    const id = fd.get("product_id");

    const payload = {
      name: fd.get("name")?.trim(),
      code: fd.get("code")?.trim(),
      category_id: fd.get("category_id"),
      item_mode: fd.get("item_mode"),
      rent_price: fd.get("rent_price") ? Number(fd.get("rent_price")) : null,
      sale_price: fd.get("sale_price") ? Number(fd.get("sale_price")) : null,
      status: fd.get("status"),
      description: fd.get("description")?.trim(),
      is_featured: productForm.is_featured.checked,
      is_hidden: productForm.is_hidden.checked,
      currency: "LYD"
    };

    let productId = id;
    let result;

    if (id) {
      result = await supa.from("products").update(payload).eq("id", id).select().single();
    } else {
      result = await supa.from("products").insert(payload).select().single();
      productId = result.data?.id;
    }

    if (result.error) {
      alert(result.error.message);
      return;
    }

    try {
      await uploadImages(productId, productForm.images.files);
      productForm.reset();
      productForm.product_id.value = "";
      await loadProducts();
      alert("تم حفظ المنتج بنجاح.");
    } catch (err) {
      alert("تم حفظ المنتج، لكن حدث خطأ في رفع الصور: " + err.message);
    }
  }

  async function toggleArchive(id, list) {
    const p = list.find(x => x.id === id);
    const { error } = await supa.from("products").update({ is_archived: !p.is_archived }).eq("id", id);
    if (error) alert(error.message);
    await loadProducts();
  }

  async function deleteProduct(id) {
    const ok = confirm("هل تريد حذف المنتج نهائيًا؟ يفضل الأرشفة بدل الحذف.");
    if (!ok) return;
    const { error } = await supa.from("products").delete().eq("id", id);
    if (error) alert(error.message);
    await loadProducts();
  }

  async function saveHero(e) {
    e.preventDefault();
    const file = heroForm.hero_image.files[0];
    if (!file) return alert("اختاري صورة الواجهة أولًا.");
    const blob = await compressAndWatermark(file);
    const path = `hero/${Date.now()}.webp`;
    const { error: uploadError } = await supa.storage
      .from("jaguar-media")
      .upload(path, blob, { contentType: "image/webp" });
    if (uploadError) return alert(uploadError.message);

    const { data: urlData } = supa.storage.from("jaguar-media").getPublicUrl(path);
    await supa.from("hero_slides").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supa.from("hero_slides").insert({
      image_url: urlData.publicUrl,
      path,
      title: "جاغوار occasions",
      is_active: true,
      sort_order: 1
    });
    if (error) alert(error.message);
    else alert("تم تحديث صورة الواجهة.");
  }

  async function saveSettings(e) {
    e.preventDefault();
    const rows = [
      { key: "map_url", value: settingsForm.map_url.value },
      { key: "address_text", value: settingsForm.address_text.value },
      { key: "facebook_url", value: settingsForm.facebook_url.value },
      { key: "instagram_url", value: settingsForm.instagram_url.value }
    ];

    for (const row of rows) {
      const { error } = await supa.from("site_settings").upsert(row, { onConflict: "key" });
      if (error) return alert(error.message);
    }
    alert("تم حفظ الإعدادات.");
  }

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideNotice(loginNotice);

    if (!supa) {
      showNotice(loginNotice, "ربط Supabase غير مكتمل.", "error");
      return;
    }

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (error) {
      showNotice(loginNotice, "تعذر تسجيل الدخول. تأكدي من الإيميل وكلمة المرور.", "error");
      return;
    }

    if (!(await isAdmin())) {
      await supa.auth.signOut();
      showNotice(loginNotice, "هذا الحساب لا يملك صلاحية الأدمن.", "error");
      return;
    }

    await showAdmin();
  });

  logoutBtn?.addEventListener("click", async () => {
    await supa.auth.signOut();
    location.reload();
  });

  productForm?.addEventListener("submit", saveProduct);
  heroForm?.addEventListener("submit", saveHero);
  settingsForm?.addEventListener("submit", saveSettings);

  init();
})();
