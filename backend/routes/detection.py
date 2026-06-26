import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from database import db
from models import DetectionHistory
from utils.yolo_helper import AIDetector

detection_bp = Blueprint('detection', __name__)
detector = AIDetector()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@detection_bp.route('/scan', methods=['POST'])
@jwt_required()
def scan_image():
    user_id = int(get_jwt_identity())
    
    # 1. Handle Base64 webcam capture
    if request.is_json:
        data = request.get_json() or {}
        image_base64 = data.get('image')
        if not image_base64:
            return jsonify({"error": "No image data provided"}), 400
            
        file_id = str(uuid.uuid4())
        filename = f"webcam_{file_id}.jpg"
        annotated_filename = f"annotated_webcam_{file_id}.jpg"
        
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'detections', filename)
        save_annotated_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'detections', annotated_filename)
        
        detected_objects, hazard_level = detector.scan_base64_webcam(
            image_base64, save_path, save_annotated_path
        )
        
        # Save records in DB
        import json
        history = DetectionHistory(
            user_id=user_id,
            image_url=f"detections/{filename}",
            annotated_url=f"detections/{annotated_filename}",
            detected_objects=json.dumps(detected_objects),
            hazard_level=hazard_level
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify({
            "message": "Scan completed",
            "results": history.to_dict()
        }), 201

    # 2. Handle standard multi-part form upload
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400
        
    if file and allowed_file(file.filename):
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        file_id = str(uuid.uuid4())
        filename = f"upload_{file_id}.{file_ext}"
        annotated_filename = f"annotated_upload_{file_id}.{file_ext}"
        
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'detections', filename)
        save_annotated_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'detections', annotated_filename)
        
        file.save(save_path)
        
        detected_objects, hazard_level = detector.scan_image(save_path, save_annotated_path)
        
        # Save records in DB
        import json
        history = DetectionHistory(
            user_id=user_id,
            image_url=f"detections/{filename}",
            annotated_url=f"detections/{annotated_filename}",
            detected_objects=json.dumps(detected_objects),
            hazard_level=hazard_level
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify({
            "message": "Scan completed",
            "results": history.to_dict()
        }), 201
        
    return jsonify({"error": "Allowed file types are png, jpg, jpeg, webp"}), 400

@detection_bp.route('/history', methods=['GET'])
@jwt_required()
def get_detection_history():
    user_id = int(get_jwt_identity())
    try:
        scans = DetectionHistory.query.filter_by(user_id=user_id).order_by(DetectionHistory.created_at.desc()).all()
        return jsonify([s.to_dict() for s in scans]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve scan history: {str(e)}"}), 500
