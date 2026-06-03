# Supabase Database Setup & Configuration Guide - Jaguar Occasions

This guide explains how to configure, set up, and verify the Supabase PostgreSQL database for **Jaguar Occasions**.

---

## 1. Supabase Project Credentials
- **Supabase Project URL**: `https://uxsixllbppablltuvtkj.supabase.co`
- **Frontend/Public Anon Key**: Located in the `.env.local` file (configured on setup).
- **Database Access / SQL Editor**: Run the provided SQL migration scripts directly within the Supabase Dashboard SQL Editor.

---

## 2. Table Schemas Overview
Below are the key tables defined in the database schema:

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `profiles` | Customer profiles (extends Supabase `auth.users`). | `id` (UUID), `name`, `username`, `phone`, `backup_phone`, `city`, `street`, `additional_address`, `google_maps_link`, `is_admin` |
| `categories` | Main graduation categories. | `id` (UUID), `name`, `slug`, `sort_order`, `is_active`, `image`, `desc` |
| `subcategories` | Optional product subcategories. | `id` (UUID), `category_id`, `name`, `sort_order`, `is_active` |
| `products` | Graduation gowns, caps, and sashes. | `id` (UUID), `category_id`, `subcategory_id`, `name`, `code`, `description`, `rent_price`/`price_rent`, `sale_price`/`price_sale`, `item_mode` (`sale`, `rent`, `both`), `status` |
| `orders` | Rental bookings and purchases. | `id`, `customer_id`, `guest_name`, `guest_phone`, `guest_city`, `guest_street`, `total_amount`, `status`, `event_date`, `pickup_date`, `return_date`, `whatsapp_sent` |
| `order_items` | Items associated with an order. | `id`, `order_id`, `product_id`, `product_name`, `quantity`, `price_at_purchase`, `item_mode` |
| `order_change_requests` | Order edit proposals from customers. | `id`, `order_id`, `status` (`pending`, `approved`, `rejected`), `event_date`, `pickup_date`, `phone`, `city`, `street`, `google_maps_link` |
| `settings` / `site_settings` | Key-value store for site configurations. | `key`, `value`, `updated_at` |
| `featured_cards` | Admin homepage banner visual cards. | `id`, `title`, `subtitle`, `image_url`, `link_url`, `sort_order` |
| `homepage_sections` | Dynamic homepage layout builder. | `id`, `title`, `type` (`categories`, `products`, `banner`), `sort_order`, `is_active` |

---

## 3. SQL Execution Sequence (Step-by-Step)

To initialize or update the database schema, run the SQL scripts in the following order. 

> [!IMPORTANT]
> If you are setting up a **brand new Supabase project**, run the files starting from Step 1.
> If you are upgrading an **existing project**, proceed to **Step 3 (Upgrade Migrations)** to run the incremental upgrade files.

### Step 1: Base Tables & RLS Policies (Fresh setup only)
1. **`sql/01_tables.sql`**
   - *What it changes*: Enables the `pgcrypto` extension. Creates the base enum types (`product_status`, `item_mode`) and base tables (`admins`, `categories`, `products`, `product_images`, `whatsapp_numbers`, `hero_slides`, `site_settings`, `audit_logs`).
   - *If not run*: Nothing will load; frontend queries will fail due to missing tables.
2. **`sql/02_rls_policies.sql`**
   - *What it changes*: Enables Row Level Security (RLS) on all base tables and defines granular public-read and admin-write policies.
   - *If not run*: The database remains insecure, or queries fail if RLS is enabled by default.
3. **`sql/03_storage_policies.sql`**
   - *What it changes*: Sets up the `jaguar-media` public storage bucket and configures image upload/view policies.
   - *If not run*: Image uploads for products, categories, or slides will fail with permission errors.
4. **`sql/04_seed_data.sql`**
   - *What it changes*: Seeds initial configuration values, category templates, and sample records.
   - *If not run*: The website loads empty without main categories.

### Step 2: Feature Upgrades (Fresh setup only)
5. **`sql/upgrade_schema.sql`**
   - *What it changes*: Massive upgrade introducing the `profiles` table, `orders`, `order_items`, and triggers to sync Auth metadata to `profiles`.
   - *If not run*: Customer login, order placement, and checkout fail.

### Step 3: Incremental Upgrade Migrations (Required for existing/latest deployments)
Execute these scripts to align the database with the latest codebase features:

6. **`sql/create_homepage_builder.sql`**
   - *What it changes*: Creates `homepage_sections` and `homepage_items` tables with helper functions `swap_homepage_sections_order` and `swap_homepage_items_order` for the Admin Homepage Builder.
   - *If not run*: The admin panels for customizing homepage sections will throw errors.
