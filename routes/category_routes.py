from flask import Blueprint, jsonify, request
from database import db
from models.category import Category
from middlewares.auth import role_required, jwt_required
category_bp = Blueprint("category_routes", __name__)

@category_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.all()
    result = []
    for category in categories:
        result.append({
            "category_id": category.category_id,
            "category_name": category.category_name
        })
    return jsonify(result)
@category_bp.route("/category/<int:category_id>", methods=["GET"])
def get_category(category_id):
    category = Category.query.get(category_id)

    if not category:
        return jsonify({"message": "category not found"}), 404

    return jsonify({
        "category_id": category.category_id,
        "category_name": category.category_name
    }), 200
@category_bp.route("/category/create", methods=["POST"])
@role_required("admin","seller")
def create_category():
    data = request.json

    if not data or "category_name" not in data:
        return jsonify({"message": "category_name is required"}), 400

    new_category = Category(
        category_name=data["category_name"],
        parent_category_id=data.get("parent_category_id")
    )

    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        "message": "category created successfully",
        "category_id": new_category.category_id
    }), 201

@category_bp.route("/category/update/<int:category_id>", methods=["PATCH"])
@role_required("admin","seller")
def update_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return {"message":"category not found"}
    
    data = request.json
    category.category_name = data.get("category_name",category.category_name)

    db.session.commit()

    return jsonify({
        "message": "category updated successfully",
        "category_id": category.category_id
    }), 200

@category_bp.route("/category/delete/<int:category_id>", methods=["DELETE"])
@role_required("admin")
def delete_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return {"message":"category not found"}
    
    db.session.delete(category)
    db.session.commit()

    return jsonify({
        "message": "category deleted successfully",
        "category_id": category.category_id
    }), 200

@category_bp.route("/category/<int:category_id>/subcategories", methods=["GET"])
def get_subcategories(category_id):
    category = Category.query.get(category_id)
    if not category:
        return {"message":"category not found"}
    
    subcategories = category.subcategories
    result = []
    for subcategory in subcategories:
        result.append({
            "category_id": subcategory.category_id,
            "category_name": subcategory.category_name
        })
    
    return jsonify(result), 200