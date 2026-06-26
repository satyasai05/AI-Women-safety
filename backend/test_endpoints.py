import unittest
import json
import os
import sys

# Add backend directory to sys path so we can run from anywhere
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import app
from database import db
from models import User

class BackendTestCase(unittest.TestCase):
    def setUp(self):
        # Override database to temporary local testing SQLite DB
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test_safety.db'
        app.config['JWT_SECRET_KEY'] = 'test-secret-key'
        
        self.client = app.test_client()
        
        with app.app_context():
            db.create_all()
            
            # Create a default test user
            self.test_user = User(
                name="Safety Test User",
                email="testuser@safety.com",
                phone="1234567890",
                role="user"
            )
            self.test_user.set_password("password123")
            db.session.add(self.test_user)
            
            # Create an admin user
            self.admin_user = User(
                name="Safety Test Admin",
                email="admin@safety.com",
                phone="0987654321",
                role="admin"
            )
            self.admin_user.set_password("admin123")
            db.session.add(self.admin_user)
            
            db.session.commit()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
        # Clean up database file
        if os.path.exists("test_safety.db"):
            os.remove("test_safety.db")

    def test_health_check(self):
        """Test API welcome/healthcheck endpoint"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get('status'), 'online')

    def test_user_registration(self):
        """Test registration endpoint"""
        payload = {
            "name": "Jane Doe",
            "email": "jane@safety.com",
            "password": "password456",
            "phone": "9876543210"
        }
        response = self.client.post('/api/auth/register', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "jane@safety.com")

    def test_user_login(self):
        """Test login endpoint and JWT issue"""
        payload = {
            "email": "testuser@safety.com",
            "password": "password123"
        }
        response = self.client.post('/api/auth/login',
                                    data=json.dumps(payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("token", data)
        
    def test_unauthorized_route(self):
        """Test secure route returns 401 when token is missing"""
        response = self.client.get('/api/auth/profile')
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main()
