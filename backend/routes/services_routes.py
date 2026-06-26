from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

services_bp = Blueprint("services", __name__, url_prefix="/api/services")


@services_bp.route("/nearby", methods=["GET"])
@jwt_required()
def nearby_services():
    lat = request.args.get("lat")
    lng = request.args.get("lng")

    if not lat or not lng:
        return jsonify({"message": "Latitude and longitude query parameters are required."}), 400

    return jsonify({
        "police_stations": [
            {"name": "City Police Station", "latitude": float(lat) + 0.003, "longitude": float(lng) - 0.002, "distance": "1.2 km"},
            {"name": "North Police Post", "latitude": float(lat) + 0.007, "longitude": float(lng) + 0.005, "distance": "2.5 km"},
        ],
        "hospitals": [
            {"name": "Women Care Hospital", "latitude": float(lat) - 0.004, "longitude": float(lng) + 0.006, "distance": "1.8 km"},
            {"name": "City Emergency Hospital", "latitude": float(lat) + 0.010, "longitude": float(lng) - 0.003, "distance": "3.1 km"},
        ],
        "women_help_centers": [
            {"name": "Safe Women Help Center", "latitude": float(lat) + 0.005, "longitude": float(lng) + 0.011, "distance": "2.9 km"},
            {"name": "Community Women Support Center", "latitude": float(lat) - 0.008, "longitude": float(lng) - 0.004, "distance": "4.0 km"},
        ],
    }), 200
