import os
from flask import Blueprint, request, jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models.detection import DetectionHistory
from services.ai_detector import detect_image


detection_bp = Blueprint("detection", __name__, url_prefix="/api/detection")


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]


@detection_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_detection():
    user_id = get_jwt_identity()
    if "image" not in request.files:
        return jsonify({"message": "No image part in the request."}), 400

    image = request.files["image"]
    if image.filename == "":
        return jsonify({"message": "No selected file."}), 400

    if not allowed_file(image.filename):
        return jsonify({"message": "Invalid image format."}), 400

    filename = secure_filename(image.filename)
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    image.save(save_path)

    result = detect_image(save_path, current_app.config["MODEL_PATH"])
    object_name = result["object_name"]
    confidence = result["confidence"]
    threat_level = result["threat_level"]

    detection = DetectionHistory(
        user_id=user_id,
        object_name=object_name,
        confidence=confidence,
        threat_level=threat_level,
        image_path=save_path,
    )
    db.session.add(detection)
    db.session.commit()

    return jsonify(result), 200


@detection_bp.route("/webcam", methods=["POST"])
@jwt_required()
def webcam_detection():
    user_id = get_jwt_identity()
    if "frame" not in request.files:
        return jsonify({"message": "No frame image provided."}), 400

    frame = request.files["frame"]
    if frame.filename == "":
        return jsonify({"message": "No selected frame."}), 400

    if not allowed_file(frame.filename):
        return jsonify({"message": "Invalid image format."}), 400

    filename = secure_filename(frame.filename)
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], f"webcam_{filename}")
    frame.save(save_path)

    result = detect_image(save_path, current_app.config["MODEL_PATH"])
    detection = DetectionHistory(
        user_id=user_id,
        object_name=result["object_name"],
        confidence=result["confidence"],
        threat_level=result["threat_level"],
        image_path=save_path,
    )
    db.session.add(detection)
    db.session.commit()

    return jsonify(result), 200


@detection_bp.route("/history", methods=["GET"])
@jwt_required()
def detection_history():
    user_id = get_jwt_identity()
    history = DetectionHistory.query.filter_by(user_id=user_id).order_by(DetectionHistory.created_at.desc()).all()
    return jsonify({"history": [item.to_dict() for item in history]}), 200
