-- =============================================================================
-- MARKET BROS E-COMMERCE SEED SCRIPT
-- 1. Add "Accessories" Category (ID 14)
-- 2. Move Shoes, Sunglasses, Belts, Scarves, Duffel Bags to Accessories (14)
-- 3. Perfectly align product images with product titles across all categories
-- =============================================================================

BEGIN;

-- Step 1: Ensure Accessories category exists
INSERT INTO categories (category_id, category_name) VALUES
  (14, 'Accessories')
ON CONFLICT (category_id) DO UPDATE SET category_name = EXCLUDED.category_name;

-- Step 2: Reassign Shoes, Eyewear, Belts, Scarves, Duffels -> Accessories (category_id = 14)
UPDATE products 
SET category_id = 14 
WHERE LOWER(product_name) ~* '(shoe|sneaker|oxford|belt|sunglasses|scarf|bag|duffel)';

-- Step 3: Perfectly align product image URLs with product titles
-- Furniture Images
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Modern L-Shaped Velvet Sofa';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Chesterfield Tufted Leather Sofa';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Minimalist Scandinavian Linen Sofa';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Serafina Upholstered King Platform Bed';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Solid Oak Queen Storage Bed';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Oak Wood 6-Seater Dining Table';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Carrara Marble Top Round Dining Table';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Ergonomic Executive Mesh Office Chair';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Mid-Century Modern Leather Desk Chair';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80' WHERE product_name = '4-Door Mirrored Wardrobe Closet';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Solid Pine Rustic Armoire Wardrobe';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Honed Travertine Oval Coffee Table';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Nesting Tempered Glass Coffee Table Set';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Modular 5-Tier Industrial Bookshelf';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Minimalist Wall-Mounted Floating Bookshelf';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Premium Hybrid Memory Foam King Mattress';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Orthopedic Gel Infused Queen Mattress';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Fluted Walnut Sideboard Credenza Cabinet';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Artisan Rattan Accent Console Cabinet';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Nordic Ergonomic Lounge Armchair';

-- Mobile Phones / Electronics Images
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'iPhone 17 Pro Max';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'iPhone 17 Pro';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'iPhone 16 Pro Max 256GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'iPhone 16 Plus 128GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1574944985070-8f305042d31a?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'iPhone 15 Pro 128GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Samsung Galaxy S25 Ultra 512GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Samsung Galaxy S25+ 256GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d963?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Samsung Galaxy Z Fold6 512GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Samsung Galaxy S24 Ultra 256GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Samsung Galaxy A55 5G 128GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Google Pixel 9 Pro XL 256GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Google Pixel 9 Pro 128GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Google Pixel 8a 128GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'OnePlus 13 512GB 16GB RAM';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'OnePlus 12 256GB Silky Black';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'OnePlus Nord 4 5G 256GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Xiaomi 15 Ultra 512GB';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Xiaomi 14T Pro 256GB Titan Gray';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Xiaomi Redmi Note 13 Pro+ 5G';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Xiaomi POCO F6 Pro 512GB';

-- Clothing Images
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Premium Cotton Casual Shirt';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Slim Fit Linen Button-Down Shirt';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Vintage Wash Straight Leg Denim Jeans';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Slim Tapered Stretch Denim Jeans';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Winter Puffer Jacket';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Heritage Genuine Leather Biker Jacket';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Classic Denim Trucker Jacket';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Elegant Floral Silk Midi Dress';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Velvet Evening Wrap Dress';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Ribbed Knit Casual Tank Top';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Silk Button-Up Tailored Blouse';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Heavyweight Fleece Pullover Hoodie';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Minimalist Oversized Streetwear Hoodie';

-- Accessories & Footwear Images
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Italian Leather Oxford Dress Shoes';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Classic Canvas Low-Top Sneakers';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'All-Terrain Trail Running Shoes';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Full-Grain Leather Minimalist Belt';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Polarized Aviator Sunglasses';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Cashmere Knit Winter Scarf';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' WHERE product_name = 'Water-Resistant Canvas Duffel Bag';

COMMIT;
