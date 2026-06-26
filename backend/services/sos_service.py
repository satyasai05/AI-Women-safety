from datetime import datetime


def build_sos_payload(latitude, longitude, message, contacts):
    timestamp = datetime.utcnow().isoformat() + "Z"
    return {
        "timestamp": timestamp,
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "message": message,
        "contacts": contacts,
        "alert": f"SOS alert generated at {timestamp}",
        "instructions": "Please contact the user immediately and share the current location.",
    }
