def generate_safe_route(source, destination):
    return {
        "source": source,
        "destination": destination,
        "distance": "8.2 km",
        "time": "18 mins",
        "safety_score": 89,
        "route": [
            {"step": 1, "instruction": f"Start from {source} and head north."},
            {"step": 2, "instruction": "Turn right and continue on the main road."},
            {"step": 3, "instruction": "Follow the pedestrian route near the police station."},
            {"step": 4, "instruction": f"Arrive at {destination} safely."},
        ],
    }
