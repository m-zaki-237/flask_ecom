-- =============================================================================
-- MARKET BROS CATEGORY & PRODUCT ALIGNMENT SCRIPT
-- 1. Create Clean Categories: Furniture (1), Electronics (2), Clothing (3)
-- 2. Map all existing products to the exact matching category
-- 3. Drop all obsolete / redundant categories
-- =============================================================================

BEGIN;

-- Step 1: Ensure main categories exist with fixed IDs (1, 2, 3)
INSERT INTO categories (category_id, category_name) VALUES
  (1, 'Furniture'),
  (2, 'Electronics'),
  (3, 'Clothing')
ON CONFLICT (category_id) DO UPDATE SET category_name = EXCLUDED.category_name;

-- Step 2: Align Furniture products -> category_id = 1
UPDATE products 
SET category_id = 1 
WHERE LOWER(product_name) ~* '(sofa|bed|chair|table|desk|wardrobe|cabinet|bookshelf|mattress|credenza|armchair|furniture|planter|mirror|rug|vase|lantern|bookend|sideboard|nightstand|duvet|dinner|tableware|lighting|lamp|chandelier|pendant|po)';

-- Step 3: Align Electronics / Mobile products -> category_id = 2
UPDATE products 
SET category_id = 2 
WHERE LOWER(product_name) ~* '(iphone|samsung|galaxy|pixel|oneplus|xiaomi|redmi|poco|phone|mobile|electronics)';

-- Step 4: Align Clothing products -> category_id = 3
UPDATE products 
SET category_id = 3 
WHERE LOWER(product_name) ~* '(shirt|jeans|jacket|dress|top|blouse|hoodie|shoe|sneaker|oxford|belt|sunglasses|scarf|bag|duffel|clothing|clothes|apparel)';

-- Step 5: Clean up any remaining unclassified products to Furniture (1)
UPDATE products 
SET category_id = 1 
WHERE category_id NOT IN (1, 2, 3);

-- Step 6: Drop all obsolete categories that are no longer used
DELETE FROM categories 
WHERE category_id NOT IN (1, 2, 3);

COMMIT;
