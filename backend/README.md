# AI Women Safety Assistant Backend

## Overview

This backend provides a secure REST API for the AI Women Safety Assistant app. It includes authentication, user profile management, emergency contacts, AI detection, SOS alerts, safe route guidance, nearby services, chatbot responses, incident reporting, and settings management.

## Structure

- `app.py` - Flask application factory and blueprint registration.
- `config.py` - Configuration values and environment loading.
- `extensions.py` - Shared Flask extensions.
- `models/` - SQLAlchemy database models.
- `routes/` - Flask API blueprints.
- `services/` - AI, SOS, map, and chatbot service logic.
- `uploads/` - Stored user-uploaded files.
- `models_ai/` - TensorFlow model files.
- `database/` - SQLite database file.

## Installation

1. Create a Python 3.12 virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Copy the environment example:

```powershell
copy .env.example .env
```

4. Update `.env` values as needed.

5. Ensure directories exist:

```powershell
python -c "from app import create_app; create_app()"
```

## Running

```powershell
python app.py
```

The API will be available at `http://127.0.0.1:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### User
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `PUT /api/user/change-password`

### Emergency Contacts
- `POST /api/contacts`
- `GET /api/contacts`
- `PUT /api/contacts/<id>`
- `DELETE /api/contacts/<id>`

### AI Detection
- `POST /api/detection/upload`
- `POST /api/detection/webcam`
- `GET /api/detection/history`

### SOS
- `POST /api/sos/send`

### Safe Route
- `POST /api/routes/safe-route`

### Chatbot
- `POST /api/chat`

### Incident Reporting
- `POST /api/incidents`
- `GET /api/incidents`
- `DELETE /api/incidents/<id>`

### Settings
- `GET /api/settings`
- `PUT /api/settings`

## Notes

- Model file should be placed at `models_ai/harmful_object_model.h5`.
- Uploaded files are stored in `uploads/`.
- The safe route and nearby services modules return placeholder data and should be integrated with a real maps provider in production.
