from database import db

class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key = True)
    first_name = db.Column(db.String(100), nullable = False)
    last_name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(150), unique = True ,nullable = False)
    password = db.Column(db.String(255), nullable = False)
    address = db.Column(db.Text)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.role_id"), nullable = False)

    role = db.relationship(
        "Role",
        backref="users"
    )

    orders = db.relationship("Order", cascade="all, delete-orphan", lazy=True)
    carts = db.relationship("Cart", cascade="all, delete-orphan", lazy=True)
    wishlists = db.relationship("Wishlist", cascade="all, delete-orphan", lazy=True)
    reviews = db.relationship("Review", cascade="all, delete-orphan", lazy=True)
    support_tickets = db.relationship("SupportTicket", cascade="all, delete-orphan", lazy=True)
    audit_logs = db.relationship("AuditLog", cascade="all, delete-orphan", lazy=True)

    def __repr__(self):
        return f"<User {self.email}>"
