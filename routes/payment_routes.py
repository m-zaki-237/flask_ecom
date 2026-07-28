from flask import Blueprint, jsonify, request
from database import db
from models.payment import Payment
from middlewares.auth import jwt_required, role_required
from middlewares.audit_log import log_action
from schemas.payment_schema import PaymentCreateSchema

payment_bp = Blueprint('payment', __name__)
payment_schema = PaymentCreateSchema()

@payment_bp.route('/payments', methods=['GET'])
@role_required("admin")
def get_payment():
    payments = Payment.query.all()
    result = []
    if not payments:
        return jsonify({"error":"no payments found"}) , 404
    for payment in payments:
        result.append({
            "payment_id": payment.payment_id,
            "order_id": payment.order_id,
            "amount": payment.amount,
            "payment_method": payment.payment_method,
            "payment_status": payment.payment_status
        })
    return jsonify(result)

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
        "payment_status": payment.payment_status
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