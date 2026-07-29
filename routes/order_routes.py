from flask import Blueprint, jsonify, request
from database import db
from models.order import Order
from models.product import Product
from models.user import User
from models.order_item import OrderItem
from middlewares.auth import jwt_required, role_required, get_current_user_id, get_current_user_role
from middlewares.audit_log import log_action
from schemas.order_schema import OrderCreateSchema

order_bp = Blueprint('order', __name__)
order_schema = OrderCreateSchema()

@order_bp.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()

    errors = order_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    user_id = data.get('user_id')
    items = data.get('items')

    if not user_id or not items:
        return jsonify({'error': 'User ID and items are required'}), 400

    new_order = Order(user_id=user_id)
    db.session.add(new_order)
    db.session.flush()

    for item in items:
        product_id = item.get('product_id')
        quantity = item.get('quantity')
        variant = item.get('variant')

        if not product_id or not quantity:
            return jsonify({'error': 'Product ID and quantity are required for each item'}), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify({'error': f'Product {product_id} not found'}), 404
        if quantity > product.stock:
            return jsonify({'error': f'Only {product.stock} units available for {product.product_name}'}), 400

        product.stock -= quantity

        new_order_item = OrderItem(order_id=new_order.order_id, product_id=product_id, quantity=quantity, variant=variant)
        db.session.add(new_order_item)

    db.session.commit()

    log_action("orders", new_order.order_id, "CREATE", f"Order {new_order.order_id} created for user {user_id}")

    return jsonify({'message': 'Order created successfully', 'order_id': new_order.order_id}), 201
@order_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if get_current_user_role() != "admin" and order.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

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

    log_action("orders", order_id, "DELETE", f"Order {order_id} deleted by admin")

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

    log_action("order_items", new_item.order_item_id, "CREATE", f"Item {product_id} added to order {order_id}")

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

    log_action("order_items", item_id, "DELETE", f"Item {item_id} removed from order {order_id}")

    return jsonify({'message': 'Item removed from order successfully'}), 200

@order_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@order_bp.route("/orders/<int:order_id>", methods=["PATCH"])
@role_required("admin","seller")
def update_order_status(order_id):

    order = Order.query.get(order_id)

    if not order:
        return jsonify({
            "error": "Order not found"
        }), 404


    # Seller permission check
    if get_current_user_role() == "seller":
        seller_id = get_current_user_id()
        order_items = (
            db.session.query(OrderItem)
            .join(Product, Product.product_id == OrderItem.product_id)
            .filter(
                OrderItem.order_id == order_id,
                Product.seller_id == seller_id
            )
            .all()
        )

        if not order_items:
            return jsonify({
                "error": "Access forbidden"
            }), 403
    data = request.get_json()
    new_status = data.get("status")
    if not new_status:
        return jsonify({
            "error": "Status is required"
        }), 400

    order.status = new_status
    db.session.commit()

    log_action(
        "orders",
        order_id,
        "UPDATE",
        f"Order {order_id} status changed to {new_status}"
    )
    return jsonify({
        "message": "Order status updated successfully",
        "order_id": order_id,
        "new_status": order.status
    }), 200

@order_bp.route('/orders/<int:order_id>/items', methods=['GET'])
@jwt_required()
def get_order_items(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if get_current_user_role() != "admin" and order.user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    items_data = [{'order_item_id': item.order_item_id, 'product_id': item.product_id, 'quantity': item.quantity, 'variant': item.variant} for item in order.order_items]

    return jsonify({'order_id': order.order_id, 'items': items_data}), 200

@order_bp.route('/orders', methods=['GET'])
@role_required("admin")
def get_all_orders():
    page = request.args.get('page',1,type=int)
    limit = request.args.get('limit',10,type=int)

    paginated = Order.query.paginate(page=page, per_page=limit, error_out=False)
    result = []

    for order in paginated.items:
        result.append({
            'order_id': order.order_id,
            'user_id': order.user_id,
            'items': [{'product_id': item.product_id, 'quantity': item.quantity, 'variant': item.variant} for item in order.order_items],
            'status': order.status,
            'created_at': order.created_at
        })

    return jsonify({
        'orders' : result,
        'total' : paginated.total,
        'pages' : paginated.pages,
        'current_page': paginated.page
    })

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

    log_action("order_items", item_id, "UPDATE", f"Order item {item_id} updated in order {order_id}")

    return jsonify({'message': 'Order item updated successfully', 'order_item_id': item.order_item_id, 'quantity': item.quantity, 'variant': item.variant}), 200

@order_bp.route('/users/<int:user_id>/orders', methods=['GET'])
@jwt_required()
def get_user_orders(user_id):
    if get_current_user_role() != "admin" and user_id != get_current_user_id():
        return jsonify({"error": "Access forbidden"}), 403

    orders = Order.query.filter_by(user_id=user_id).all()
    result = []
    for order in orders:
        result.append({
            "order_id": order.order_id,
            "status": order.status,
            "created_at": order.created_at,
            "items": [{"product_id": item.product_id, "quantity": item.quantity} for item in order.order_items]
        })
    return jsonify(result), 200



@order_bp.route("/seller/orders", methods=["GET"])
@role_required("seller")
def get_seller_orders():
    seller_id = get_current_user_id()

    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    query = (
        db.session.query(Order, OrderItem, Product, User)
        .join(OrderItem, Order.order_id == OrderItem.order_id)
        .join(Product, Product.product_id == OrderItem.product_id)
        .join(User, User.user_id == Order.user_id)
        .filter(Product.seller_id == seller_id)
    )

    paginated = query.paginate(
        page=page,
        per_page=limit,
        error_out=False
    )
    result = []
    for order, item, product, user in paginated.items:
        result.append({
            "order_id": order.order_id,
            "customer_name": f"{user.first_name} {user.last_name}",
            "customer_email": user.email,
            "product_name": product.product_name,
            "quantity": item.quantity,
            "price": product.price,
            "status": order.status,
            "created_at": (
                order.created_at.strftime("%Y-%m-%d %H:%M:%S")
                if order.created_at else None
            )
        })

    return jsonify({
        "orders": result,
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": paginated.page
    }), 200