from database import db

class Order(db.Model):
    __tablename__ = 'orders'
    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending')
    created_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    order_items = db.relationship('OrderItem', cascade='all, delete-orphan', backref='order')
    payments = db.relationship('Payment', cascade='all, delete-orphan', lazy=True)
    user = db.relationship('User', overlaps="orders")


    def __repr__(self):
        return f'<Order {self.order_id}>'