from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from database import db
from models import User, EmergencyContact

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    role = data.get('role', 'user') # Allow passing 'admin' for project testing setup

    if not name or not email or not password or not phone:
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User with this email already exists"}), 400

    try:
        # Check if this is the first user, make them admin for easy configuration
        if User.query.count() == 0:
            role = 'admin'

        new_user = User(name=name, email=email, phone=phone, role=role)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        # Generate access token
        access_token = create_access_token(
            identity=str(new_user.id), 
            additional_claims={"role": new_user.role}
        )

        return jsonify({
            "message": "User registered successfully",
            "token": access_token,
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(
        identity=str(user.id), 
        additional_claims={"role": user.role}
    )

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == 'GET':
        return jsonify(user.to_dict()), 200

    elif request.method == 'PUT':
        data = request.get_json() or {}
        user.name = data.get('name', user.name)
        user.phone = data.get('phone', user.phone)
        
        # Avoid changing email if it conflicts
        email = data.get('email')
        if email and email != user.email:
            if User.query.filter_by(email=email).first():
                return jsonify({"error": "Email is already taken"}), 400
            user.email = email

        # Password update
        password = data.get('password')
        if password:
            user.set_password(password)

        try:
            db.session.commit()
            return jsonify({
                "message": "Profile updated successfully",
                "user": user.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500

# Emergency Contacts CRUD
@auth_bp.route('/contacts', methods=['GET', 'POST'])
@jwt_required()
def contacts():
    user_id = int(get_jwt_identity())
    
    if request.method == 'GET':
        user_contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
        return jsonify([c.to_dict() for c in user_contacts]), 200

    elif request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name')
        phone = data.get('phone')
        relationship = data.get('relationship')

        if not name or not phone or not relationship:
            return jsonify({"error": "Name, phone, and relationship are required"}), 400

        try:
            new_contact = EmergencyContact(
                user_id=user_id,
                name=name,
                phone=phone,
                relationship=relationship
            )
            db.session.add(new_contact)
            db.session.commit()
            return jsonify(new_contact.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Failed to add contact: {str(e)}"}), 500

@auth_bp.route('/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    user_id = int(get_jwt_identity())
    contact = EmergencyContact.query.filter_by(id=contact_id, user_id=user_id).first()
    
    if not contact:
        return jsonify({"error": "Emergency contact not found"}), 404

    try:
        db.session.delete(contact)
        db.session.commit()
        return jsonify({"message": "Emergency contact deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete contact: {str(e)}"}), 500
