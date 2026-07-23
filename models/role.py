from database import db

class Role(db.Model):
    __tablename__ = "roles"

    role_id = db.Column(db.Integer, primary_key = True)
    role_name = db.Column(db.String(20), nullable=False)

    def __repr__(self):
        return f"<Role {self.role_name}>"