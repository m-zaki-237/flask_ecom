-- =============================================================================
-- MARKET BROS E-COMMERCE SEED SCRIPT
-- PostgreSQL Compatible Product & Category Seed File
-- Seller / User ID: 13
-- Clean Categories: Furniture (13), Electronics (12), Clothing (11)
-- Total Seed Products: 65
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. ENSURE CLEAN CATEGORIES EXIST
-- -----------------------------------------------------------------------------
INSERT INTO categories (category_id, category_name) VALUES
  (13, 'Furniture'),
  (12, 'Electronics'),
  (11, 'Clothing')
ON CONFLICT (category_id) DO UPDATE SET category_name = EXCLUDED.category_name;

-- Drop obsolete categories
DELETE FROM categories WHERE category_id NOT IN (11, 12, 13);

-- -----------------------------------------------------------------------------
-- 2. RE-ALIGN ALL PRODUCTS TO MATCHING CATEGORIES
-- -----------------------------------------------------------------------------
UPDATE products 
SET category_id = 13 
WHERE LOWER(product_name) ~* '(sofa|bed|chair|table|desk|wardrobe|cabinet|bookshelf|mattress|credenza|armchair|furniture|planter|mirror|rug|vase|lantern|bookend|sideboard|nightstand|duvet|dinner|tableware|lighting|lamp|chandelier|pendant|po)';

UPDATE products 
SET category_id = 12 
WHERE LOWER(product_name) ~* '(iphone|samsung|galaxy|pixel|oneplus|xiaomi|redmi|poco|phone|mobile|electronics)';

UPDATE products 
SET category_id = 11 
WHERE LOWER(product_name) ~* '(shirt|jeans|jacket|dress|top|blouse|hoodie|shoe|sneaker|oxford|belt|sunglasses|scarf|bag|duffel|clothing|clothes|apparel)';

COMMIT;
