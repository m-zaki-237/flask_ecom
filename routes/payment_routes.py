from flask import Blueprint, jsonify, request
from database import db
from models.order import Order
from models.payment import Payment
from models.order_item import OrderItem
from models.product import Product
from middlewares.auth import jwt_required, role_required, get_current_user_id
from middlewares.audit_log import log_action
from schemas.payment_schema import PaymentCreateSchema

payment_bp = Blueprint('payment', __name__)
payment_schema = PaymentCreateSchema()

@payment_bp.route('/payments', methods=['GET'])
@role_required("admin")
def get_payment():
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)

    paginated = Payment.query.paginate(
        page=page,
        per_page=limit,
        error_out=False
    )

    if not paginated.items:
        return jsonify({"error": "No payments found"}), 404

    result = []
    for payment in paginated.items:
        result.append({
            "payment_id": payment.payment_id,
            "order_id": payment.order_id,
            "amount": payment.amount,
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status,
            "created_at": payment.created_at.strftime("%Y-%m-%d %H:%M:%S")

        })

    return jsonify({
        "payments": result,
        'total' : paginated.total,
        'pages' : paginated.pages,
        'current_page': paginated.page
})

@payment_bp.route('/payments/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment_by_id(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({"error":"no payment found"}) , 404

    payment_info = {
        "payment_id": payment.payment_id,
        "order_id": payment.order_id,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "payment_status": payment.payment_status,
        "created_at": payment.created_at.strftime("%Y-%m-%d %H:%M:%S")

    }

    return jsonify(payment_info)

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
    paginated = (
        db.session.query(Payment)
        .join(Order, Payment.order_id == Order.order_id)
        .join(OrderItem, Order.order_id == OrderItem.order_id)
        .join(Product, OrderItem.product_id == Product.product_id)
        .filter(Product.seller_id == seller_id)
        .paginate(
            page=page,
            per_page=limit,
            error_out=False
        )
    )

    if not paginated.items:
        return jsonify({
            "error": "No payments found"
        }), 404

    result = []
    for payment in paginated.items:
        result.append({
            "payment_id": payment.payment_id,
            "order_id": payment.order_id,
            "amount": payment.amount,
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status,
            "created_at": payment.created_at.strftime("%Y-%m-%d %H:%M:%S")


        })

    return jsonify({
        "payments": result,
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": paginated.page
    }), 200