# CODEX HANDOFF README - Jaguar Occasions

This document provides a comprehensive, step-by-step transition package for the **Jaguar Occasions** graduation rental and sales store. It outlines the project's background, full feature history, local development instructions, database configuration details, deployment setups, and guidelines for continuing development seamlessly in Codex.

---

## 1. Project Overview

**Jaguar Occasions** is a premium online storefront and order management application tailored for a graduation attire rental and sales business in Tripoli, Libya. 

The application is structured into three main layers:
1. **Public Storefront**:
   - A highly polished, responsive homepage featuring a hero banner, announcement slide, category selector, dynamic layouts, and a trending carousel.
   - A robust product catalog supporting categorization, sorting, detail pages, lightboxes for multiple product images, and localized Arabic translation keys.
2. **Customer Account Portal**:
   - A customer registration and login panel supporting credentials like username, email, or phone number.
   - A profile builder enabling customers to prefill address coordinates, details, and optional Google Maps links.
   - An active order tracker displaying reservation stages and providing a secure "Change Request" modal to suggest modifications to confirmed bookings.
3. **Admin Control Panel (Passcode: `9922`)**:
   - A dashboard allowing administrators to manage categories, products, inventory, orders, customer profiles, and site settings.
   - Features manual order creation (for offline/phone customers) and approval queues for customer-submitted change requests.
4. **Supabase Serverless Backend**:
   - Employs PostgreSQL tables, views, Row Level Security (RLS) policies, database triggers, RPC (Remote Procedure Call) functions, and storage buckets.
5. **GitHub Pages Deployment**:
   - Configured for Next.js static HTML export (`output: 'export'`) deployed to GitHub Pages under a subpath `/jaguaroccasions`.

---

## 2. Full Feature History (Implemented Features)

### A. Gown Categories & Category Catalog
- **Four Core Categories**:
  1. `كيبان تخرج` (Graduation Gowns/Robes)
  2. `شيلان تخرج` (Graduation Sashes)
  3. `قبعات تخرج` (Graduation Caps)
  4. `إكسسوارات التخرج` (Graduation Accessories/Pins)
- **Subcategories**: Main categories support sub-levels to filter specific variations (e.g., standard vs. custom gowns).
- **Homepage Section Builder**: Admin control panel supports adding, updating, disabling, and reordering homepage sections (categories, products, banner cards) using sorting drag-and-drop or order-swapping RPC commands.

### B. Sale & Rental Options (`item_mode` & Pricing)
- **Hybrid Support**: Products can be configured in one of three modes:
  - **Sale Only (`sale`)**: Removes rental tabs, displays "غير متوفر للإيجار" in the rental space, and disables rental cart logic.
  - **Rental Only (`rent`)**: Removes purchase option, displays "غير متوفر للبيع", and hides the purchase checkout route.
  - **Both (`both`)**: Displays options for both renting and buying on product cards and checkout forms.
- **Price Input Optimization**: Price input fields in the Admin Dashboard default to empty string (`""`) rather than forced zeroes. A character filtration regex strips leading zeroes as the admin types.

### C. Standardized Product Status Logic
- **Database Status Schema**: Database stores stable, standardized English keys: `available`, `unavailable`, `reserved`, `sold`, `hidden`.
- **Storefront Display Badges**: The UI translates these keys dynamically into readable Arabic labels:
  - `available` ➔ `متوفر` (Green Badge)
  - `unavailable` ➔ `غير متوفر حالياً` (Gray Badge, disables Add-to-Cart)
  - `reserved` ➔ `محجوز` (Orange Badge, disables Add-to-Cart)
  - `sold` ➔ `مباع` (Red Badge, disables Add-to-Cart)
  - `hidden` ➔ `مخفي` (Invisible in public views, viewable in Admin dashboard)
- **Automatic Disable Actions**: When a product is not `available`, the checkout button is automatically disabled across all lists and detail views to prevent invalid reservations.

### D. Customer Registration & Login System
- **Multi-Credential Login**: Customers can log in using their **Username**, **Phone Number**, or **Email Address** along with their password.
- **Sign Up Form**: Supports collecting Full Name, unique Username, Email, Phone, Backup Phone, City, Street, and Google Maps Location URL.
- **Validation**: Enforces unique username constraints on registration and prevents raw inserts into Supabase Auth users.
- **Google Maps Integration**: Customers can provide a Google Maps URL during registration, checkout, or profile updates to help delivery drivers locate their location.

