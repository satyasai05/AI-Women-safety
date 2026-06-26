import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models.incident import IncidentReport


incident_bp = Blueprint("incident", __name__, url_prefix="/api/incidents")


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]


@incident_bp.route("", methods=["POST"])
@jwt_required()
def create_incident():
    user_id = get_jwt_identity()
    description = request.form.get("description", "").strip()
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")

    if not description:
        return jsonify({"message": "Description is required."}), 400

    image_path = None
    if "image" in request.files:
        image = request.files["image"]
        if image.filename:
            if not allowed_file(image.filename):
                return jsonify({"message": "Invalid image format."}), 400
            filename = secure_filename(image.filename)
            image_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
            image.save(image_path)

    incident = IncidentReport(
        user_id=user_id,
        description=description,
        image_path=image_path,
        latitude=float(latitude) if latitude else None,
        longitude=float(longitude) if longitude else None,
    )
    db.session.add(incident)
    db.session.commit()

    return jsonify({"message": "Incident reported successfully.", "incident": incident.to_dict()}), 201


@incident_bp.route("", methods=["GET"])
@jwt_required()
def get_incidents():
    user_id = get_jwt_identity()
    incidents = IncidentReport.query.filter_by(user_id=user_id).order_by(IncidentReport.created_at.desc()).all()
    return jsonify({"incidents": [incident.to_dict() for incident in incidents]}), 200


@incident_bp.route("/<int:incident_id>", methods=["DELETE"])
@jwt_required()
def delete_incident(incident_id):
    user_id = get_jwt_identity()
    incident = IncidentReport.query.filter_by(id=incident_id, user_id=user_id).first()
    if not incident:
        return jsonify({"message": "Incident not found."}), 404

    db.session.delete(incident)
    db.session.commit()
    return jsonify({"message": "Incident deleted successfully."}), 200
