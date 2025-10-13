// Script to add dummy products to the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const dummyProducts = [
  {
    name: 'Handwoven Pashmina Shawl',
    description: 'Beautiful handwoven pashmina shawl made by artisan women in Kashmir. Soft, warm and elegant.',
    price: 1200,
    category: 'Textiles',
    subcategory: 'Shawls',
    stock_quantity: 15,
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400'
  },
  {
    name: 'Terracotta Garden Pot Set',
    description: 'Set of 3 handmade terracotta pots perfect for indoor plants. Unique earthy finish.',
    price: 850,
    category: 'Home Decor',
    subcategory: 'Pottery',
    stock_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'
  },
  {
    name: 'Silver Jhumka Earrings',
    description: 'Traditional silver jhumka earrings with intricate filigree work. Lightweight and comfortable.',
    price: 675,
    category: 'Jewelry',
    subcategory: 'Earrings',
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
  },
  {
    name: 'Bamboo Wind Chimes',
    description: 'Handcrafted bamboo wind chimes with soothing natural tones. Perfect for gardens.',
    price: 550,
    category: 'Home Decor',
    subcategory: 'Garden',
    stock_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
  },
  {
    name: 'Block Print Cotton Kurta',
    description: 'Hand block printed cotton kurta in vibrant colors. Comfortable daily wear.',
    price: 1450,
    category: 'Textiles',
    subcategory: 'Clothing',
    stock_quantity: 12,
    image_url: 'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=400'
  },
  {
    name: 'Wooden Spice Box',
    description: 'Traditional wooden spice box with 7 compartments. Hand-carved with beautiful patterns.',
    price: 995,
    category: 'Home Decor',
    subcategory: 'Kitchen',
    stock_quantity: 18,
    image_url: 'https://images.unsplash.com/photo-1556126797-7ca16b9f8f66?w=400'
  },
  {
    name: 'Brass Diya Set',
    description: 'Set of 5 handmade brass diyas for festivals. Traditional oil lamps with elegant design.',
    price: 720,
    category: 'Home Decor',
    subcategory: 'Decorative',
    stock_quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1604516450224-0c55463e5ada?w=400'
  },
  {
    name: 'Jute Handbag',
    description: 'Eco-friendly jute handbag with colorful embroidery. Perfect for daily use.',
    price: 625,
    category: 'Accessories',
    subcategory: 'Bags',
    stock_quantity: 22,
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400'
  },
  {
    name: 'Handmade Paper Notebook',
    description: 'Beautiful handmade paper notebook with traditional binding. 100 pages.',
    price: 580,
    category: 'Stationery',
    subcategory: 'Notebooks',
    stock_quantity: 35,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'
  },
  {
    name: 'Ceramic Tea Cup Set',
    description: 'Set of 4 hand-painted ceramic tea cups with saucers. Perfect for evening tea.',
    price: 1100,
    category: 'Home Decor',
    subcategory: 'Pottery',
    stock_quantity: 16,
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'
  },
  {
    name: 'Embroidered Wall Hanging',
    description: 'Beautiful hand-embroidered wall hanging with traditional motifs. 18x24 inches.',
    price: 890,
    category: 'Home Decor',
    subcategory: 'Wall Art',
    stock_quantity: 14,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
  },
  {
    name: 'Handwoven Table Runner',
    description: 'Elegant handwoven table runner in cotton. 6 feet long with tassels.',
    price: 750,
    category: 'Textiles',
    subcategory: 'Home Textiles',
    stock_quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
  },
  {
    name: 'Wooden Jewelry Box',
    description: 'Intricately carved wooden jewelry box with multiple compartments.',
    price: 1350,
    category: 'Home Decor',
    subcategory: 'Storage',
    stock_quantity: 10,
    image_url: 'https://images.unsplash.com/photo-1556126797-7ca16b9f8f66?w=400'
  },
  {
    name: 'Cane Basket Set',
    description: 'Set of 3 handwoven cane baskets in different sizes. Great for storage.',
    price: 680,
    category: 'Home Decor',
    subcategory: 'Storage',
    stock_quantity: 28,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
  },
  {
    name: 'Glass Bead Necklace',
    description: 'Colorful glass bead necklace handmade by rural artisans. 18 inches long.',
    price: 595,
    category: 'Jewelry',
    subcategory: 'Necklaces',
    stock_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'
  },
  {
    name: 'Hand-painted Coasters',
    description: 'Set of 6 hand-painted wooden coasters with traditional designs.',
    price: 520,
    category: 'Home Decor',
    subcategory: 'Kitchen',
    stock_quantity: 45,
    image_url: 'https://images.unsplash.com/photo-1556126797-7ca16b9f8f66?w=400'
  },
  {
    name: 'Silk Scarf',
    description: 'Pure silk scarf with hand-painted floral designs. 24x60 inches.',
    price: 1650,
    category: 'Textiles',
    subcategory: 'Accessories',
    stock_quantity: 8,
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400'
  },
  {
    name: 'Clay Oil Diffuser',
    description: 'Handmade clay oil diffuser with intricate patterns. Comes with tea light.',
    price: 640,
    category: 'Home Decor',
    subcategory: 'Aromatherapy',
    stock_quantity: 32,
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'
  },
  {
    name: 'Knitted Wool Sweater',
    description: 'Hand-knitted wool sweater in traditional patterns. Available in multiple sizes.',
    price: 1580,
    category: 'Textiles',
    subcategory: 'Clothing',
    stock_quantity: 6,
    image_url: 'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=400'
  },
  {
    name: 'Macrame Plant Hanger',
    description: 'Beautiful macrame plant hanger made from natural cotton rope. Holds pots up to 8 inches.',
    price: 780,
    category: 'Home Decor',
    subcategory: 'Garden',
    stock_quantity: 18,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
  }
]

async function addDummyProducts() {
  try {
    console.log('Starting to add dummy products...')
    
    // First, ensure we have a seller
    const { data: seller, error: sellerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_seller', true)
      .limit(1)
      .single()

    let sellerId = seller?.id

    if (!sellerId) {
      console.log('No seller found, creating one...')
      const { data: newSeller, error: createSellerError } = await supabase
        .from('profiles')
        .insert({
          email: 'artisan@martify.com',
          full_name: 'Maya Sharma',
          phone: '+91 98765 43210',
          user_type: 'seller',
          is_seller: true,
          bio: 'Passionate artisan specializing in traditional Indian handicrafts. Supporting rural women artisans.'
        })
        .select('id')
        .single()

      if (createSellerError) {
        console.error('Error creating seller:', createSellerError)
        return
      }
      
      sellerId = newSeller?.id
    }

    if (!sellerId) {
      console.error('Could not get or create seller ID')
      return
    }

    console.log('Using seller ID:', sellerId)

    // Add products in batches
    const productsWithSeller = dummyProducts.map(product => ({
      ...product,
      seller_id: sellerId
    }))

    const { data, error } = await supabase
      .from('products')
      .insert(productsWithSeller)
      .select()

    if (error) {
      console.error('Error inserting products:', error)
      return
    }

    console.log(`Successfully added ${data?.length || 0} products!`)
    console.log('Products added:', data?.map(p => p.name))

  } catch (error) {
    console.error('Error in addDummyProducts:', error)
  }
}

// Run the script if called directly
if (require.main === module) {
  addDummyProducts()
}

export { addDummyProducts }