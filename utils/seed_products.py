import os
import sys

# Ensure root project path is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from models.product import Product
from models.category import Category
from models.user import User

# Category Mapping Definitions for FurnitureWalay Luxury Store
CATEGORIES_DATA = [
    {"id": 1, "name": "Architectural Lighting"},
    {"id": 3, "name": "Dining & Tableware"},
    {"id": 4, "name": "Accent & Lounge Chairs"},
    {"id": 5, "name": "Desks & Workspaces"},
    {"id": 6, "name": "Luxury Sofas"},
    {"id": 7, "name": "Decor & Sculptural Objects"},
    {"id": 8, "name": "Cabinets & Storage"},
    {"id": 9, "name": "Coffee & Console Tables"},
    {"id": 10, "name": "Beds & Bedroom Essentials"},
]

LUXURY_PRODUCTS = [
    # Sofas & Lounges
    {
        "product_name": "Aura Curved Bouclé Sectional Sofa",
        "description": "Upholstered in tactile Italian bouclé fabric, the Aura sectional features organic fluid curves and high-density memory foam core for refined lounging.",
        "price": 3850.00,
        "stock": 6,
        "category_id": 6,
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Solstice Velvet 3-Seater Sofa",
        "description": "Deep-seated lounge sofa wrapped in rich moss velvet with solid walnut frame and brushed brass feet details.",
        "price": 2750.00,
        "stock": 8,
        "category_id": 6,
        "image_url": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Komorebi Minimalist Linen Daybed",
        "description": "Inspired by Japanese minimalism, crafted with solid ash timber slats, natural flax linen cushion, and leather strapping.",
        "price": 1950.00,
        "stock": 5,
        "category_id": 6,
        "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
    },

    # Accent & Lounge Chairs
    {
        "product_name": "Elysian Velvet Armchair with Brass Trim",
        "description": "Sculptural wingback accent chair with cocooning silhouette, matte cognac leather, and hand-finished antique brass frame.",
        "price": 1250.00,
        "stock": 10,
        "category_id": 4,
        "image_url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Nordic Solid Oak Lounge Chair",
        "description": "Scandi-inspired lounge chair featuring steam-bent white oak arms and textured neutral wool cushions.",
        "price": 890.00,
        "stock": 14,
        "category_id": 4,
        "image_url": "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Vesper Shearling Swivel Armchair",
        "description": "Plush Australian shearling upholstered swivel chair with 360-degree rotation and weighted bronze base.",
        "price": 1450.00,
        "stock": 7,
        "category_id": 4,
        "image_url": "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1200&q=80"
    },

    # Coffee & Console Tables
    {
        "product_name": "Carrara Travertine Oval Coffee Table",
        "description": "Honed Italian travertine marble table with double pedestal pillar bases and chamfered edges.",
        "price": 1680.00,
        "stock": 9,
        "category_id": 9,
        "image_url": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Kyoto Fluted Smoked Glass Coffee Table",
        "description": "Architectural low coffee table with fluted smoked glass column legs and solid blackened oak top.",
        "price": 1120.00,
        "stock": 12,
        "category_id": 9,
        "image_url": "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Atelier Solid Walnut Console Table",
        "description": "Slim entryway console handcrafted from sustainably sourced American black walnut with subtle joinery detailing.",
        "price": 1340.00,
        "stock": 11,
        "category_id": 9,
        "image_url": "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80"
    },

    # Architectural Lighting
    {
        "product_name": "Luminary Brass & Frosted Glass Pendant",
        "description": "Hand-blown opal glass globe enclosed in satin brass geometric ring structure with dimmable ambient glow.",
        "price": 620.00,
        "stock": 18,
        "category_id": 1,
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Apex Sculptural Black Floor Lamp",
        "description": "Arched matte black steel floor lamp with adjustable linen drum shade and solid green marble counterweight base.",
        "price": 780.00,
        "stock": 15,
        "category_id": 1,
        "image_url": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Forma Ceramic Table Lamp",
        "description": "Artisanal textured clay ceramic base paired with unbleached natural linen conical shade.",
        "price": 340.00,
        "stock": 22,
        "category_id": 1,
        "image_url": "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Lumina Linear Brass Dining Chandelier",
        "description": "Slim horizontal brushed brass light bar with integrated warm LED diffuser, ideal above dining tables.",
        "price": 950.00,
        "stock": 8,
        "category_id": 1,
        "image_url": "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1200&q=80"
    },

    # Dining & Tableware
    {
        "product_name": "Zenith Solid Teak 8-Seater Dining Table",
        "description": "Substantial reclaimed teak wood table top supported by angled trestle legs with natural oil finish.",
        "price": 2890.00,
        "stock": 4,
        "category_id": 3,
        "image_url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Hans Woven Cane Dining Chair (Set of 2)",
        "description": "Handcrafted beechwood frames with natural rattan cane backrest and high-resilience leather seat cushion.",
        "price": 740.00,
        "stock": 16,
        "category_id": 3,
        "image_url": "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Artisanal Matte Stoneware Dinner Set (16-Piece)",
        "description": "Hand-thrown ceramic stoneware dinner plates, bowls, and mugs featuring organic exposed clay rim details.",
        "price": 280.00,
        "stock": 25,
        "category_id": 3,
        "image_url": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80"
    },

    # Beds & Bedroom Essentials
    {
        "product_name": "Serafina Upholstered Platform Bed (King)",
        "description": "Floating platform bed with plush channel-tufted linen headboard and integrated LED ambient underglow.",
        "price": 2450.00,
        "stock": 5,
        "category_id": 10,
        "image_url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Akira Minimalist Oak Nightstand",
        "description": "Compact bedside nightstand with soft-close drawer, open display shelf, and hidden cord management portal.",
        "price": 480.00,
        "stock": 18,
        "category_id": 10,
        "image_url": "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "100% French Organic Linen Duvet Cover Set",
        "description": "Washed French flax linen bedding set including duvet cover and matching pillowcases in muted oat tone.",
        "price": 310.00,
        "stock": 30,
        "category_id": 10,
        "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80"
    },

    # Storage & Cabinets
    {
        "product_name": "Miro Fluted Oak Sideboard Cabinet",
        "description": "Four-door buffet credenza with tambour fluted solid wood doors, adjustable interior shelves, and brass hardware.",
        "price": 1850.00,
        "stock": 7,
        "category_id": 8,
        "image_url": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Koto Tall Modular Bookshelf Unit",
        "description": "Open-concept wooden bookcase featuring asymmetrical shelving partitions finished in natural matte lacquer.",
        "price": 1290.00,
        "stock": 10,
        "category_id": 8,
        "image_url": "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=1200&q=80"
    },

    # Desks & Workspaces
    {
        "product_name": "Eames Executive Walnut Writing Desk",
        "description": "Refined home office desk with curved solid walnut top, discreet stationery drawer, and slim metal legs.",
        "price": 1580.00,
        "stock": 8,
        "category_id": 5,
        "image_url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Vitra Ergonomic Leather Desk Chair",
        "description": "High-back executive task chair wrapped in full-grain cognac leather with synchronized tilt tilt mechanism.",
        "price": 920.00,
        "stock": 12,
        "category_id": 5,
        "image_url": "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=1200&q=80"
    },

    # Decor & Sculptural Objects
    {
        "product_name": "Astral Organic Arch Floor Mirror",
        "description": "Full-length floor mirror with asymmetrical arched brass frame and shatter-resistant HD mirror glass.",
        "price": 790.00,
        "stock": 11,
        "category_id": 7,
        "image_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Terracotta Sculptural Vase Trio",
        "description": "Set of 3 unglazed earthy terracotta ceramic vases handcrafted by artisan potters with unique vessel silhouettes.",
        "price": 195.00,
        "stock": 20,
        "category_id": 7,
        "image_url": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Hand-Woven Hand-Spun Wool Area Rug (8x10)",
        "description": "Luxurious high-pile wool area rug with understated geometric tribal motifs in ivory and charcoal colorways.",
        "price": 1150.00,
        "stock": 9,
        "category_id": 7,
        "image_url": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Botanical Cast Bronze Decorative Bowl",
        "description": "Heavy sand-cast solid bronze center dish with hammered interior texture and antiqued exterior patina.",
        "price": 240.00,
        "stock": 15,
        "category_id": 7,
        "image_url": "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Concrete Pillar Planter Large",
        "description": "Architectural fiber-reinforced light grey concrete planter suitable for indoors or covered outdoor patios.",
        "price": 280.00,
        "stock": 14,
        "category_id": 7,
        "image_url": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Monolith Marble Bookends (Pair)",
        "description": "Heavy solid Nero Marquina black marble geometric bookends with natural white veining patterns.",
        "price": 160.00,
        "stock": 25,
        "category_id": 7,
        "image_url": "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&w=1200&q=80"
    },
    {
        "product_name": "Travertine Candle Lantern Holder",
        "description": "Carved natural beige travertine pillar candle vessel creating warm ambient light through semi-translucent stone.",
        "price": 135.00,
        "stock": 28,
        "category_id": 7,
        "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80"
    }
]

