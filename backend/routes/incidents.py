import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from database import db
from models import IncidentReport

incidents_bp = Blueprint('incidents', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@incidents_bp.route('/report', methods=['POST'])
@jwt_required()
def report_incident():
    user_id = int(get_jwt_identity())
    
    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')
    lat_str = request.form.get('latitude')
    lng_str = request.form.get('longitude')
    
    if not title or not description or not category:
        return jsonify({"error": "Title, description, and category are required"}), 400
        
    latitude = None
    longitude = None
    if lat_str and lng_str:
        try:
            latitude = float(lat_str)
            longitude = float(lng_str)
        except ValueError:
            pass # keep as None if invalid

    image_relative_url = None
    
    # Check if image evidence file is uploaded
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename != '':
            if allowed_file(file.filename):
                file_ext = file.filename.rsplit('.', 1)[1].lower()
                file_id = str(uuid.uuid4())
                filename = f"incident_{file_id}.{file_ext}"
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'incidents', filename)
                
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                file.save(save_path)
                image_relative_url = f"incidents/{filename}"
            else:
                return jsonify({"error": "Allowed evidence file types are png, jpg, jpeg, webp"}), 400

    try:
        new_report = IncidentReport(
            user_id=user_id,
            title=title,
            description=description,
            category=category,
            latitude=latitude,
            longitude=longitude,
            image_url=image_relative_url,
            status='pending'
        )
        db.session.add(new_report)
        db.session.commit()
        
        return jsonify({
            "message": "Incident report submitted successfully",
            "report": new_report.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to submit report: {str(e)}"}), 500

@incidents_bp.route('/my-reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    user_id = int(get_jwt_identity())
    try:
        reports = IncidentReport.query.filter_by(user_id=user_id).order_by(IncidentReport.created_at.desc()).all()
        return jsonify([r.to_dict() for r in reports]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch reports: {str(e)}"}), 500

@incidents_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = [
        {"value": "harassment", "label": "Street Harassment"},
        {"value": "threat", "label": "Verbal/Physical Threat"},
        {"value": "stalking", "label": "Stalking/Following"},
        {"value": "violence", "label": "Physical Violence/Assault"},
        {"value": "theft", "label": "Theft/Snatching"},
        {"value": "suspicious", "label": "Suspicious Activity/Person"},
        {"value": "other", "label": "Other Safety Incident"}
    ]
    return jsonify(categories), 200
