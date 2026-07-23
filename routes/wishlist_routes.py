from flask import Blueprint, jsonify, request
from database import db
from models.product import Product
from models.wishlist import Wishlist
from models.wishlist_item import WishlistItem
wishlist_bp = Blueprint('wishlist', __name__)
    
@wishlist_bp.route('/wishlists', methods=['POST'])
def create_wishlist():
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    new_wishlist = Wishlist(user_id=user_id)
    db.session.add(new_wishlist)
    db.session.commit()

    return jsonify({'message': 'Wishlist created successfully', 'wishlist_id': new_wishlist.wishlist_id}), 201

@wishlist_bp.route('/wishlists/<int:wishlist_id>', methods=['GET'])
def get_wishlist(wishlist_id):
    wishlist = Wishlist.query.get(wishlist_id)
    if not wishlist:
        return jsonify({'error': 'Wishlist not found'}), 404

    wishlist_data = {
        'wishlist_id': wishlist.wishlist_id,
        'user_id': wishlist.user_id,
        'products': [
            {
                'product_id': item.product_id,
                'name': item.product.name,
                'price': item.product.price
            }
            for item in wishlist.items
        ]
    }

    return jsonify(wishlist_data), 200

@wishlist_bp.route('/wishlists/<int:wishlist_id>', methods=['DELETE'])
def delete_wishlist(wishlist_id):
    wishlist = Wishlist.query.get(wishlist_id)
    if not wishlist:
        return jsonify({'error': 'Wishlist not found'}), 404

    db.session.delete(wishlist)
    db.session.commit()

    return jsonify({'message': 'Wishlist deleted successfully'}), 200

@wishlist_bp.route('/wishlists/<int:wishlist_id>/items', methods=['POST'])
def add_item_to_wishlist(wishlist_id):
    wishlist = Wishlist.query.get(wishlist_id)
    if not wishlist:
        return jsonify({'error': 'Wishlist not found'}), 404

    data = request.get_json()
    product_id = data.get('product_id')

    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400

    new_item = WishlistItem(wishlist_id=wishlist_id, product_id=product_id)
    db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'Item added to wishlist successfully', 'item_id': new_item.wishlist_item_id}), 201