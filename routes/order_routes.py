from flask import Blueprint, jsonify, request
from database import db
from models.order import Order
from models.order_item import OrderItem
from middlewares.auth import jwt_required, role_required

order_bp = Blueprint('order', __name__)

@order_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    user_id = data.get('user_id')
    items = data.get('items')  # list of items with product_id and quantity

    if not user_id or not items:
        return jsonify({'error': 'User ID and items are required'}), 400

    new_order = Order(user_id=user_id)
    db.session.add(new_order)
    db.session.commit()

    for item in items:
        product_id = item.get('product_id')
        quantity = item.get('quantity')
        variant = item.get('variant')
        if not product_id or not quantity:
            return jsonify({'error': 'Product ID and quantity are required for each item'}), 400
        new_order_item = OrderItem(order_id=new_order.order_id, product_id=product_id, quantity=quantity, variant=variant)
        db.session.add(new_order_item)

    db.session.commit()

    return jsonify({'message': 'Order created successfully', 'order_id': new_order.order_id}), 201

@order_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    order_data = {
        'order_id': order.order_id,
        'user_id': order.user_id,
        'items': [{'product_id': item.product_id, 'quantity': item.quantity, 'variant': item.variant} for item in order.order_items],
        'status': order.status,
        'created_at': order.created_at
    }

    return jsonify(order_data), 200

@order_bp.route('/orders/<int:order_id>', methods=['DELETE'])
@role_required("admin")
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    db.session.delete(order)
    db.session.commit()

    return jsonify({'message': 'Order deleted successfully'}), 200

@order_bp.route('/orders/<int:order_id>/items', methods=['POST'])
@role_required("admin")
def add_item_to_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    variant = data.get('variant')

    if not product_id or not quantity:
        return jsonify({'error': 'Product ID and quantity are required'}), 400

    new_item = OrderItem(order_id=order_id, product_id=product_id, quantity=quantity, variant=variant)
    db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'Item added to order successfully', 'order_item_id': new_item.order_item_id}), 201

@order_bp.route('/orders/<int:order_id>/items/<int:item_id>', methods=['DELETE'])
@role_required("admin")
def remove_item_from_order(order_id, item_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    item = OrderItem.query.get(item_id)
    if not item or item.order_id != order_id:
        return jsonify({'error': 'Item not found in this order'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Item removed from order successfully'}), 200

@order_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@role_required("admin")
def update_order_status(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    data = request.get_json()
    new_status = data.get('status')

    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    order.status = new_status
    db.session.commit()

    return jsonify({'message': 'Order status updated successfully', 'new_status': order.status}), 200

@order_bp.route('/orders/<int:order_id>/items', methods=['GET'])
@jwt_required()
def get_order_items(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    items_data = [{'order_item_id': item.order_item_id, 'product_id': item.product_id, 'quantity': item.quantity, 'variant': item.variant} for item in order.order_items]

    return jsonify({'order_id': order.order_id, 'items': items_data}), 200

@order_bp.route('/orders', methods=['GET'])
@role_required("admin")
def get_all_orders():
    orders = Order.query.all()
    orders_data = []
    for order in orders:
        order_info = {
            'order_id': order.order_id,
            'user_id': order.user_id,
            'status': order.status,
            'created_at': order.created_at,
            'items': [{'product_id': item.product_id, 'quantity': item.quantity, 'variant': item.variant} for item in order.order_items]
        }
        orders_data.append(order_info)

    return jsonify(orders_data), 200

@order_bp.route('/orders/<int:order_id>/items/<int:item_id>', methods=['PATCH'])
@role_required("admin")
def update_order_item(order_id, item_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    item = OrderItem.query.get(item_id)
    if not item or item.order_id != order_id:
        return jsonify({'error': 'Item not found in this order'}), 404

    data = request.get_json()
    quantity = data.get('quantity')
    variant = data.get('variant')

    if quantity is not None:
        item.quantity = quantity
    if variant is not None:
        item.variant = variant

    db.session.commit()

    return jsonify({'message': 'Order item updated successfully', 'order_item_id': item.order_item_id, 'quantity': item.quantity, 'variant': item.variant}), 200

