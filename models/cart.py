from database import db

class Cart(db.Model):
    __tablename__ = 'cart'
    cart_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    cart_items = db.relationship('CartItem', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Cart {self.cart_id}>'