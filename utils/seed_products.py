import os
import sys

# Ensure root project path is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from models.product import Product
from models.category import Category
from models.user import User

SAMPLE_PRODUCTS = [
    {
        "product_name": "Apple MacBook Pro 16\" M3 Max",
        "description": "Powerful laptop with 36GB Unified Memory, 1TB SSD, and liquid retina XDR display for demanding creative workloads.",
        "price": 3499.00,
        "stock": 12,
        "category_id": 5, # Laptops
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Sony WH-1000XM5 Wireless Headphones",
        "description": "Industry-leading noise canceling headphones with dual processors, 8 microphones, and up to 30 hours of battery life.",
        "price": 398.00,
        "stock": 25,
        "category_id": 1, # Electronics
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "iPhone 15 Pro Max 256GB",
        "description": "Forged in titanium with revolutionary A17 Pro chip, customizable Action button, and 5x optical zoom camera system.",
        "price": 1199.00,
        "stock": 18,
        "category_id": 4, # Mobiles
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Minimalist Ceramic Coffee Mug Set",
        "description": "Set of 4 handcrafted matte ceramic mugs designed for specialty coffee lovers. Microwave and dishwasher safe.",
        "price": 45.00,
        "stock": 40,
        "category_id": 3, # Home & Kitchen
        "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Modern Velvet Accent Armchair",
        "description": "Luxury velvet upholstered armchair with solid brass legs. Ergonomic backrest providing exceptional comfort for living spaces.",
        "price": 320.00,
        "stock": 8,
        "category_id": 8, # Furniture
        "image_url": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Classic Tailored Linen Blazer",
        "description": "Breathable Italian linen blend blazer featuring notched lapels, two-button front, and casual modern silhouette.",
        "price": 149.50,
        "stock": 30,
        "category_id": 6, # Men Clothing
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Silk Wrap Midi Summer Dress",
        "description": "Flowy 100% mulberry silk wrap dress with subtle floral print, short puff sleeves, and adjustable waist belt tie.",
        "price": 185.00,
        "stock": 22,
        "category_id": 7, # Women Clothing
        "image_url": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Adjustable Dumbbell Set (5-52.5 lbs)",
        "description": "Space-saving home gym dumbbells with intuitive dial mechanism allowing fast resistance updates for full body workouts.",
        "price": 299.00,
        "stock": 15,
        "category_id": 10, # GYM
        "image_url": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Designing Data-Intensive Applications",
        "description": "The definitive guide to system architecture, distributed databases, streaming, and reliable backend engineering.",
        "price": 49.99,
        "stock": 50,
        "category_id": 9, # Books
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Dell XPS 15 OLED Touch",
        "description": "Ultra-slim 15.6-inch 3.5K OLED touch display powered by Intel Core i9, 32GB RAM, and NVIDIA RTX graphics card.",
        "price": 2299.00,
        "stock": 5,
        "category_id": 5, # Laptops
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Keychron Q1 Max Mechanical Keyboard",
        "description": "Full aluminum CNC wireless mechanical keyboard with hot-swappable switches, QMK/VIA support, and double-gasket design.",
        "price": 219.00,
        "stock": 35,
        "category_id": 1, # Electronics
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80"
    },
    {
        "product_name": "Google Pixel 8 Pro 128GB",
        "description": "Google Tensor G3 chip, advanced AI camera features, Super Actua display, and 7 years of OS updates.",
        "price": 899.00,
        "stock": 14,
        "category_id": 4, # Mobiles
        "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
    }
]

def seed():
    with app.app_context():
        # Check seller
        seller = User.query.first()
        seller_id = seller.user_id if seller else 1

        added = 0
        for item in SAMPLE_PRODUCTS:
            existing = Product.query.filter_by(product_name=item["product_name"]).first()
            if not existing:
                cat = Category.query.get(item["category_id"])
                if not cat:
                    cat = Category.query.first()
                    item["category_id"] = cat.category_id

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
        print(f"Successfully seeded {added} products!")

if __name__ == "__main__":
    seed()
