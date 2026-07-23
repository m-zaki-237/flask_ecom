from flask import Blueprint, jsonify, request
from database import db
from models.cart import Cart
from models.cart_item import CartItem
cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/cart', methods=['POST'])
def create_cart():
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    new_cart = Cart(user_id=user_id)
    db.session.add(new_cart)
    db.session.commit()

    return jsonify({'message': 'Cart created successfully', 'cart_id': new_cart.cart_id}), 201

@cart_bp.route('/cart/<int:cart_id>', methods=['GET'])
def get_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    cart_data = {
        'cart_id': cart.cart_id,
        'user_id': cart.user_id,
        'items': [{'product_id': item.product_id, 'quantity': item.quantity} for item in cart.cart_items]
    }

    return jsonify(cart_data), 200

@cart_bp.route('/cart/<int:cart_id>', methods=['DELETE'])
def delete_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    db.session.delete(cart)
    db.session.commit()

    return jsonify({'message': 'Cart deleted successfully'}), 200

@cart_bp.route('/cart/<int:cart_id>/items', methods=['POST'])
def add_item_to_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    if not product_id or not quantity:
        return jsonify({'error': 'Product ID and quantity are required'}), 400

    new_item = CartItem(cart_id=cart_id, product_id=product_id, quantity=quantity)
    db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'Item added to cart successfully', 'cart_item_id': new_item.cart_item_id}), 201

@cart_bp.route('/cart/<int:cart_id>/items/<int:item_id>', methods=['DELETE'])
def remove_item_from_cart(cart_id, item_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    item = CartItem.query.get(item_id)
    if not item or item.cart_id != cart_id:
        return jsonify({'error': 'Item not found in this cart'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Item removed from cart successfully'}), 200

@cart_bp.route('/cart/<int:cart_id>/items', methods=['GET'])
def get_cart_items(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    items_data = [{'cart_item_id': item.cart_item_id, 'product_id': item.product_id, 'quantity': item.quantity} for item in cart.cart_items]

    return jsonify({'cart_id': cart.cart_id, 'items': items_data}), 200

@cart_bp.route('/cart/<int:cart_id>/items/<int:item_id>', methods=['PATCH'])
def update_cart_item(cart_id, item_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    item = CartItem.query.get(item_id)
    if not item or item.cart_id != cart_id:
        return jsonify({'error': 'Item not found in this cart'}), 404

    data = request.get_json()
    quantity = data.get('quantity')

    if quantity is None:
        return jsonify({'error': 'Quantity is required'}), 400

    item.quantity = quantity
    db.session.commit()

    return jsonify({'message': 'Cart item updated successfully', 'cart_item_id': item.cart_item_id, 'quantity': item.quantity}), 200

@cart_bp.route('/cart/<int:cart_id>/items/<int:item_id>', methods=['GET'])
def get_cart_item(cart_id, item_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({'error': 'Cart not found'}), 404

    item = CartItem.query.get(item_id)
    if not item or item.cart_id != cart_id:
        return jsonify({'error': 'Item not found in this cart'}), 404

    item_data = {
        'cart_item_id': item.cart_item_id,
        'product_id': item.product_id,
        'quantity': item.quantity
    }

    return jsonify(item_data), 200
