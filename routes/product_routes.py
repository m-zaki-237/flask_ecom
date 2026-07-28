from flask import Blueprint, jsonify, request
from database import db
from models.product import Product
from models.category import Category
from middlewares.auth import role_required
from middlewares.audit_log import log_action
from schemas.product_schema import ProductCreateSchema
from utils.cloudinary import upload_image

product_bp = Blueprint("product_routes", __name__)
product_schema = ProductCreateSchema()

@product_bp.route("/product", methods=["GET"])
def get_products():
    page = request.args.get('page',1,type=int)
    limit = request.args.get('limit',10,type=int)

    paginated = Product.query.paginate(page=page, per_page=limit, error_out=False)

    result = []
    for product in paginated.items:
        result.append({
            "product_id": product.product_id,
            "image_url": product.image_url,
            "product_name": product.product_name,
            "price": product.price,
            "stock": product.stock,
            "category_id": product.category_id
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
        "price": product.price,
        "stock": product.stock,
        "category_id" : product.category_id
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
        image_url= image,
        product_name=data["product_name"],
        price=float(data["price"]),
        stock=int(data["stock"]),
        category_id=int(data["category_id"])
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
        return {"message": "product not found!"}, 404

    data = request.json

    product.image_url = data.get("image_url", product.image_url)
    product.product_name = data.get("product_name", product.product_name)
    product.price = data.get("price", product.price)
    product.stock = data.get("stock", product.stock)
    product.category_id = data.get("category_id", product.category_id)

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
        return {"message": "product not found!"}, 404

    db.session.delete(product)
    db.session.commit()

    log_action("products", product_id, "DELETE", f"Product {product_id} deleted by admin")
    
    return jsonify({
        "message": "product deleted successfully",
        "product_id": product.product_id
    }), 200