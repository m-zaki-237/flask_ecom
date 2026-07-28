from flask import Blueprint, jsonify, request
from database import db
from models.wishlist import Wishlist
from models.wishlist_item import WishlistItem
from middlewares.auth import jwt_required, get_current_user_role, get_current_user_id
from middlewares.audit_log import log_action

wishlist_bp = Blueprint('wishlist', __name__)
    
@wishlist_bp.route('/wishlists', methods=['POST'])
@jwt_required()
def create_wishlist():
    data = request.get_json()

    user_id = data.get('user_id')
    product_ids = data.get('products', [])

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    new_wishlist = Wishlist(user_id=user_id)

    db.session.add(new_wishlist)
    db.session.flush()  # gets wishlist_id before commit

    for product_id in product_ids:
        wishlist_item = WishlistItem(
            wishlist_id=new_wishlist.wishlist_id,
            product_id=product_id
        )
        db.session.add(wishlist_item)

    db.session.commit()

    log_action("wishlists", new_wishlist.wishlist_id, "CREATE", f"Wishlist {new_wishlist.wishlist_id} created for user {user_id}")

    return jsonify({
        'message': 'Wishlist created successfully',
        'wishlist_id': new_wishlist.wishlist_id,
        'products_added': product_ids
    }), 201

@wishlist_bp.route('/wishlists/<int:wishlist_id>', methods=['GET'])
@jwt_required()
def get_wishlist(wishlist_id):
    wishlist = Wishlist.query.get(wishlist_id)
    if not wishlist:
        return jsonify({'error': 'Wishlist not found'}), 404

    if get_current_user_role() != "admin" and wishlist.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    wishlist_data = {
        'wishlist_id': wishlist.wishlist_id,
        'user_id': wishlist.user_id,
        'products': [
            {
                'product_id': item.product_id,
                'name': item.product.product_name if item.product else "Unknown Product",
                'price': item.product.price if item.product else "Unknown Price",
            }
            for item in wishlist.items
        ]
    }
    return jsonify(wishlist_data), 200

@wishlist_bp.route('/wishlists/<int:wishlist_id>', methods=['DELETE'])
@jwt_required()
def delete_wishlist(wishlist_id):
    wishlist = Wishlist.query.get(wishlist_id)
    if not wishlist:
        return jsonify({'error': 'Wishlist not found'}), 404

    if get_current_user_role() != "admin" and wishlist.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    db.session.delete(wishlist)
    db.session.commit()

    log_action("wishlists", wishlist_id, "DELETE", f"Wishlist {wishlist_id} deleted")

    return jsonify({'message': 'Wishlist deleted successfully'}), 200

@wishlist_bp.route('/wishlists/<int:wishlist_id>/items', methods=['POST'])
@jwt_required()
def add_item_to_wishlist(wishlist_id):
    wishlist = Wishlist.query.get(wishlist_id)
    if not wishlist:
        return jsonify({'error': 'Wishlist not found'}), 404

    if get_current_user_role() != "admin" and wishlist.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    data = request.get_json()
    product_id = data.get('product_id')

    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400

    new_item = WishlistItem(wishlist_id=wishlist_id, product_id=product_id)
    db.session.add(new_item)
    db.session.commit()

    log_action("wishlist_items", new_item.wishlist_item_id, "CREATE", f"Product {product_id} added to wishlist {wishlist_id}")

    return jsonify({'message': 'Item added to wishlist successfully', 'item_id': new_item.wishlist_item_id}), 201

@wishlist_bp.route('/wishlists/<int:wishlist_id>/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_item_from_wishlist(wishlist_id, item_id):
    wishlist = Wishlist.query.get(wishlist_id)
    if not wishlist:
        return jsonify({'error': 'Wishlist not found'}), 404

    if get_current_user_role() != "admin" and wishlist.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    item = WishlistItem.query.get(item_id)
    if not item or item.wishlist_id != wishlist_id:
        return jsonify({'error': 'Item not found in this wishlist'}), 404

    db.session.delete(item)
    db.session.commit()

    log_action("wishlist_items", item_id, "DELETE", f"Item {item_id} removed from wishlist {wishlist_id}")

    return jsonify({'message': 'Item removed from wishlist successfully'}), 200