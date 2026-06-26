from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.chatbot_service import get_chatbot_response


chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/api/chat")


@chatbot_bp.route("", methods=["POST"])
@jwt_required()
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"message": "Please provide a message."}), 400

    response = get_chatbot_response(message)
    return jsonify({"response": response}), 200
