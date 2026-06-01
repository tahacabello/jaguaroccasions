# JAGUAR OCCASIONS — جاغوار للمناسبات
# Full Project Context Document | وثيقة السياق الكامل للمشروع

---

## PROJECT: JAGUAR OCCASIONS — جاغوار للمناسبات

> **English:** This document contains the complete context, credentials, architecture, and development guide for the Jaguar Occasions e-commerce platform.
>
> **العربية:** تحتوي هذه الوثيقة على السياق الكامل وبيانات الاعتماد والهيكل ودليل التطوير لمنصة جاغوار للمناسبات للتجارة الإلكترونية.

---

## CREDENTIALS (EXACT VALUES) — بيانات الاعتماد (القيم الدقيقة)

| Key | Value |
|-----|-------|
| **GitHub Owner** | `tahacabello` |
| **GitHub Repo** | `jaguaroccasions` |
| **GitHub Pages URL** | `https://tahacabello.github.io/jaguaroccasions/` |
| **Supabase URL** | `https://uxsixllbppablltuvtkj.supabase.co` |
| **Supabase Anon Key** | `sb_publishable_Cf8BqtzedCI5qHgtt0gWRA_TihclIWq` |
| **Telegram Bot Token** | `8840923993:AAEz0V-OvMlYsEzD_S4McSCNf7NMR_fcs3o` |
| **Telegram Chat ID** | `889242214` |
| **Admin Password** | `9999` |
| **Project Source** | `C:\Users\Taha\.gemini\antigravity\scratch\jaguar_project\` |

---

## ALL WEBSITE ROUTES — جميع مسارات الموقع

| Route | English | العربية |
|-------|---------|---------|
| `/` | Homepage | الصفحة الرئيسية |
| `/products` | All Products | جميع المنتجات |
| `/products/[id]` | Product Detail | تفاصيل المنتج |
| `/categories` | Categories page | الأقسام |
| `/categories/[id]` | Category products | منتجات القسم |
| `/checkout` | Checkout page | صفحة الطلب |
| `/checkout/success` | Order success page | صفحة نجاح الطلب |
| `/auth/login` | Login page | صفحة تسجيل الدخول |
| `/auth/register` | Register page | صفحة التسجيل |
| `/admin` | Admin dashboard — password: 9999 | لوحة الأدمن — كلمة المرور: 9999 |

---

## TECH STACK — التقنيات المستخدمة

- Next.js 16.2.6 (Turbopack) with static export output (`output: "export"`)
- TypeScript
- Tailwind CSS & Vanilla CSS (premium gold-and-black styling)
- Supabase (database + Auth Client)
- Framer Motion (smooth transitions and gallery lightbox)
- Lucide React icons
- Telegram Bot API for real-time guest order notifications

---

## KEY ARCHITECTURAL & RESILIENCE SOLUTIONS (WHAT WE IMPLEMENTED)
## الحلول المعمارية والبرمجية المنجزة (ما تم تطويره وتأمينه)

### 1. 📸 Premium Visual Image Uploader & Base64 Reader
- **The Issue:** Since the project is deployed to GitHub Pages as a purely static site, there is no server-side Node.js filesystem to handle `multipart/form-data` uploads.
- **The Premium Solution:** We engineered an HTML5 `FileReader` based uploader in `src/app/admin/page.tsx`.
  - It reads local files (`.jpg`, `.png`, `.webp`) and converts them to **Base64 data URLs** (`data:image/jpeg;base64,...`) instantly.
  - Next.js `<Image>` and Supabase text fields natively render and store these strings seamlessly.
  - **Cover Photo Uploader:** Shows a dashed dropzone. If a cover is set, it displays a premium cards preview. Tapping it shows hover controls: "Change Image" or "Delete".
  - **Gallery Images Grid:** Renders each gallery image in a visual grid with a floating delete `X` button on the top-right of each thumbnail card. Tapping `+` opens file dialog to select multiple local files at once.
  - Same system implemented for Category covers!

### 2. 🛠️ Resilient State Update (Freeze Fix for "Save Changes" Button)
- **The Issue:** Tapping "Save Changes" or "Add Product" previously froze if Supabase was offline, key expired, or RLS policies blocked write requests, leaving the admin modal open and unresponsive.
- **The Solution:** Added a resilient UI pipeline in `handleSaveProduct` and `handleAddProduct`.
  - The local React state `products` is **always updated immediately** and the edit modal closes instantly, giving the admin a fast and responsive experience.
  - The Supabase request runs in the background. If it fails, a friendly gold alert informs the admin that changes are saved locally but DB synchronization is offline, preserving usability.

### 3. 🔄 Dynamic Decoupled Categories (إدارة الأقسام الديناميكية)
- **The Issue:** Categories were originally hardcoded in the codebase, meaning new categories couldn't be added or deleted without editing the React code.
- **The Solution:** Decoupled categories dynamically by writing helper functions `getSupabaseCategories()` and `saveSupabaseCategories()` inside `src/lib/supabase.ts` which serialize categories to a JSON string in the `settings` table.
- Added a full **"إدارة الأقسام" (Category Management)** panel inside the `/admin` dashboard to create and delete categories on the fly with custom cover uploaders.

### 4. 🔗 GitHub Pages Production Path Resolver
- **The Issue:** Static sites deployed to GitHub Pages under a subfolder path (like `/jaguaroccasions/`) break local absolute assets (like `/products/gallery/...`) leading to 404 errors.
- **The Solution:** Added a resilient utility `resolveAssetPath` inside `src/lib/supabase.ts` that prepends `/jaguaroccasions` prefix on production builds and leaves it empty in development, keeping images fully intact.

### 5. 🛠️ .nojekyll Asset Fix
- **The Issue:** GitHub Pages ignores folders starting with an underscore (like `_next`), breaking Next.js static asset loaders.
- **The Solution:** Created a permanent `.nojekyll` file inside the `public/` directory so Next.js copies it to `out/` on build, bypassing Jekyll checks permanently.

---

## HOW TO CONTINUE DEVELOPMENT — كيفية الاستمرار في التطوير

1. Open **`C:\Users\Taha\.gemini\antigravity\scratch\jaguar_project\`** as workspace.
2. Edit source code inside `src/`.
3. Run `npm run build` to generate local compiled static pages in `out/`.
4. Deploy the build to GitHub Pages by running:
   `npx gh-pages -d out -t -b gh-pages`
5. The live site automatically refreshes at: `https://tahacabello.github.io/jaguaroccasions/`.
6. Code backup zip is located at `C:\Users\Taha\.gemini\antigravity\scratch\jaguar_occasions_project.zip`.

---

Generated: 2026-06-01 | Jaguar Occasions - جاغوار للمناسبات
