from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models import User, IncidentReport, SOSAlert, DetectionHistory
from utils.security import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required()
def get_system_stats():
    """
    Returns platform-wide metrics, chart data, and security levels.
    """
    try:
        total_users = User.query.count()
        total_reports = IncidentReport.query.count()
        pending_reports = IncidentReport.query.filter_by(status='pending').count()
        investigating_reports = IncidentReport.query.filter_by(status='investigating').count()
        resolved_reports = IncidentReport.query.filter_by(status='resolved').count()
        
        active_sos = SOSAlert.query.filter_by(status='active').count()
        total_sos = SOSAlert.query.count()
        
        # Hazard level distribution from AI Detections
        high_hazards = DetectionHistory.query.filter_by(hazard_level='high').count()
        medium_hazards = DetectionHistory.query.filter_by(hazard_level='medium').count()
        low_hazards = DetectionHistory.query.filter_by(hazard_level='low').count()
        
        # Let's count reports by category for charts
        categories = ['harassment', 'threat', 'stalking', 'violence', 'theft', 'suspicious', 'other']
        category_counts = {}
        for cat in categories:
            category_counts[cat] = IncidentReport.query.filter_by(category=cat).count()

        return jsonify({
            "metrics": {
                "total_users": total_users,
                "total_reports": total_reports,
                "pending_reports": pending_reports,
                "investigating_reports": investigating_reports,
                "resolved_reports": resolved_reports,
                "active_sos": active_sos,
                "total_sos": total_sos,
                "ai_scans": DetectionHistory.query.count()
            },
            "hazard_distribution": {
                "high": high_hazards,
                "medium": medium_hazards,
                "low": low_hazards
            },
            "category_distribution": category_counts
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to load dashboard metrics: {str(e)}"}), 500

@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
@admin_required()
def get_all_reports():
    try:
        reports = IncidentReport.query.order_by(IncidentReport.created_at.desc()).all()
        return jsonify([r.to_dict() for r in reports]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve reports: {str(e)}"}), 500

@admin_bp.route('/reports/<int:report_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_report_status(report_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    
    if new_status not in ['pending', 'investigating', 'resolved']:
        return jsonify({"error": "Invalid status value"}), 400
        
    try:
        report = IncidentReport.query.get(report_id)
        if not report:
            return jsonify({"error": "Incident report not found"}), 404
            
        report.status = new_status
        db.session.commit()
        return jsonify({
            "message": "Report status updated successfully",
            "report": report.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update report: {str(e)}"}), 500

@admin_bp.route('/sos', methods=['GET'])
@jwt_required()
@admin_required()
def get_all_sos():
    try:
        alerts = SOSAlert.query.order_by(SOSAlert.created_at.desc()).all()
        return jsonify([a.to_dict() for a in alerts]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch SOS logs: {str(e)}"}), 500

@admin_bp.route('/sos/<int:alert_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_sos_status(alert_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    
    if new_status not in ['active', 'resolved']:
        return jsonify({"error": "Invalid status value"}), 400
        
    try:
        alert = SOSAlert.query.get(alert_id)
        if not alert:
            return jsonify({"error": "SOS alert not found"}), 404
            
        alert.status = new_status
        db.session.commit()
        return jsonify({
            "message": "SOS status updated successfully",
            "alert": alert.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update SOS: {str(e)}"}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required()
def get_all_users():
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify([u.to_dict() for u in users]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch users: {str(e)}"}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500
