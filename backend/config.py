import os
from datetime import timedelta

class Config:
    # Secret keys
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-dev-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-super-secret-dev-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # Database configuration (auto fallback to SQLite if MySQL URL is missing)
    # Railway/Render usually provides DATABASE_URL or MYSQL_URL
    db_url = os.environ.get('DATABASE_URL') or os.environ.get('MYSQL_URL')
    
    # Adjust for postgresql:// vs postgres:// if needed, but here we prioritize MySQL
    # If db_url starts with mysql://, we make sure it uses pymysql
    if db_url and db_url.startswith('mysql://'):
        # SQLAlchemy requires mysql+pymysql://
        db_url = db_url.replace('mysql://', 'mysql+pymysql://')
    
    SQLALCHEMY_DATABASE_URI = db_url or 'sqlite:///safety_assistant.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Directories
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    
    # AI Keys
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

    # Initialize folders
    @staticmethod
    def init_app(app):
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(os.path.join(Config.UPLOAD_FOLDER, 'incidents'), exist_ok=True)
        os.makedirs(os.path.join(Config.UPLOAD_FOLDER, 'detections'), exist_ok=True)
