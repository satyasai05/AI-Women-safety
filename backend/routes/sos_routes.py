from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.contact import EmergencyContact
from services.sos_service import build_sos_payload


sos_bp = Blueprint("sos", __name__, url_prefix="/api/sos")


@sos_bp.route("/send", methods=["POST"])
@jwt_required()
def send_sos():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    message = data.get("message", "Emergency help needed")

    if latitude is None or longitude is None:
        return jsonify({"message": "Latitude and longitude are required."}), 400

    contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
    payload = build_sos_payload(latitude, longitude, message, [c.to_dict() for c in contacts])

    return jsonify({
        "status": "Alert Sent",
        "contacts_notified": len(contacts),
        "payload": payload,
    }), 200
