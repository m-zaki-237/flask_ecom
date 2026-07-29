from flask import Blueprint, jsonify, request
from database import db
from models.support_ticket import SupportTicket
from middlewares.auth import role_required, jwt_required, get_current_user_id
from middlewares.audit_log import log_action

support_ticket_bp = Blueprint('support_ticket', __name__)

@support_ticket_bp.route("/support_tickets", methods=["GET"])
@role_required("admin")
def get_all_support_tickets():
    page = request.args.get('page',1,type=int)
    limit = request.args.get('limit',10,type=int)
    paginated = SupportTicket.query.paginate(page=page,per_page=limit, error_out=False)
    if not paginated.items:
        return jsonify({"error":"no payments found!"}), 404
    result = []
    for ticket in paginated.items:
        result.append({
            "ticket_id": ticket.ticket_id,
            "user_id": ticket.user_id,
            "subject": ticket.subject,
            "body": ticket.body,
            "created_at" : ticket.created_at, 
            "status": ticket.status
        })
    return jsonify({
        'support_tickets' : result,
        'total' : paginated.total,
        'pages' : paginated.pages,
        'current_page': paginated.page
    }), 200

@support_ticket_bp.route("/support_tickets/<int:ticket_id>", methods=["GET"])
@jwt_required()
def get_support_tickets(ticket_id):
    ticket = SupportTicket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "ticket not found"})

    ticket_info = {
        "ticket_id": ticket.ticket_id,
        "user_id": ticket.user_id,
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

@support_ticket_bp.route("/my-support-tickets", methods=["GET"])
@jwt_required()
def get_my_support_tickets():

    user_id = get_current_user_id()

    tickets = SupportTicket.query.filter_by(
        user_id=user_id
    ).order_by(
        SupportTicket.created_at.desc()
    ).all()


    result = []

    for ticket in tickets:
        result.append({
            "ticket_id": ticket.ticket_id,
            "subject": ticket.subject,
            "body": ticket.body,
            "created_at": ticket.created_at,
            "status": ticket.status
        })


    return jsonify(result), 200