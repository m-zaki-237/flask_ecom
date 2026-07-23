from flask import Flask
from config import Config
from database import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

#Models
from models.role import Role
from models.user import User
from models.category import Category
from models.product import Product
from models.cart import Cart
from models.cart_item import CartItem
from models.order import Order
from models.order_item import OrderItem
from models.review import Review
from models.wishlist import Wishlist
from models.wishlist_item import WishlistItem
from models.support_ticket import SupportTicket
#Routes
from routes.user_routes import user_bp
from routes.product_routes import product_bp
from routes.category_routes import category_bp
from routes.cart_routes import cart_bp
from routes.order_routes import order_bp
from routes.review_routes import review_bp
from routes.wishlist_routes import wishlist_bp
from routes.support_ticket_routes import support_ticket_bp
#Blueprints
app.register_blueprint(user_bp)
app.register_blueprint(product_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(category_bp)
app.register_blueprint(order_bp)
app.register_blueprint(review_bp)
app.register_blueprint(wishlist_bp)
app.register_blueprint(support_ticket_bp)

@app.route("/")
def home():
    return {
        "message": "Api running"
    }


if __name__ == "__main__":
    app.run(debug=True)