from database import db
class SupportTicket(db.Model):
    __tablename__ = "support_tickets"

    ticket_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable = False)
    subject = db.Column(db.String(100), nullable = False)
    body = db.Column(db.Text, nullable = False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    status = db.Column(db.String(50), nullable = False, default = "Pending")

    def __repr__(self):
        return f"<SupportTicket {self.ticket_id}>"