import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Import core structures
from config import Config
from database import db

# Import Blueprints
from routes.auth import auth_bp
from routes.sos import sos_bp
from routes.detection import detection_bp
from routes.routes_map import routes_map_bp
from routes.chat import chat_bp
from routes.incidents import incidents_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize CORS (Enable frontend access)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database & Upload Directories
    db.init_app(app)
    Config.init_app(app)

    # Initialize JWT Manager
    jwt = JWTManager(app)


    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(sos_bp, url_prefix='/api/sos')
    app.register_blueprint(detection_bp, url_prefix='/api/detection')
    app.register_blueprint(routes_map_bp, url_prefix='/api/map')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(incidents_bp, url_prefix='/api/incidents')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Serve uploads directory
    @app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Welcome and Healthcheck endpoint
    @app.route('/')
    def index():
        return jsonify({
            "status": "online",
            "name": "AI Women Safety Assistant API",
            "version": "1.0.0",
            "database": "connected"
        }), 200

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error occurred"}), 500

    # Auto create database tables within context
    with app.app_context():
        try:
            db.create_all()
            print("Database schemas checked/created successfully.")
        except Exception as e:
            print(f"Error checking/creating database schemas: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
