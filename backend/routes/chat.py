from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models import ChatHistory
from utils.chat_helper import ask_safety_assistant

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/ask', methods=['POST'])
@jwt_required()
def ask_assistant():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    message = data.get('message')
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
        
    try:
        # Get response (Gemini API or Offline rules-based)
        response_text = ask_safety_assistant(message)
        
        # Save to database
        chat_log = ChatHistory(user_id=user_id, message=message, response=response_text)
        db.session.add(chat_log)
        db.session.commit()
        
        return jsonify(chat_log.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to get chat response: {str(e)}"}), 500

@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    user_id = int(get_jwt_identity())
    try:
        history = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.created_at.asc()).all()
        return jsonify([h.to_dict() for h in history]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve chat history: {str(e)}"}), 500
