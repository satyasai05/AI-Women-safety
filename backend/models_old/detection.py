from datetime import datetime
from extensions import db


class DetectionHistory(db.Model):
    __tablename__ = "detection_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    object_name = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    threat_level = db.Column(db.String(30), nullable=False)
    image_path = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "object_name": self.object_name,
            "confidence": self.confidence,
            "threat_level": self.threat_level,
            "image_path": self.image_path,
            "created_at": self.created_at.isoformat(),
        }
