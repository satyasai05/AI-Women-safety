from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.contact import EmergencyContact


contacts_bp = Blueprint("contacts", __name__, url_prefix="/api/contacts")


@contacts_bp.route("", methods=["POST"])
@jwt_required()
def create_contact():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()

    if not name or not phone:
        return jsonify({"message": "Name and phone are required."}), 400

    contact = EmergencyContact(user_id=user_id, name=name, phone=phone)
    db.session.add(contact)
    db.session.commit()

    return jsonify({"message": "Contact created successfully.", "contact": contact.to_dict()}), 201


@contacts_bp.route("", methods=["GET"])
@jwt_required()
def get_contacts():
    user_id = get_jwt_identity()
    contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
    return jsonify({"contacts": [contact.to_dict() for contact in contacts]}), 200


@contacts_bp.route("/<int:contact_id>", methods=["PUT"])
@jwt_required()
def update_contact(contact_id):
    user_id = get_jwt_identity()
    contact = EmergencyContact.query.filter_by(id=contact_id, user_id=user_id).first()
    if not contact:
        return jsonify({"message": "Contact not found."}), 404

    data = request.get_json() or {}
    contact.name = data.get("name", contact.name).strip()
    contact.phone = data.get("phone", contact.phone).strip()
    db.session.commit()

    return jsonify({"message": "Contact updated successfully.", "contact": contact.to_dict()}), 200


@contacts_bp.route("/<int:contact_id>", methods=["DELETE"])
@jwt_required()
def delete_contact(contact_id):
    user_id = get_jwt_identity()
    contact = EmergencyContact.query.filter_by(id=contact_id, user_id=user_id).first()
    if not contact:
        return jsonify({"message": "Contact not found."}), 404

    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Contact deleted successfully."}), 200
