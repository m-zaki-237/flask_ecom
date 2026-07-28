from database import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"
    log_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable = False)
    table_name = db.Column(db.String(25), nullable = False)
    record_id = db.Column(db.Integer, nullable = False)
    action = db.Column(db.String(20), nullable = False)
    description = db.Column(db.Text, nullable = False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    def __repr__(self):
        return f"<AuditLog {self.log_id}>"