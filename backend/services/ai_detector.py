import os
import numpy as np

try:
    import tensorflow as tf
except ImportError:  # pragma: no cover
    tf = None

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None


LABELS = [
    "Knife",
    "Gun",
    "Pistol",
    "Revolver",
    "Rifle",
    "Axe",
    "Sword",
]


def ensure_detection_dependencies():
    if tf is None:
        raise ImportError(
            "TensorFlow is not available in this environment. "
            "Install TensorFlow on Python 3.12 or 3.13 to enable detection."
        )
    if cv2 is None:
        raise ImportError("OpenCV is not available. Install opencv-python.")


def load_model(model_path):
    ensure_detection_dependencies()
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    return tf.keras.models.load_model(model_path)


def preprocess_image(image_path, target_size=(224, 224)):
    ensure_detection_dependencies()
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Unable to read the provided image.")

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, target_size)
    image = image.astype("float32") / 255.0
    return np.expand_dims(image, axis=0)


def assess_threat(confidence):
    if confidence >= 0.85:
        return "HIGH"
    if confidence >= 0.65:
        return "MEDIUM"
    return "LOW"


def recommend_action(threat_level):
    actions = {
        "HIGH": "Move away, call authorities immediately, and stay in a secure location.",
        "MEDIUM": "Be alert, move to a safe area, and contact emergency services if needed.",
        "LOW": "Stay cautious and report the incident if the object remains suspicious.",
    }
    return actions.get(threat_level, "Stay cautious and avoid the area.")


def draw_bounding_box(image_path, output_path, label, confidence):
    ensure_detection_dependencies()
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Unable to draw on an unreadable image.")

    height, width = image.shape[:2]
    box_width = int(width * 0.8)
    box_height = int(height * 0.25)
    x_start = int((width - box_width) / 2)
    y_start = int((height - box_height) / 2)

    cv2.rectangle(
        image,
        (x_start, y_start),
        (x_start + box_width, y_start + box_height),
        (0, 0, 255),
        2,
    )

    text = f"{label} ({confidence * 100:.1f}%)"
    cv2.putText(
        image,
        text,
        (x_start, y_start - 12),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 0, 255),
        2,
        cv2.LINE_AA,
    )

    cv2.imwrite(output_path, image)


def detect_image(image_path, model_path):
    ensure_detection_dependencies()
    model = load_model(model_path)
    tensor = preprocess_image(image_path)
    raw_prediction = model.predict(tensor)

    if raw_prediction.ndim == 2:
        raw_prediction = raw_prediction[0]
    elif raw_prediction.ndim == 1:
        raw_prediction = raw_prediction
    else:
        raise ValueError("Unexpected model output shape.")

    object_index = int(np.argmax(raw_prediction))
    confidence = float(raw_prediction[object_index])
    object_name = LABELS[object_index] if object_index < len(LABELS) else "Unknown"
    threat_level = assess_threat(confidence)
    recommended_action = recommend_action(threat_level)

    output_path = os.path.splitext(image_path)[0] + "_annotated.jpg"
    draw_bounding_box(image_path, output_path, object_name, confidence)

    return {
        "detected_object": object_name,
        "confidence": round(confidence * 100, 2),
        "threat_level": threat_level,
        "recommended_action": recommended_action,
        "annotated_image_path": output_path,
    }
