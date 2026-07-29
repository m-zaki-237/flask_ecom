from flask import Blueprint, jsonify, request
from models.audit_log import AuditLog
from middlewares.auth import role_required

audit_log_bp = Blueprint('audit_log', __name__)

@audit_log_bp.route('/audit_logs', methods=['GET'])
@role_required("admin")
def get_all_audit_logs():
    page = request.args.get('page',1,type=int)
    limit = request.args.get('limit',10,type=int)
    paginated = AuditLog.query.order_by(AuditLog.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    result = []
    for log in paginated.items:
        result.append({
            "log_id": log.log_id,
            "user_id": log.user_id,
            "table_name": log.table_name,
            "record_id": log.record_id,
            "action": log.action,
            "description": log.description,
            "created_at": log.created_at
        })
    return jsonify({
        'audit_logs' : result,
        'total' : paginated.total,
        'pages' : paginated.pages,
        'current_page': paginated.page
    }), 200

@audit_log_bp.route('/audit_logs/<int:log_id>', methods=['GET'])
@role_required("admin")
def get_audit_logs(log_id):
    log = AuditLog.query.get(log_id)
    if not log:
        return jsonify ({"error":"Log not found"}), 404
    
    return jsonify({
        "log_id": log.log_id,
        "user_id": log.user_id,
        "table_name": log.table_name,
        "record_id": log.record_id,
        "action": log.action,
        "description": log.description,
        "created_at": log.created_at  
    }), 200 

@audit_log_bp.route('/audit_logs/user/<int:user_id>', methods=['GET'])
@role_required("admin")
def get_audit_log_by_user(user_id):
    logs = AuditLog.query.filter_by(user_id=user_id).order_by(AuditLog.created_at.desc()).all()
    if not logs:
        return jsonify ({"error":"Logs not found"}), 404

    result = []
    for log in logs:
        result.append({
            "log_id": log.log_id,
             "user_id": log.user_id,
            "table_name": log.table_name,
            "record_id": log.record_id,
            "action": log.action,
            "description": log.description,
            "created_at": log.created_at
        })
    return jsonify(result), 200