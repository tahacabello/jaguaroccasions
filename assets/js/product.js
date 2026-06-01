
(async function () {
  const S = window.JaguarShared;
  S.setupNav();
  S.setupFloatingWhatsapp();

  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "demo-kuwaiti-cap";
  const product = await S.fetchProduct(id);

  const wrap = S.byId("productDetail");
  if (!product || !wrap) {
    if (wrap) wrap.innerHTML = `<div class="notice error">المنتج غير موجود.</div>`;
    return;
  }

  document.title = `${product.name} | جاغوار occasions`;

  const images = product.images?.length
    ? product.images
    : [{ image_url: product.primary_image || "assets/images/demo-kuwaiti-cap.webp", is_primary: true }];

  wrap.innerHTML = `
    <div>
      <div class="gallery-main">
        <img id="mainImage" src="${images[0].image_url}" alt="${product.name}">
      </div>
      <div class="thumbs">
        ${images.map(img => `
          <button class="thumb" type="button" data-src="${img.image_url}">
            <img src="${img.image_url}" alt="${product.name}">
          </button>
        `).join("")}
      </div>
    </div>

    <div class="detail-panel">
      <div class="product-code">${product.code || ""}</div>
      <h1>${product.name || "منتج"}</h1>
      <div class="product-meta">
        ${S.statusBadge(product.status)}
        ${S.modeBadge(product.item_mode)}
        ${product.category_name ? `<span class="badge">${product.category_name}</span>` : ""}
      </div>
      <div class="price-line">${S.productPriceLine(product)}</div>
      <p>${product.description || "لا يوجد وصف تفصيلي حاليًا."}</p>
      <div class="detail-actions">
        <a class="btn" href="${S.whatsappUrl(product)}" target="_blank" rel="noopener">اطلب عبر واتساب</a>
        <a class="btn secondary" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">مشاركة في فيسبوك</a>
        <a class="btn ghost" href="https://wa.me/?text=${encodeURIComponent(`${product.name} - ${location.href}`)}" target="_blank" rel="noopener">مشاركة في واتساب</a>
      </div>
    </div>
  `;

  wrap.querySelectorAll(".thumb").forEach(btn => {
    btn.addEventListener("click", () => {
      const main = document.getElementById("mainImage");
      main.src = btn.dataset.src;
    });
  });
})();
