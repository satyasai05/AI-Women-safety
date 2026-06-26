from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User


settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")


@settings_bp.route("", methods=["GET"])
@jwt_required()
def get_settings():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    settings = {
        "username": user.username,
        "email": user.email,
    }
    return jsonify({"settings": settings}), 200


@settings_bp.route("", methods=["PUT"])
@jwt_required()
def update_settings():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    data = request.get_json() or {}
    user.username = data.get("username", user.username).strip()
    user.email = data.get("email", user.email).strip().lower()
    db.session.commit()

    return jsonify({"message": "Settings updated successfully.", "settings": user.to_dict()}), 200
