from flask import Blueprint, jsonify, request
from database import db
from models.review import Review
from middlewares.auth import jwt_required, role_required
from middlewares.audit_log import log_action

review_bp = Blueprint('review', __name__)

@review_bp.route('/reviews', methods=['POST'])
@jwt_required()
def create_review():
    data = request.get_json()
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    rating = data.get('rating')
    review_text = data.get('review')

    if not user_id or not product_id:
        return jsonify({'error': 'User ID and Product ID are required'}), 400

    new_review = Review(user_id=user_id, product_id=product_id, rating=rating, review=review_text)
    db.session.add(new_review)
    db.session.commit()

    log_action("reviews", new_review.review_id, "CREATE", f"Review {new_review.review_id} created by user {user_id} for product {product_id}")

    return jsonify({'message': 'Review created successfully', 'review_id': new_review.review_id}), 201

@review_bp.route('/reviews/<int:review_id>', methods=['GET'])
@jwt_required()
def get_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    review_data = {
        'review_id': review.review_id,
        'user_id': review.user_id,
        'product_id': review.product_id,
        'rating': review.rating,
        'review': review.review
    }

    return jsonify(review_data), 200

@review_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@role_required("admin")
def delete_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    db.session.delete(review)
    db.session.commit()

    log_action("reviews", review_id, "DELETE", f"Review {review_id} deleted by admin")
    
    return jsonify({'message': 'Review deleted successfully'}), 200

@review_bp.route('/reviews/product/<int:product_id>', methods=['GET'])
def get_reviews_by_product(product_id):
    reviews = Review.query.filter_by(product_id=product_id).all()
    if not reviews:
        return jsonify({'error': 'No reviews found for this product'}), 404

    reviews_data = [{
        'review_id': review.review_id,
        'user_id': review.user_id,
        'product_id': review.product_id,
        'rating': review.rating,
        'review': review.review
    } for review in reviews]

    return jsonify(reviews_data), 200

@review_bp.route('/reviews/update/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_review(user_id):
    data = request.get_json()
    product_id = data.get('product_id')
    rating = data.get('rating')
    review_text = data.get('review')

    if not product_id:
        return jsonify({'error': 'Product ID is required'}), 400

    review = Review.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not review:
        return jsonify({'error': 'Review not found for this user and product'}), 404

    if rating is not None:
        review.rating = rating
    if review_text is not None:
        review.review = review_text

    db.session.commit()

    log_action("reviews", review.review_id, "UPDATE", f"Review {review.review_id} updated")

    return jsonify({'message': 'Review updated successfully'}), 200

@review_bp.route('/reviews/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_reviews_by_user(user_id):
    reviews = Review.query.filter_by(user_id=user_id).all()
    if not reviews:
        return jsonify({'error': 'No reviews found for this user'}), 404

    reviews_data = [{
        'review_id': review.review_id,
        'user_id': review.user_id,
        'product_id': review.product_id,
        'rating': review.rating,
        'review': review.review
    } for review in reviews]

    return jsonify(reviews_data), 200

@review_bp.route('/reviews/product/<int:product_id>/average', methods=['GET'])
def get_average_rating(product_id):
    reviews = Review.query.filter_by(product_id=product_id).all()
    if not reviews:
        return jsonify({'error': 'No reviews found for this product'}), 404

    average_rating = sum(review.rating for review in reviews if review.rating is not None) / len(reviews)

    return jsonify({'product_id': product_id, 'average_rating': average_rating}), 200

@review_bp.route('/reviews/product/<int:product_id>/count', methods=['GET'])
def get_review_count(product_id):
    review_count = Review.query.filter_by(product_id=product_id).count()
    return jsonify({'product_id': product_id, 'review_count': review_count}), 200
