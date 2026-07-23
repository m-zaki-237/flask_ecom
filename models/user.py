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

    def __repr__(self):
        return f"<User {self.email}>"