def seed():
    with app.app_context():
        # Update or create luxury categories
        print("Updating Categories for FurnitureWalay luxury brand...")
        for cat in CATEGORIES_DATA:
            existing_cat = Category.query.get(cat["id"])
            if existing_cat:
                existing_cat.category_name = cat["name"]
            else:
                new_cat = Category(category_id=cat["id"], category_name=cat["name"])
                db.session.add(new_cat)
        db.session.commit()

        # Fetch primary seller account or fallback
        seller = User.query.first()
        seller_id = seller.user_id if seller else 1

        # Clear existing products to ensure pure luxury furniture catalog
        print("Clearing previous placeholder products...")
        try:
            db.session.query(Product).delete()
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print("Note on clear:", e)

        # Seed 30 luxury products
        print("Seeding FurnitureWalay 30 Luxury Furniture & Décor Catalog items...")
        added = 0
        for item in LUXURY_PRODUCTS:
            prod = Product(
                product_name=item["product_name"],
                description=item["description"],
                price=item["price"],
                stock=item["stock"],
                category_id=item["category_id"],
                image_url=item["image_url"],
                seller_id=seller_id
            )
            db.session.add(prod)
            added += 1

        db.session.commit()
        print(f"Successfully seeded {added} FurnitureWalay luxury items into store database!")

if __name__ == "__main__":
    seed()
