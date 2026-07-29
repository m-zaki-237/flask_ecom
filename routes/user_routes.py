from flask import Blueprint, jsonify, request
from database import db
from models.user import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required as flask_jwt_required, get_jwt_identity
from middlewares.auth import jwt_required, role_required
from middlewares.audit_log import log_action
from schemas.user_schema import UserRegisterSchema

user_bp = Blueprint("user_routes", __name__)

register_schema = UserRegisterSchema()

@user_bp.route("/users", methods=["GET"])
@role_required("admin")
def get_users():
    users = User.query.all()
    result = []

    for user in users:
        result.append({
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role.role_name
        })

    return jsonify(result)

@user_bp.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "user not found"}), 404

    return jsonify({
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "role": user.role.role_name
    }), 200

@user_bp.route("/user/register", methods=["POST"])
def register_user():
    data = request.json
    errors = register_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    hashed_password = generate_password_hash(data["password"])
    existing_user = User.query.filter_by(email=data["email"]).first()

    if existing_user:
        return jsonify({
            "message": "email already exists"
        }), 409

    new_user = User(
        first_name = data["first_name"],
        last_name = data["last_name"],
        email = data["email"],
        password = hashed_password,
        role_id = data["role_id"]
    )

    db.session.add(new_user)
    db.session.commit()

    log_action("users", new_user.user_id, "CREATE", f"New user {new_user.email} registered")


    return jsonify({
        "message": "user created successfully",
        "user_id": new_user.user_id 
    }), 201

@user_bp.route("/user/login", methods=["POST"])
def login_user():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"message": "invalid email or password"}), 404

    if check_password_hash(user.password, data["password"]):
        access_token = create_access_token(
            identity=str(user.user_id),
            additional_claims = {"role":user.role.role_name}
        )

        refresh_token = create_refresh_token(
            identity=str(user.user_id)
        )

        log_action("users", user.user_id, "LOGIN", f"User {user.email} logged in")

        return jsonify({
            "message": "login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role.role_name
        }), 200
    else:
        return jsonify({"message": "invalid credentials"}), 401

@user_bp.route("/user/refresh", methods=["POST"])
@flask_jwt_required(refresh=True)
def refresh_token():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error":"user not found"}), 404

    new_access_token = create_access_token(
        identity=user_id,
        additional_claims={
            "role": user.role.role_name
        }
    )

    return jsonify({
        "access_token": new_access_token
    })

@user_bp.route("/user/update/<int:user_id>", methods=["PATCH"])
@jwt_required()
def update_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "user not found"}), 404

    data = request.json

    user.first_name = data.get("first_name", user.first_name)
    user.last_name = data.get("last_name", user.last_name)
    user.email = data.get("email", user.email)
    if "password" in data:
        user.password = generate_password_hash(data["password"])
    user.role_id = data.get("role_id", user.role_id)

    db.session.commit()

    log_action("users", user_id, "UPDATE", f"User {user.email} updated their profile")

    return jsonify({"message": "user updated successfully"}), 200

@user_bp.route("/user/delete/<int:user_id>", methods=["DELETE"])
@role_required("admin")
def delete_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "user not found"}), 404

    db.session.delete(user)
    db.session.commit()

    log_action("users", user_id, "DELETE", f"User {user_id} deleted by admin")
    
    return jsonify({"message": "user deleted successfully"}), 200