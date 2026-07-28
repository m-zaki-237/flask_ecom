
from database import db


class Wishlist(db.Model):
    __tablename__ = 'wishlist'

    wishlist_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    
    items = db.relationship('WishlistItem', backref='wishlist', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f'<Wishlist {self.wishlist_id} - User {self.user_id}>'
