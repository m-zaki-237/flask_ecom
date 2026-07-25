from flask import request, g
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from models.audit_log import AuditLog
from database import db

def log_action(table_name,record_id,action,description):
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()

        if not user_id:
            return # skip

        log = AuditLog(
        user_id = int(user_id),
        table_name = table_name,
        record_id = record_id,
        action = action,
        description = description
        )

        db.session.add(log)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        print(f"Audit log error: {e}")