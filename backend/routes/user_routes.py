from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models.user import User


user_bp = Blueprint("user", __name__, url_prefix="/api/user")


@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200


@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}
    username = data.get("username", user.username).strip()
    email = data.get("email", user.email).strip().lower()

    if User.query.filter(User.id != user.id, (User.username == username) | (User.email == email)).first():
        return jsonify({"message": "Username or email already in use."}), 409

    user.username = username
    user.email = email
    db.session.commit()

    return jsonify({"message": "Profile updated successfully.", "user": user.to_dict()}), 200


@user_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")

    if not old_password or not new_password:
        return jsonify({"message": "Old password and new password are required."}), 400

    if not check_password_hash(user.password_hash, old_password):
        return jsonify({"message": "Old password is incorrect."}), 401

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password changed successfully."}), 200
