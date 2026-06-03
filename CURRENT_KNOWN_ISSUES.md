# Current Known Issues & Testing Points - Jaguar Occasions

This document lists open issues, features requiring manual verification, and configuration notes for **Jaguar Occasions** during handoff.

---

## 1. Action Items for Verification

### A. Product Creation Test (Null ID & Price Constraints Fix Verification)
- **Previous Issue**: 
  - ID error: `null value in column "id" of relation "products" violates not-null constraint`
  - Price error: `null value in column "price_sale" (or "price_rent") of relation "products" violates not-null constraint` when saving rent-only or sale-only products.
- **Status**: **RESOLVED**
  - ID error is fixed frontend-side (UUID fallback) and database-side (setting random uuid default).
  - Price constraints are resolved by dropping database `NOT NULL` constraints on `price_sale`, `price_rent`, `sale_price`, and `rent_price` inside the updated `upgrade_products_availability.sql` script to properly support products that are rent-only (no sale price) or sale-only (no rental price).
- **Testing Action**: 
  1. Open your Supabase SQL Editor and run `sql/upgrade_products_availability.sql`.
  2. Access the Admin Dashboard (`/admin` path) using passcode `9922`.
  3. Click **إضافة منتج جديد** (Add new product).
  4. Fill out the form, select only one mode (e.g. Rent only) to test, and click **حفظ وإضافة المنتج الجديد** (Save and Add).
  5. Ensure the product is successfully created without database errors.

### B. Product Mode & Price Rules (`item_mode`)
- **Status**: **RESOLVED**
  - Storefront product cards (`CategoryProductsClient.tsx`, `TrendingProducts.tsx`, and `DynamicSections.tsx`) and the Product Detail page (`ProductDetailClient.tsx`) now use `item_mode` and price > 0 checks as the source of truth.
  - Rent-only products display the rental price + "إيجار" and do not show the sale price or `0` prices.
  - Sale-only products display the purchase price + "شراء" and do not show the rental price or `0` prices.
  - Both-options products render both prices clearly without any zero fallbacks.

### C. Static Details Routing (GitHub Pages Compatibility)
- **Status**: **RESOLVED**
  - Next.js dynamic routing (`/products/[id]`) fails with 404 on GitHub Pages for runtime-added products because their static pages do not exist.
  - Migrated to a static-safe query parameter route: `/product?id=PRODUCT_ID`.
  - Legacy URLs for products `1` to `6` are handled by a lightweight client-side redirect in `/products/[id]/page.tsx` that routes to `/product?id=ID` to prevent breaking existing links.

### D. Arabic UI Status Labels & Admin Sync
- **Status**: **RESOLVED**
  - UI labels are translated dynamically: `available` ➔ `متوفر`, `unavailable` ➔ `غير متوفر`, `reserved` ➔ `محجوز`, `sold` ➔ `مباع`, `hidden` ➔ `مخفي`.
  - The Admin Edit product modal now reads `prod.statusKey` to properly synchronize the selected dropdown value with the English database key values, avoiding UI mismatch issues on load.

---

## 2. Config & Deployment Notes

### A. GitHub Pages Path Prepend (`basePath`)
- **Configured in**: `next.config.ts`
- **Behavior**: Prepend `/jaguaroccasions` to routes.
- **Local Dev vs Export**:
  - During `npm run dev`, routes are hosted at root level (`/`). Next.js automatically ignores `basePath` or handles it for link components.
  - After `npm run build` (static export), all asset URLs and links prepend `/jaguaroccasions` to render correctly on `tahacabello.github.io/jaguaroccasions`.
  - **Important**: If moving the project to a custom domain or hosting root (e.g., `www.jaguarmناسبات.com` or Vercel), remove `basePath` and `assetPrefix` from [next.config.ts](file:///next.config.ts).

### B. Supabase API Client Limits
- Ensure the Supabase Storage Bucket `jaguar-media` is created and public.
- If images fail to display, check the public policy config in `sql/03_storage_policies.sql`.

---

## 3. Pending/Future Integrations

### A. Coming Soon Payment Gateways
- **MobiCash & Sadad**:
  - The Checkout panel displays labels for Sadad and MobiCash as **قريباً (Coming Soon)**.
  - The database only registers payment method values for cash on delivery. Full API integration will require adding merchant gateways inside Codex later.

### B. Customer Change Requests approvals
- The customer change request system is fully built in the database (`order_change_requests` table) and storefront client modal.
- The Admin dashboard displays change requests. When approved, it applies the updates. Ensure you run `sql/create_order_change_requests.sql` to register the `approve_order_change_request` RPC function.
