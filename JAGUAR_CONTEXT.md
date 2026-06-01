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
| **GitHub Token** | `REMOVED_FOR_SECURITY` |
| **GitHub Owner** | `tahacabello` |
| **GitHub Repo** | `jaguar-occasions` |
| **GitHub Pages URL** | `https://tahacabello.github.io/jaguar-occasions/` |
| **Supabase URL** | `https://uxsixllbppablltuvtkj.supabase.co` |
| **Supabase Anon Key** | `sb_publishable_Cf8BqtzedCI5qHgtt0gWRA_TihclIWq` |
| **Telegram Bot Token** | `8840923993:AAEz0V-OvMlYsEzD_S4McSCNf7NMR_fcs3o` |
| **Telegram Chat ID** | `889242214` |
| **Admin Password** | `9999` |
| **Deploy Script** | `C:\Users\avd ckvo\.gemini\antigravity\scratch\deploy-to-root.js` |
| **Project Source** | `C:\Users\avd ckvo\.gemini\antigravity\scratch\jaguar-next\` |

---

## ALL WEBSITE ROUTES — جميع مسارات الموقع

| Route | English | العربية |
|-------|---------|---------|
| `/` | Homepage | الصفحة الرئيسية |
| `/products` | All Products | جميع المنتجات |
| `/products/[id]` | Product Detail | تفاصيل المنتج |
| `/categories` | Categories page | الأقسام |
| `/categories/[id]` | Category products (ids: gowns, caps, sashes, pins) | منتجات القسم |
| `/checkout` | Checkout page | صفحة الطلب |
| `/checkout/success` | Order success page | صفحة نجاح الطلب |
| `/auth/login` | Login page | صفحة تسجيل الدخول |
| `/auth/register` | Register page | صفحة التسجيل |
| `/admin` | Admin dashboard — password: 9999 | لوحة الأدمن — كلمة المرور: 9999 |

---

## ADMIN DASHBOARD TABS — تبويبات لوحة الأدمن

1. الإحصائيات — Analytics (revenue, orders, products, avg order)
2. الطلبات — Orders management with edit modal and status change
3. المنتجات — Inventory with add/edit/delete and image upload
4. الحسابات — User profiles management with edit modal
5. إعدادات الموقع — Site settings (hero image, title, subtitle, contact, map link, Telegram)
6. الإشعارات — Telegram notification history with retry

---

## TECH STACK — التقنيات المستخدمة

- Next.js 16.2.6 with Turbopack
- TypeScript
- Tailwind CSS (custom tokens)
- Supabase (database + auth)
- Framer Motion
- Lucide React icons
- Telegram Bot API for push notifications

---

## DEPLOYMENT — النشر

- Static export (next export) to GitHub Pages
- Deploy command: node C:\Users\avd ckvo\.gemini\antigravity\scratch\deploy-to-root.js
- Run from within: C:\Users\avd ckvo\.gemini\antigravity\scratch\jaguar-next\
- Build command: npm run build in jaguar-next\
- Live URL: https://tahacabello.github.io/jaguar-occasions/

---

## SUPABASE TABLES — جداول Supabase

### products
- id, name, price_sale, price_rent, category, category_id, status, image, sales, code, description

### orders
- id, customer, city, total, payment, status, date

### profiles
- id, first_name, last_name, phone_number, city, address_line1, created_at

### site_settings
- key, value (stores all site config)

---

## KEY FILES — الملفات الرئيسية

- src/app/admin/page.tsx — Main admin dashboard (7 tabs, all management)
- src/lib/supabase.ts — Database access layer + default settings
- src/lib/telegram.ts — Telegram notifications helper
- src/app/checkout/page.tsx — Checkout + order creation + Telegram trigger
- src/components/home/Hero.tsx — Homepage hero (reads settings for title/subtitle/image)
- src/components/home/TrendingProducts.tsx — Homepage trending (sorted by sales count)
- src/components/layout/Header.tsx — Navigation header
- src/components/layout/Footer.tsx — Footer with contact info
- src/context/CartContext.tsx — Shopping cart state
- deploy-to-root.js — GitHub Pages deployment script

---

## FEATURES IMPLEMENTED — الميزات المنجزة

- Full e-commerce: browse, cart, checkout, order confirmation
- Payment methods: cash on delivery, Sadad, Mobi Cash
- Admin: full CRUD for products, orders, profiles, settings
- Product image upload (URL or base64)
- Hero image customization
- Trending products controlled by sales count
- Telegram push notifications to admin phone on new orders
- Notification history with retry capability
- RTL Arabic layout throughout
- Pagination for orders, products, profiles
- Delete confirmation modals
- Order status tracking

---

## HOW TO CONTINUE DEVELOPMENT — كيفية الاستمرار في التطوير

1. Open: C:\Users\avd ckvo\.gemini\antigravity\scratch\jaguar-next\ as workspace
2. Make changes to source files in src/
3. Run: npm run build to build
4. Run: node ..\deploy-to-root.js to deploy
5. Site goes live at: https://tahacabello.github.io/jaguar-occasions/

---

Generated: 2026-06-01 | Jaguar Occasions - جاغوار للمناسبات
