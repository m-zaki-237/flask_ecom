from flask import Flask , jsonify
from config import Config
from database import db
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
app = Flask(__name__)
app.config.from_object(Config)
jwt = JWTManager(app)
db.init_app(app)

CORS(app)

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
from models.payment import Payment
from models.audit_log import AuditLog

#Routes
from routes.user_routes import user_bp
from routes.product_routes import product_bp
from routes.category_routes import category_bp
from routes.cart_routes import cart_bp
from routes.order_routes import order_bp
from routes.review_routes import review_bp
from routes.wishlist_routes import wishlist_bp
from routes.support_ticket_routes import support_ticket_bp
from routes.payment_routes import payment_bp
from routes.audit_log_routes import audit_log_bp

#Blueprints
app.register_blueprint(user_bp)
app.register_blueprint(product_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(category_bp)
app.register_blueprint(order_bp)
app.register_blueprint(review_bp)
app.register_blueprint(wishlist_bp)
app.register_blueprint(support_ticket_bp)
app.register_blueprint(payment_bp)
app.register_blueprint(audit_log_bp)

@app.errorhandler(SQLAlchemyError)
def handle_db_error(e):
    db.session.rollback()
    return jsonify({"error": "database error", "details":str(e)}), 500
@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": "resource not found"}), 404
@app.errorhandler(400)
def handle_400(e):
    return jsonify({"error": "bad request"}), 400
@app.errorhandler(403)
def handle_403(e):
    return jsonify({"error": "access forbidden"}), 403
@app.errorhandler(Exception)
def handle_exception(e):
    db.session.rollback()
    return jsonify({"error": "internal server error", "details": str(e)}), 500

@app.route("/")
def home():
    return jsonify({
        "message": "Api running"
    })

if __name__ == "__main__":
    app.run(debug=True)