7. **`sql/create_profiles_login_system.sql`**
   - *What it changes*: Adds unique username validation to `profiles`. Updates the new user trigger to support login using username, phone, or email.
   - *If not run*: Registration with custom usernames fails, and users cannot log in with their phone/username credentials.
8. **`sql/create_order_change_requests.sql`**
   - *What it changes*: Establishes the `order_change_requests` table, RLS policies, and triggers to log changes. Creates helper function `approve_order_change_request` to apply modifications.
   - *If not run*: The "Request Order Edit" feature in the customer portal fails on submit or approval.
9. **`sql/create_featured_cards_table.sql`**
   - *What it changes*: Installs the `featured_cards` table and provides order swapping helpers.
   - *If not run*: Admin banner card customizers fail to save.
10. **`sql/update_featured_schema.sql`**
    - *What it changes*: Enhances the featured cards schema, aligning column constraints and settings.
11. **`sql/upgrade_orders_rental_fields.sql`**
    - *What it changes*: Appends rental columns (`event_date`, `pickup_date`, `return_date`, `whatsapp_sent`) to the `orders` table.
    - *If not run*: Rent checkouts will throw constraint validation failures.
12. **`sql/upgrade_products_availability.sql`**
    - *What it changes*: Enforces the `item_mode` check constraint (`sale`, `rent`, `both`). Applies `DEFAULT gen_random_uuid()` to products `id` column. Drops `NOT NULL` constraints from product pricing columns (`price_sale`, `price_rent`, `sale_price`, `rent_price`) to support rent-only or sale-only items.
    - *If not run*: Product insertions without a frontend-generated UUID fail, invalid item modes are allowed, and inserting rent-only or sale-only products throws not-null constraint errors on the opposite price columns.

### Step 4: Permissions & RLS Fixes (Always Run at the End)
Run these scripts to guarantee correct client-side RPC execution permissions:

13. **`sql/fix_checkout_and_admin_rpc.sql`**
    - *What it changes*: Implements security definer RPC functions for place-order operations, checking credentials, and admin operations.
    - *If not run*: Frontend checkout forms fail because standard user accounts cannot insert records with foreign keys directly.
14. **`sql/fix_payment_and_profiles_rpc.sql`**
    - *What it changes*: Installs profiles and checkout RPC functions, providing clean read/write wrappers.
15. **`sql/fix_anon_permissions.sql` & `sql/fix_supabase_permissions.sql` & `sql/fix_storage_permissions.sql`**
    - *What it changes*: Sets table grants (`select`, `insert`) for `anon` and `authenticated` roles, resolves policy gaps, and enables uploads to storage buckets.
    - *If not run*: Customers get "permission denied" errors on checkout or profile pages.

---

## 4. How to Reload/Refresh the Schema Cache
When SQL tables, columns, or RPC functions are updated, Supabase's API Gateway (PostgREST) might serve outdated cache data, causing type mismatches or "column/function not found" errors in the Next.js app.

### How to Reload:
1. Open your **Supabase Dashboard**.
2. Navigate to **Project Settings** > **API**.
3. Under the **API Settings** panel, click **Reload Schema** or **Refresh Cache**.
4. Alternatively, you can run a simple no-op command in the SQL Editor to force a reload:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

---

## 5. Verifying Database Setup (Testing Guide)

After executing the SQL migrations, run these tests to verify database integrity:

### Test A: Admin RPC Passcode Check
Execute this in the SQL Editor to ensure the admin check function works:
```sql
SELECT public.check_admin_passcode('9922'); -- Should return true
SELECT public.check_admin_passcode('0000'); -- Should return false
```

### Test B: Username & Credentials Registration
Verify username constraints on registration:
```sql
-- This test checks if profiles handles inserts properly
INSERT INTO public.profiles (id, name, username, phone, city, street, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'تجربة نظام التسجيل', 
  'test_user', 
  '+218910000000', 
  'طرابلس', 
  'شارع عمر المختار', 
  false
);

-- Check profile was inserted
SELECT * FROM public.profiles WHERE username = 'test_user';

-- Clean up
DELETE FROM public.profiles WHERE username = 'test_user';
```

### Test C: Item Mode Availability
Verify check constraint validation:
```sql
-- This should fail due to item_mode check constraint (must be 'sale', 'rent', or 'both')
INSERT INTO public.products (name, code, item_mode, status)
VALUES ('منتج اختبار خطأ', 'test-code-err', 'invalid_mode', 'available');
```
*(Postgres should return: `new row for relation "products" violates check constraint "products_item_mode_check"`)*
