from database import db
class Product(db.Model):
    __tablename__ = "products"
    product_id = db.Column(db.Integer, primary_key = True)
    image_url = db.Column(db.Text)
    product_name = db.Column(db.String(150), nullable = False)
    price = db.Column(db.Numeric(10,2), nullable = False)
    stock = db.Column(db.Integer, nullable = False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.category_id"), nullable = False)

    category = db.relationship(
        "Category",
        backref = "products"
    )

    def __repr__(self):
        return f"<Product {self.product_name}>"