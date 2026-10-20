BELTYX — FINAL REPAIR PACKAGE

This ZIP contains the complete site at the archive root (index.html is at the root), existing storefront design/assets, and admin panel files.

IMPORTANT: The user previously ran the older repair SQL, but category/product saving still failed. This package therefore includes BELTYX-ADMIN-REPAIR-V2.sql to repair older/partial table definitions, missing unique key index on store_settings, missing ID sequences, and policies for product/category writes.

DO THIS IN ORDER:
1. Extract this ZIP.
2. In Supabase Dashboard > SQL Editor, run BELTYX-ADMIN-REPAIR-V2.sql (not the initial setup SQL). It preserves existing product/category data and ends with a read-only column verification query.
3. Deploy the extracted contents to the existing Vercel project so index.html is at the deployment root.
4. Hard refresh /admin.html, log in with the head-admin account, then test saving one category WITHOUT uploading an image first. Next test a product WITHOUT media first. This isolates database writes from Storage uploads.
5. If any operation still fails, copy the exact red error shown under the form. Do not rerun the full setup SQL.

The code and JS syntax are checked locally. The live Supabase project cannot be exercised from this offline build, so the final save test must happen in the deployed site.


HOMEPAGE FIX (2026-10-18): Fixed the homepage category/product renderer to use the ABC namespace exported by storefront.js. This was preventing both categories and products from rendering. No visual/layout/animation changes.