### E. Date System & Rental Policies
- **Pickup & Return Rules**: Checkout forms gather specific Event, Pickup, and Return dates.
- **The Friday Rule**: The date selection logic automatically validates dates and displays warning messages if a customer attempts to schedule a pickup or return on a Friday (which is the weekly weekend holiday).
- **Preliminary Booking**: Allows customers to submit orders without immediate payment, acting as a preliminary hold.
- **WhatsApp Checkout Dispatch**: Clicking checkout formats all order details (customer name, items, dates, total, location, and maps link) into an Arabic WhatsApp message sent to the store's official line to complete coordination.

### F. Order Change Requests
- **Customer Side**: Inside their accounts tracker, customers can click **طلب تعديل على الطلب** (Request Order Edit).
- **Security Check**: This opens a change request modal to propose updates for Dates, Contact info, Addresses, or Google Maps links without modifying the live database records.
- **Database Table**: Proposals are stored as `pending` in the `order_change_requests` table.
- **Admin Side**: Admins can approve or reject these requests. Approval triggers the `approve_order_change_request` RPC database function, safely copying changes to the official `orders` row.

### G. Admin Manual Order System & Order Confirmations
- **Manual Orders**: Admins can create orders from the dashboard. This supports:
  - Adding products dynamically.
  - Selecting an existing customer account (profiles) to link the order.
  - Entering manual guest details if the customer is offline or doesn't have an account.
- **Order Confirmations**: Admin can update orders status (`new_order` ➔ `confirmed` ➔ `preparing` ➔ `ready` ➔ `completed` / `cancelled`).

---

## 3. How to Run Locally

### Prerequisites
- **Node.js**: Recommended versions `18.x`, `20.x`, or `22.x` (LTS versions).
- **npm**: v9 or higher (included with Node.js).

### Commands
1. **Clone & Unzip**:
   Open the directory containing the project source files.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your web browser.
4. **Verify TypeScript & Compile Code**:
   ```bash
   npx tsc --noEmit
   ```
5. **Static Site Build (for GitHub Pages Export)**:
   ```bash
   npm run build
   ```
   Exported HTML and static assets will build to the `/out` directory.

---

## 4. Supabase Setup Details

The backend structure uses several custom database tables, columns, storage buckets, RLS policies, and RPC functions.

> [!TIP]
> For the complete SQL migration sequence, table-by-table changes, cache reloading, and database testing steps, please open the dedicated documentation file:
> [SUPABASE_SETUP_FULL.md](file:///SUPABASE_SETUP_FULL.md).

### Quick Summary of SQL Migrations:
1. `01_tables.sql` - Base schemas.
2. `02_rls_policies.sql` - Security permissions.
3. `03_storage_policies.sql` - Public buckets for gown images.
4. `upgrade_schema.sql` - Extended checkout and profile configurations.
5. `create_homepage_builder.sql` - Builder layouts structure.
6. `create_profiles_login_system.sql` - Multi-credential login logic.
7. `create_order_change_requests.sql` - Edit proposals storage and triggers.
8. `upgrade_products_availability.sql` - Enforces UUID defaults and item modes.
9. `fix_checkout_and_admin_rpc.sql` - Secure database transaction functions.

---

## 5. Environment Variables Configuration

Duplicate the `.env.example` file in the project root to create `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the placeholders with your Supabase values:
- `NEXT_PUBLIC_SUPABASE_URL`: The Supabase URL for your project instance.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The safe, public anonymous key used by Next.js clients.

---

## 6. GitHub Pages Deployment

- **Output Export**: The `next.config.ts` file contains:
  ```typescript
  output: 'export'
  ```
  This exports static assets suitable for GitHub Pages hosting.
- **basePath Prefix**: The `basePath` and `assetPrefix` are set to `/jaguaroccasions`. All routes are hosted at: `tahacabello.github.io/jaguaroccasions`.
- **Custom Scripts**:
  - `deploy_termux.sh` is provided in the project folder to build and push compile bundles directly to the `gh-pages` branch.

---

## 7. Current Known Issues

> [!WARNING]
> Before modifying product creation codes, make sure all database migration scripts have been loaded. If you encounter any SQL constraint failures, open the [CURRENT_KNOWN_ISSUES.md](file:///CURRENT_KNOWN_ISSUES.md) document to verify.
