# BELTYX deployment and Supabase setup

- This package is based on the supplied BELTYX website. The landing-page HTML, visual styles, hero copy, and animation files are preserved. Functional fixes are limited to the admin product-management code and storefront data-loading logic.
- `config.js` contains the BELTYX Supabase project URL and browser-safe publishable key. Never put a Supabase service-role/secret key in browser code.
- If the database schema/policies have not been installed, run `BELTYX-SUPABASE-SETUP.sql` in Supabase Dashboard → SQL Editor for the BELTYX project. It creates the expected tables, RLS policies, storage bucket, and assigns the configured head-admin UID if the email/UID match. Do not run it against another site's project.
- If the setup and RLS policies are already installed, run `BELTYX-ADMIN-REPAIR.sql` once instead. It safely repairs the `abc_products` identity sequence, grants required API privileges, and ensures RLS remains enabled; it does not delete product or order data.
- Only the head admin with `profiles.role = 'admin'` can manage admin data. No staff-admin role is included.
- The admin supports products (add/edit/hide/show/delete, bulk delete, cover image and multiple image/video media), categories, currency/sale pricing, per-product WhatsApp, store WhatsApp/location/highlights, sketches, reviews, orders, activity and admin login settings.
- Categories are stored in `store_settings` under the `categories` key. Product media records use `product_media` / `abc_product_media`; files are stored in the public `product-images` bucket with a 50 MB per-file limit.
- After replacing the project files in Vercel, redeploy the complete `BELTYX` folder so `config.js`, `admin.html`, `storefront.js`, and the SQL repair file are from the same package.
