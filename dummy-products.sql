-- Insert 20 dummy products with prices between 500-1700
INSERT INTO products (
  seller_id,
  name,
  description,
  price,
  category,  
  subcategory,
  stock_quantity,
  image_url,
  created_at
) VALUES
-- Get a seller ID first (we'll use the first seller or create one)
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Handwoven Pashmina Shawl',
  'Beautiful handwoven pashmina shawl made by artisan women in Kashmir. Soft, warm and elegant.',
  1200,
  'Textiles',
  'Shawls',
  15,
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Terracotta Garden Pot Set',
  'Set of 3 handmade terracotta pots perfect for indoor plants. Unique earthy finish.',
  850,
  'Home Decor',
  'Pottery',
  25,
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Silver Jhumka Earrings',
  'Traditional silver jhumka earrings with intricate filigree work. Lightweight and comfortable.',
  675,
  'Jewelry',
  'Earrings',
  30,
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Bamboo Wind Chimes',
  'Handcrafted bamboo wind chimes with soothing natural tones. Perfect for gardens.',
  550,
  'Home Decor',
  'Garden',
  20,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Block Print Cotton Kurta',
  'Hand block printed cotton kurta in vibrant colors. Comfortable daily wear.',
  1450,
  'Textiles',
  'Clothing',
  12,
  'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Wooden Spice Box',
  'Traditional wooden spice box with 7 compartments. Hand-carved with beautiful patterns.',
  995,
  'Home Decor',
  'Kitchen',
  18,
  'https://images.unsplash.com/photo-1556126797-7ca16b9f8f66?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Brass Diya Set',
  'Set of 5 handmade brass diyas for festivals. Traditional oil lamps with elegant design.',
  720,
  'Home Decor',
  'Decorative',
  40,
  'https://images.unsplash.com/photo-1604516450224-0c55463e5ada?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Jute Handbag',
  'Eco-friendly jute handbag with colorful embroidery. Perfect for daily use.',
  625,
  'Accessories',
  'Bags',
  22,
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Handmade Paper Notebook',
  'Beautiful handmade paper notebook with traditional binding. 100 pages.',
  580,
  'Stationery',
  'Notebooks',
  35,
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Ceramic Tea Cup Set',
  'Set of 4 hand-painted ceramic tea cups with saucers. Perfect for evening tea.',
  1100,
  'Home Decor',
  'Pottery',
  16,
  'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Embroidered Wall Hanging',
  'Beautiful hand-embroidered wall hanging with traditional motifs. 18x24 inches.',
  890,
  'Home Decor',
  'Wall Art',
  14,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Handwoven Table Runner',
  'Elegant handwoven table runner in cotton. 6 feet long with tassels.',
  750,
  'Textiles',
  'Home Textiles',
  20,
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Wooden Jewelry Box',
  'Intricately carved wooden jewelry box with multiple compartments.',
  1350,
  'Home Decor',
  'Storage',
  10,
  'https://images.unsplash.com/photo-1556126797-7ca16b9f8f66?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Cane Basket Set',
  'Set of 3 handwoven cane baskets in different sizes. Great for storage.',
  680,
  'Home Decor',
  'Storage',
  28,
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Glass Bead Necklace',
  'Colorful glass bead necklace handmade by rural artisans. 18 inches long.',
  595,
  'Jewelry',
  'Necklaces',
  25,
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Hand-painted Coasters',
  'Set of 6 hand-painted wooden coasters with traditional designs.',
  520,
  'Home Decor',
  'Kitchen',
  45,
  'https://images.unsplash.com/photo-1556126797-7ca16b9f8f66?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Silk Scarf',
  'Pure silk scarf with hand-painted floral designs. 24x60 inches.',
  1650,
  'Textiles',
  'Accessories',
  8,
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Clay Oil Diffuser',
  'Handmade clay oil diffuser with intricate patterns. Comes with tea light.',
  640,
  'Home Decor',
  'Aromatherapy',
  32,
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Knitted Wool Sweater',
  'Hand-knitted wool sweater in traditional patterns. Available in multiple sizes.',
  1580,
  'Textiles',
  'Clothing',
  6,
  'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=400',
  NOW()
),
(
  (SELECT id FROM profiles WHERE is_seller = true LIMIT 1),
  'Macrame Plant Hanger',
  'Beautiful macrame plant hanger made from natural cotton rope. Holds pots up to 8 inches.',
  780,
  'Home Decor',
  'Garden',
  18,
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  NOW()
);

-- Also create a seller profile if none exists
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  user_type,
  is_seller,
  bio,
  created_at
) VALUES (
  gen_random_uuid(),
  'artisan@martify.com',
  'Maya Sharma',
  '+91 98765 43210',
  'seller',
  true,
  'Passionate artisan specializing in traditional Indian handicrafts. Supporting rural women artisans.',
  NOW()
) ON CONFLICT (email) DO NOTHING;