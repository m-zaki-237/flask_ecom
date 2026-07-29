from database import db
from datetime import datetime
class Payment(db.Model):
    __tablename__ = 'payments'

    payment_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.order_id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    payment_status = db.Column(db.String(50), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    order = db.relationship('Order', overlaps="payments")

    def __repr__(self):
        return f'<Payment {self.payment_id} - Order {self.order_id} - Amount {self.amount}>'