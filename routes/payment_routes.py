from flask import Blueprint, jsonify, request
from database import db
from models.order import Order
from models.payment import Payment

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/payments', methods=['GET'])
def get_payment():
    payments = Payment.query.all()
    result = []
    if not payments:
        return jsonify({"error":"no payments found"})
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
def get_payment_by_id(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({"error":"no payment found"})

    payment_info = {
        "payment_id": payment.payment_id,
        "order_id": payment.order_id,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "payment_status": payment.payment_status
    }

    return jsonify(payment_info)

@payment_bp.route('/payments/create', methods=['POST'])
def create_payment():
    data = request.get_json()
    order_id = data.get('order_id')
    amount = data.get('amount')
    payment_method = data.get('payment_method')
    payment_status = data.get('payment_status')

    if not order_id:
        return jsonify({"error":"order id missing!"})

    new_payment = Payment(order_id=order_id, amount=amount, payment_method=payment_method, payment_status=payment_status)
    db.session.add(new_payment)
    db.session.commit()

    return jsonify({"message":"payment created successfully", "payment_id": new_payment.payment_id})

@payment_bp.route('/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({"error":"payment not found"})

    db.session.delete(payment)
    db.session.commit()

    return jsonify({"message": "payment deleted successfully"})

@payment_bp.route('/payments/update/<int:payment_id>', methods=['PATCH'])
def update_payment(payment_id):
    payment = Payment.query.get(payment_id)
    if not payment:
        return jsonify({"error": "no payment found!"})

    data = request.get_json()
    if "payment_status" in data:
        payment.payment_status = data["payment_status"]

    if "amount" in data:
        payment.amount = data["amount"]

    db.session.commit()

    return jsonify({"message" : "payment updated successfully", "payment_id":payment.payment_id})