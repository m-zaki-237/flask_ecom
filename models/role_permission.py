from database import db

class RolePermission(db.Model):
    __tablename__ = "role_permissions"
    role_permission_id = db.Column(db.Integer, primary_key = True)
    permission_id = db.Column(db.Integer, db.ForeignKey("permissions.permission_id"), nullable = False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.role_id"), nullable = False)

    role = db.relationship(
        "Role",
        backref = "role_permissions"
    )

    permission = db.relationship(
        "Permission",
        backref = "role_permissions"
    )

    def __repr__(self):
        return f"<RolePermission {self.role_permission_id}>"
