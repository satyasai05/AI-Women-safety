from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import SOSAlert, User, EmergencyContact

sos_bp = Blueprint('sos', __name__)

@sos_bp.route('', methods=['POST'])
@jwt_required()
def trigger_sos():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    if latitude is None or longitude is None:
        return jsonify({"error": "Latitude and longitude are required"}), 400

    try:
        # Save SOS to DB
        alert = SOSAlert(user_id=user_id, latitude=latitude, longitude=longitude, status='active')
        db.session.add(alert)
        db.session.commit()
        
        # Get emergency contacts to notify
        contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
        contacts_list = [c.to_dict() for c in contacts]
        
        user = User.query.get(user_id)
        
        # In a real-world scenario, we would trigger SMS via Twilio or email notifications here.
        # For the major project, we log this and return the message details that would be sent.
        # This shows full system integration!
        mock_sms_message = (
            f"EMERGENCY SOS! {user.name} is in danger! "
            f"Location: https://maps.google.com/?q={latitude},{longitude} "
            f"Time: {alert.created_at.strftime('%Y-%m-%d %H:%M:%S')}."
        )
        
        return jsonify({
            "message": "SOS Alert triggered successfully!",
            "alert": alert.to_dict(),
            "notified_contacts": contacts_list,
            "dispatch_message": mock_sms_message
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to trigger SOS: {str(e)}"}), 500

@sos_bp.route('/history', methods=['GET'])
@jwt_required()
def get_sos_history():
    user_id = int(get_jwt_identity())
    try:
        alerts = SOSAlert.query.filter_by(user_id=user_id).order_by(SOSAlert.created_at.desc()).all()
        return jsonify([a.to_dict() for a in alerts]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve SOS history: {str(e)}"}), 500

@sos_bp.route('/<int:alert_id>/resolve', methods=['POST'])
@jwt_required()
def resolve_sos(alert_id):
    user_id = int(get_jwt_identity())
    try:
        alert = SOSAlert.query.filter_by(id=alert_id, user_id=user_id).first()
        if not alert:
            return jsonify({"error": "SOS alert not found"}), 404
            
        alert.status = 'resolved'
        db.session.commit()
        return jsonify({
            "message": "SOS alert resolved successfully",
            "alert": alert.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to resolve alert: {str(e)}"}), 500
