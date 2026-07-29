from flask import Blueprint, jsonify, request
from database import db
from models.cart import Cart
from models.cart_item import CartItem
from models.product import Product
from middlewares.auth import jwt_required, get_current_user_id, get_current_user_role
from middlewares.audit_log import log_action

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/cart', methods=['POST'])
@jwt_required()
def create_cart():
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    # return existing cart if one already exists
    existing_cart = Cart.query.filter_by(user_id=user_id).first()
    if existing_cart:
        return jsonify({'message': 'Cart already exists', 'cart_id': existing_cart.cart_id}), 200

    new_cart = Cart(user_id=user_id)
    db.session.add(new_cart)
    db.session.commit()

    log_action("carts", new_cart.cart_id, "CREATE", f"Cart {new_cart.cart_id} created for user {new_cart.user_id}")

    return jsonify({'message': 'Cart created successfully', 'cart_id': new_cart.cart_id}), 201

@cart_bp.route('/cart/<int:cart_id>', methods=['GET'])
@jwt_required()
def get_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    if get_current_user_role() != "admin" and cart.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    cart_data = {
        'cart_id': cart.cart_id,
        'user_id': cart.user_id,
        'items': [{
            'cart_item_id': item.cart_item_id,
            'product_id': item.product_id,
            'product_name': item.product.product_name,
            'price': float(item.product.price),
            'quantity': item.quantity
        } for item in cart.cart_items]
    }

    return jsonify(cart_data), 200

@cart_bp.route('/cart/<int:cart_id>', methods=['DELETE'])
@jwt_required()
def delete_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    if get_current_user_role() != "admin" and cart.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403
    
    db.session.delete(cart)
    db.session.commit()

    log_action("carts", cart_id, "DELETE", f"Cart {cart_id} deleted")

    return jsonify({'message': 'Cart deleted successfully'}), 200

@cart_bp.route('/cart/<int:cart_id>/items', methods=['POST'])
@jwt_required()
def add_item_to_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    if get_current_user_role() != "admin" and cart.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    if not product_id or not quantity:
        return jsonify({'error': 'Product ID and quantity are required'}), 400
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    if quantity > product.stock:
        return jsonify({'error': f'Only {product.stock} units available'}), 400
    
    new_item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
    db.session.add(new_item)
    db.session.commit()

    log_action("cart_items", new_item.cart_item_id, "CREATE", f"Item {product_id} added to cart {cart_id} with quantity {quantity}")

    return jsonify({'message': 'Item added to cart successfully', 'cart_item_id': new_item.cart_item_id}), 201

@cart_bp.route('/cart/<int:cart_id>/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_item_from_cart(cart_id, item_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    if get_current_user_role() != "admin" and cart.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403
    
    item = CartItem.query.get(item_id)
    if not item or item.cart_id != cart_id:
        return jsonify({'error': 'Item not found in this cart'}), 404

    db.session.delete(item)
    db.session.commit()

    log_action("cart_items", item_id, "DELETE", f"Item {item_id} removed from cart {cart_id}")

    return jsonify({'message': 'Item removed from cart successfully'}), 200

@cart_bp.route('/cart/<int:cart_id>/items', methods=['GET'])
@jwt_required()
def get_cart_items(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    if get_current_user_role() != "admin" and cart.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    items_data = [{'cart_item_id': item.cart_item_id, 'product_id': item.product_id, 'quantity': item.quantity} for item in cart.cart_items]

    return jsonify({'cart_id': cart.cart_id, 'items': items_data}), 200

@cart_bp.route('/cart/<int:cart_id>/items/<int:item_id>', methods=['PATCH'])
@jwt_required()
def update_cart_item(cart_id, item_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    if get_current_user_role() != "admin" and cart.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    item = CartItem.query.get(item_id)
    if not item or item.cart_id != cart_id:
        return jsonify({'error': 'Item not found in this cart'}), 404

    data = request.get_json()
    quantity = data.get('quantity')

    if quantity is None:
        return jsonify({'error': 'Quantity is required'}), 400

    if quantity > item.product.stock:
        return jsonify({'error': f'Only {item.product.stock} units available'}), 400
    
    item.quantity = quantity
    db.session.commit()

    log_action("cart_items", item_id, "UPDATE", f"Cart item {item_id} quantity updated to {quantity}")

    return jsonify({'message': 'Cart item updated successfully', 'cart_item_id': item.cart_item_id, 'quantity': item.quantity}), 200

@cart_bp.route('/cart/<int:cart_id>/items/<int:item_id>', methods=['GET'])
@jwt_required()
def get_cart_item(cart_id, item_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    if get_current_user_role() != "admin" and cart.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    item = CartItem.query.get(item_id)
    if not item or item.cart_id != cart_id:
        return jsonify({'error': 'Item not found in this cart'}), 404

    item_data = {
        'cart_item_id': item.cart_item_id,
        'product_id': item.product_id,
        'quantity': item.quantity
    }

    return jsonify(item_data), 200
