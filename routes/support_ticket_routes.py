from flask import Blueprint, jsonify, request
from database import db
from models.support_ticket import SupportTicket
from middlewares.auth import role_required, jwt_required
from middlewares.audit_log import log_action

support_ticket_bp = Blueprint('support_ticket', __name__)

@support_ticket_bp.route("/support_tickets", methods=["GET"])
@role_required("admin")
def get_all_support_tickets():
    support_ticket = SupportTicket.query.all()
    support_tickets = []
    for ticket in support_ticket:
        ticket_info = {
            "ticket_id": ticket.ticket_id,
            "user_id": ticket.user.user_id,
            "subject": ticket.subject,
            "body": ticket.body,
            "created_at" : ticket.created_at, 
            "status": ticket.status
        }
        support_tickets.append(ticket_info)
    return jsonify(support_tickets), 200

@support_ticket_bp.route("/support_tickets/<int:ticket_id>", methods=["GET"])
@jwt_required()
def get_support_tickets(ticket_id):
    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "ticket not found"})

    ticket_info = {
        "ticket_id": ticket.ticket_id,
        "user_id": ticket.user.user_id,
        "subject": ticket.subject,
        "body": ticket.body,
        "created_at" : ticket.created_at, 
        "status": ticket.status
    }
    return jsonify(ticket_info), 200

@support_ticket_bp.route("/support_tickets", methods=["POST"])
@jwt_required()
def create_support_ticket():
    data = request.get_json()
    user_id = data.get('user_id')
    subject = data.get('subject')
    body = data.get('body')

    if not user_id or not subject or not body:
        return jsonify({"error":"user_id and subject and body is required"})

    new_ticket = SupportTicket(user_id=user_id, subject=subject, body=body)
    db.session.add(new_ticket)
    db.session.commit()

    log_action("support_tickets", new_ticket.ticket_id, "CREATE", f"Support ticket {new_ticket.ticket_id} created by user {user_id}")

    return jsonify({"message":"ticket generated successfully", "ticket_id":new_ticket.ticket_id})

@support_ticket_bp.route("/support_tickets/<int:ticket_id>", methods=["DELETE"])
@role_required("admin")
def delete_support_ticket(ticket_id):
    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error':'no ticket found'})

    db.session.delete(ticket)
    db.session.commit()

    log_action("support_tickets", ticket_id, "DELETE", f"Support ticket {ticket_id} deleted by admin")

    return jsonify({'message':'ticket delete successfully'})

@support_ticket_bp.route("/support_tickets/<int:ticket_id>", methods=["PATCH"])
@role_required("admin")
def update_support_ticket_status(ticket_id):
    ticket = SupportTicket.query.get(ticket_id)

    if not ticket:
        return jsonify({"error": "ticket not found"}), 404

    data = request.get_json()

    if "status" in data:
        ticket.status = data["status"]

    db.session.commit()

    log_action("support_tickets", ticket_id, "UPDATE", f"Support ticket {ticket_id} status updated to {ticket.status}")

    return jsonify({
        "message": "ticket updated successfully",
        "ticket_id": ticket.ticket_id
    }), 200