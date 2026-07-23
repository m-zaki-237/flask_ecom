from database import db
class Category(db.Model):
    __tablename__ = "categories"

    category_id = db.Column(db.Integer, primary_key = True)
    parent_category_id = db.Column(db.Integer, db.ForeignKey("categories.category_id"), nullable = True)
    category_name = db.Column(db.String(150), unique = True, nullable = False)

    parent = db.relationship(
        "Category",
        remote_side=[category_id],
        backref="subcategories"
    )

    def __repr__(self):
        return f"<Category {self.category_name}>"