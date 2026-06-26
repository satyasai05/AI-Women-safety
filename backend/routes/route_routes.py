from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.maps_service import generate_safe_route


route_bp = Blueprint("routes", __name__, url_prefix="/api/routes")


@route_bp.route("/safe-route", methods=["POST"])
@jwt_required()
def safe_route():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    source = data.get("source")
    destination = data.get("destination")

    if not source or not destination:
        return jsonify({"message": "Source and destination are required."}), 400

    result = generate_safe_route(source, destination)
    return jsonify(result), 200
