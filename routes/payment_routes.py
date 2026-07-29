from flask import Blueprint, jsonify, request
from database import db
from models.order import Order
from models.payment import Payment
from models.order_item import OrderItem
from models.product import Product
from models.user import User
from middlewares.auth import jwt_required, role_required, get_current_user_id
from middlewares.audit_log import log_action
from schemas.payment_schema import PaymentCreateSchema
from sqlalchemy.orm import joinedload

payment_bp = Blueprint('payment', __name__)
payment_schema = PaymentCreateSchema()

@payment_bp.route('/payments', methods=['GET'])
@role_required("admin")
def get_payment():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)

    query = Payment.query.options(
        joinedload(Payment.order).joinedload(Order.user),
        joinedload(Payment.order).joinedload(Order.order_items).joinedload(OrderItem.product)
    ).order_by(Payment.payment_id.desc())

    paginated = query.paginate(
        page=page,
        per_page=limit,
        error_out=False
    )

    if not paginated.items:
        return jsonify({"payments": [], "total": 0, "pages": 1, "current_page": 1}), 200

    result = []
    for payment in paginated.items:
        order = payment.order
        user = order.user if order else None

        products_list = []
        if order and order.order_items:
            for item in order.order_items:
                prod = item.product
                products_list.append({
                    "product_id": item.product_id,
                    "product_name": prod.product_name if prod else f"Product #{item.product_id}",
                    "product_image": prod.image_url if prod else None,
                    "quantity": item.quantity,
                    "unit_price": float(prod.price) if (prod and prod.price is not None) else 0.0,
                    "total_price": round(float(prod.price * item.quantity), 2) if (prod and prod.price is not None) else 0.0
                })

        result.append({
            "payment_id": payment.payment_id,
            "order_id": payment.order_id,
            "customer_name": f"{user.first_name} {user.last_name}" if user else "Customer",
            "customer_email": user.email if user else "N/A",
            "amount": float(payment.amount) if payment.amount is not None else 0.0,
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status,
            "order_status": order.status if order else "N/A",
            "products": products_list,
            "created_at": payment.created_at.strftime("%Y-%m-%d %H:%M:%S") if payment.created_at else None
        })

    return jsonify({
        "payments": result,
        'total' : paginated.total,
        'pages' : paginated.pages,
        'current_page': paginated.page
    }), 200

@payment_bp.route('/payments/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment_by_id(payment_id):
    payment = Payment.query.options(
        joinedload(Payment.order).joinedload(Order.user),
        joinedload(Payment.order).joinedload(Order.order_items).joinedload(OrderItem.product)
    ).filter_by(payment_id=payment_id).first()

    if not payment:
        return jsonify({"error":"no payment found"}), 404

    order = payment.order
    user = order.user if order else None

    products_list = []
    if order and order.order_items:
        for item in order.order_items:
            prod = item.product
            products_list.append({
                "product_id": item.product_id,
                "product_name": prod.product_name if prod else f"Product #{item.product_id}",
                "product_image": prod.image_url if prod else None,
                "quantity": item.quantity,
                "unit_price": float(prod.price) if (prod and prod.price is not None) else 0.0,
                "total_price": round(float(prod.price * item.quantity), 2) if (prod and prod.price is not None) else 0.0
            })

    payment_info = {
        "payment_id": payment.payment_id,
        "order_id": payment.order_id,
        "customer_name": f"{user.first_name} {user.last_name}" if user else "Customer",
        "customer_email": user.email if user else "N/A",
        "amount": float(payment.amount) if payment.amount is not None else 0.0,
        "payment_method": payment.payment_method,
        "payment_status": payment.payment_status,
        "order_status": order.status if order else "N/A",
        "products": products_list,
        "created_at": payment.created_at.strftime("%Y-%m-%d %H:%M:%S") if payment.created_at else None
    }

    return jsonify(payment_info), 200

@payment_bp.route('/payments/create', methods=['POST'])
@jwt_required()
def create_payment():
    data = request.get_json()

    errors = payment_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    order_id = data.get('order_id')
    amount = data.get('amount')
    payment_method = data.get('payment_method')
    payment_status = data.get('payment_status')
    if not order_id:
        return jsonify({"error":"order id missing!"}) , 400

    new_payment = Payment(order_id=order_id, amount=amount, payment_method=payment_method, payment_status=payment_status)
    db.session.add(new_payment)
    db.session.commit()

    log_action("payments", new_payment.payment_id, "CREATE", f"Payment {new_payment.payment_id} created for order {order_id}")

    return jsonify({"message":"payment created successfully", "payment_id": new_payment.payment_id})

@payment_bp.route('/payments/<int:payment_id>', methods=['DELETE'])
@role_required("admin")
def delete_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({"error":"payment not found"}) , 404

    db.session.delete(payment)
    db.session.commit()

    log_action("payments", payment_id, "DELETE", f"Payment {payment_id} deleted by admin")

    return jsonify({"message": "payment deleted successfully"})

@payment_bp.route('/payments/update/<int:payment_id>', methods=['PATCH'])
@role_required("admin")
def update_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({"error": "no payment found!"}) , 404

    data = request.get_json()
    if "payment_status" in data:
        payment.payment_status = data["payment_status"]

    if "amount" in data:
        payment.amount = data["amount"]

    db.session.commit()

    log_action("payments", payment_id, "UPDATE", f"Payment {payment_id} status updated to {payment.payment_status}")

    return jsonify({"message" : "payment updated successfully", "payment_id":payment.payment_id})


@payment_bp.route('/seller/payments', methods=['GET'])
@role_required("seller")
def get_seller_payments():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    
    seller_id = get_current_user_id()
    query = (
        db.session.query(Payment, Order, User, Product)
        .join(Order, Payment.order_id == Order.order_id)
        .join(User, Order.user_id == User.user_id)
        .join(OrderItem, Order.order_id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.product_id)
        .filter(Product.seller_id == seller_id)
        .order_by(Payment.payment_id.desc())
    )

    paginated = query.paginate(
        page=page,
        per_page=limit,
        error_out=False
    )

    if not paginated.items:
        return jsonify({
            "payments": [],
            "total": 0,
            "pages": 1,
            "current_page": 1
        }), 200

    result = []
    for payment, order, user, product in paginated.items:
        result.append({
            "payment_id": payment.payment_id,
            "order_id": payment.order_id,
            "user_id": user.user_id,
            "customer_name": f"{user.first_name} {user.last_name}" if user else "Customer",
            "customer_email": user.email if user else "N/A",
            "product_name": product.product_name if product else "N/A",
            "product_image": product.image_url if product else None,
            "amount": float(payment.amount) if payment.amount is not None else 0.0,
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status,
            "created_at": payment.created_at.strftime("%Y-%m-%d %H:%M:%S") if payment.created_at else None
        })

    return jsonify({
        "payments": result,
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": paginated.page
    }), 200