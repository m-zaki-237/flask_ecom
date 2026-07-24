from database import db

class Persmission(db.Model):
    __tablename__ = "permissions"

    permission_id = db.Column(db.Integer, primary_key = True)
    permission_name = db.Column(db.String(20), nullable = False)

    def __repr__(self):
        return f"<Permssion {self.permission_name}>"