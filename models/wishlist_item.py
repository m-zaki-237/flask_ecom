from database import db

class WishlistItem(db.Model):
    __tablename__ = 'wishlist_items'

    wishlist_item_id = db.Column(db.Integer, primary_key=True)
    wishlist_id = db.Column(db.Integer, db.ForeignKey('wishlist.wishlist_id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id', ondelete='CASCADE'), nullable=False)
    added_at = db.Column(db.DateTime, server_default=db.func.now())

    product = db.relationship('Product', backref='wishlist_items')

    def __repr__(self):
        return f'<WishlistItem {self.wishlist_item_id} - Wishlist {self.wishlist_id} - Product {self.product_id}>'