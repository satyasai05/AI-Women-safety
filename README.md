# GuardHer | AI Women Safety Assistant

GuardHer is a comprehensive, production-ready full-stack web application designed to ensure women's security. It integrates deep-learning computer vision (AI Threat Scan), immediate location-tagged SOS dispatch networks, safety routing overlays, AI legal/defense guidance chatbots, and an incident tracking center.

This project is built as a **College Major Project** using React (Vite) + Tailwind CSS on the frontend and Python Flask + MySQL on the backend.

---

## 🚀 Key Features

1. **Dual-State SOS Trigger:** Instantly grabs GPS coordinates, flags active distress states in the database, maps helper locations, and triggers mocked SMS dispatches.
2. **AI Threat Scanner:** Scans camera frames or uploaded images to detect hazardous items (weapons, fire, suspect crowds) with bounding box overlays.
3. **Safe Geolocation Route Planner:** Displays interactive Leaflet maps with custom search routes alongside overlays for nearby police and hospital positions.
4. **AI Safety Chatbot:** Guides users on Zero-FIR registration, self-defense tactics, and legal rights with an LLM interface (offline-fallback included).
5. **Geotagged Incident Logger:** Allows users to submit safety incident logs with descriptions, category tags, locations, and image evidence.
6. **Command Dashboard (Admin):** Gives security admins platform-wide oversight, incident status controls, and data metrics charts.

---

## 📂 Project Structure

```
AI-Women-Safety/
├── backend/
│   ├── app.py               # Main Flask server entry point
│   ├── config.py            # Global environment variable configuration
│   ├── database.py          # SQLAlchemy ORM setup
│   ├── models.py            # Database tables definitions
│   ├── requirements.txt     # Python requirements
│   ├── test_endpoints.py    # Backend test suite
│   ├── routes/              # Modular API blueprints
│   │   ├── auth.py          # Register, Login, Profile, and Emergency Contacts
│   │   ├── sos.py           # SOS alerting and resolutions
│   │   ├── detection.py     # AI threat scanning
│   │   ├── routes_map.py    # OpenStreetMap queries and nearby services fallback
│   │   ├── chat.py          # AI SafeChat guidelines responder
│   │   ├── incidents.py     # Logging incident complaints
│   │   └── admin.py         # Admin controls and database statistics
│   └── utils/
│       ├── security.py      # Admin verification decorators
│       ├── yolo_helper.py   # OpenCV object scanner
│       └── chat_helper.py   # Gemini API chatbot
└── frontend/
    ├── index.html           # Leaflet and Font assets links
    ├── package.json         # React packages
    ├── tailwind.config.js   # Tailwind themes configuration
    ├── vite.config.js       # Proxied API setup
    └── src/
        ├── App.jsx          # Route mapping
        ├── main.jsx         # DOM Mounting
        ├── index.css        # Global CSS, blur filters, and SOS animations
        ├── components/      # Reusable React components
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/           # Platform interface views
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── AIDetection.jsx
        │   ├── SafeRoute.jsx
        │   ├── AIChat.jsx
        │   ├── IncidentReport.jsx
        │   ├── Profile.jsx
        │   └── AdminDashboard.jsx
        └── utils/
            └── api.js       # Axios endpoints mapping
```

---

## 🛠️ Installation & Setup (Local)

### 1. Database Setup (MySQL)
Create a new MySQL database named `guardher_db`:
```sql
CREATE DATABASE guardher_db;
```
If MySQL is not installed, the application automatically falls back to creating a local SQLite database (`backend/instance/safety_assistant.db`) on the first run, allowing for immediate testing.

### 2. Backend Installation (Python Flask)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Define your environment variables in a `.env` file (or set them in your terminal shell):
   ```ini
   # For MySQL (Omit to fallback to local SQLite)
   DATABASE_URL=mysql+pymysql://username:password@localhost:3306/guardher_db
   
   # JWT and Security Keys
   SECRET_KEY=your_flask_secret_key
   JWT_SECRET_KEY=your_jwt_secret_key
   
   # Optional: Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key
   ```
5. Run the backend test suite to verify installation:
   ```bash
   python test_endpoints.py
   ```
6. Start the development server:
   ```bash
   python app.py
   ```
   *The server runs on `http://localhost:5000`.*

### 3. Frontend Installation (React Vite)
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
   *The app runs on `http://localhost:3000` and automatically proxies `/api` calls to the Flask backend.*

---

## 🎯 Administration Setup
- The first user registered in the system is automatically assigned the `admin` role, giving them access to the **Security Command Center** dashboard at `/admin`.
- Subsequent registrations default to the standard `user` role.

---

## ☁️ Deployment Instructions

### 1. Database (Railway MySQL)
1. Sign up on [Railway](https://railway.app/).
2. Choose **Provision MySQL**.
3. Once created, copy the connection string under **Variables** (`MYSQL_URL`).
4. Provide this string to your backend environment parameters (`DATABASE_URL`).

### 2. Backend (Render)
1. Log in to [Render](https://render.com/).
2. Create a new **Web Service** linking your repository.
3. Configure settings:
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app` (Make sure to add `gunicorn` to requirements if deploying on Render).
4. Add Environment Variables:
   - `DATABASE_URL` = *Your Railway Connection String*
   - `SECRET_KEY` = *Some random hash string*
   - `JWT_SECRET_KEY` = *Some random hash string*
   - `GEMINI_API_KEY` = *Your Gemini API Key*

### 3. Frontend (Vercel)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and import your repository.
3. Choose the **frontend** folder as the root directory.
4. Vercel automatically detects the Vite setup. Set custom environment configuration or rewrite variables to direct API paths if not using proxies.
5. Deploy.
