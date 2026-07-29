from flask import Blueprint, jsonify, request
from database import db
from models.product import Product
from models.category import Category
from middlewares.auth import role_required, get_current_user_id, get_current_user_role
from middlewares.audit_log import log_action
from schemas.product_schema import ProductCreateSchema
from utils.cloudinary import upload_image

product_bp = Blueprint("product_routes", __name__)
product_schema = ProductCreateSchema()

@product_bp.route("/product", methods=["GET"])
def get_products():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    category_id = request.args.get('category_id', type=int)
    search = request.args.get('search', type=str)

    query = Product.query
    if category_id:
        query = query.filter_by(category_id=category_id)
    if search:
        query = query.filter(Product.product_name.ilike(f"%{search}%"))

    paginated = query.order_by(Product.product_id.desc()).paginate(page=page, per_page=limit, error_out=False)

    result = []
    for product in paginated.items:
        result.append({
            "product_id": product.product_id,
            "image_url": product.image_url,
            "product_name": product.product_name,
            "description": product.description or "",
            "price": float(product.price) if product.price is not None else 0.0,
            "stock": product.stock,
            "category_id": product.category_id,
            "category_name": product.category.category_name if product.category else "General",
            "created_at": product.created_at.isoformat() if product.created_at else None
        })

    return jsonify({
        "products": result,
        "total" : paginated.total,
        "pages" : paginated.pages,
        "current_page" : paginated.page
    }), 200

@product_bp.route("/product/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get(product_id)

    if not product:
        return {"message": "product not found!"}, 404
    
    return jsonify({
        "product_id": product.product_id,
        "image_url": product.image_url,
        "product_name": product.product_name,
        "description": product.description or "",
        "price": float(product.price) if product.price is not None else 0.0,
        "stock": product.stock,
        "category_id": product.category_id,
        "category_name": product.category.category_name if product.category else "General",
        "seller_name": f"{product.seller.first_name} {product.seller.last_name}" if product.seller else "Official Store",
        "created_at": product.created_at.isoformat() if product.created_at else None
    }), 200

@product_bp.route("/product/create", methods=["POST"])
@role_required("admin","seller")
def create_product():
    file = request.files.get("image_url")
    if not file:
        return jsonify({"error": "image is required"}), 400

    image = upload_image(file)

    data = request.form

    errors = product_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    if not data:
        return jsonify({"message": "No data provided"}), 400

    required_fields = [
        "product_name",
        "price",
        "stock",
        "category_id"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"{field} is required"}), 400

    if float(data["price"]) < 0:
        return jsonify({"message": "Price cannot be negative"}), 400

    if int(data["stock"]) < 0:
        return jsonify({"message": "Stock cannot be negative"}), 400

    category = Category.query.get(data["category_id"])

    if not category:
        return jsonify({"message": "Invalid category"}), 400

    new_product = Product(
       image_url=image,
       product_name=data["product_name"],
       description=data.get("description", ""),
       price=float(data["price"]),
       stock=int(data["stock"]),
       category_id=int(data["category_id"]),
       seller_id=get_current_user_id()
    )

    db.session.add(new_product)
    db.session.commit()

    log_action("products", new_product.product_id, "CREATE", f"Product {new_product.product_name} created")

    return jsonify({
        "message": "Product created successfully",
        "product_id": new_product.product_id,
        "image_url": new_product.image_url
    }), 201

@product_bp.route("/product/update/<int:product_id>", methods=["PATCH"])
@role_required("admin","seller")
def update_product(product_id):
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "product not found!"}), 404

    # Allow admin to update any product, sellers can only update their own
    if get_current_user_role() != "admin" and product.seller_id != get_current_user_id():
        return jsonify({
            "message": "You cannot update another seller's product"
        }), 403

    if request.is_json:
        data = request.json or {}
    else:
        data = request.form or {}

    file = request.files.get("image_url")
    if file:
        image = upload_image(file)
        product.image_url = image

    if "product_name" in data:
        product.product_name = data["product_name"]
    if "description" in data:
        product.description = data["description"]
    if "price" in data:
        product.price = float(data["price"])
    if "stock" in data:
        product.stock = int(data["stock"])
    if "category_id" in data:
        product.category_id = int(data["category_id"])

    db.session.commit()

    log_action("products", product_id, "UPDATE", f"Product {product.product_name} updated")

    return jsonify({
        "message": "product updated successfully",
        "product_id": product.product_id
    }), 200

@product_bp.route("/product/delete/<int:product_id>", methods=["DELETE"])
@role_required("admin","seller")
def delete_product(product_id):

    product = Product.query.get(product_id)

    if not product:
        return jsonify({"message": "product not found!"}), 404

    if product.order_items:
        return jsonify({
            "message": "Cannot delete product because it exists in orders"
        }), 400

    if product.reviews:
        return jsonify({
            "message": "Cannot delete product because it has reviews"
        }), 400

    db.session.delete(product)
    db.session.commit()

    log_action(
        "products",
        product_id,
        "DELETE",
        f"Product {product_id} deleted"
    )

    return jsonify({
        "message": "product deleted successfully",
        "product_id": product_id
    }), 200

@product_bp.route("/seller/products", methods=["GET"])
@role_required("seller")
def get_seller_products():
    seller_id = get_current_user_id()
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    paginated = Product.query.filter_by(
        seller_id=seller_id
    ).order_by(Product.product_id.desc()).paginate(
        page=page,
        per_page=limit,
        error_out=False
    )
    products = []

    for product in paginated.items:
        products.append({
            "product_id": product.product_id,
            "image_url": product.image_url,
            "product_name": product.product_name,
            "description": product.description or "",
            "price": float(product.price) if product.price is not None else 0.0,
            "stock": product.stock,
            "category_id": product.category_id,
            "category_name": product.category.category_name if product.category else "General"
        })

    return jsonify({
        "products": products,
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": paginated.page
    }), 200