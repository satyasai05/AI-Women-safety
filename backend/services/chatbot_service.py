def get_chatbot_response(message: str) -> str:
    normalized = message.strip().lower()

    if any(keyword in normalized for keyword in ["help", "emergency", "danger", "attack", "follow"]):
        return (
            "If you feel unsafe, move to a well-lit public area, keep your phone ready, "
            "and call local authorities immediately. Share your location with trusted contacts."
        )

    if any(keyword in normalized for keyword in ["safe route", "route", "navigate", "direction"]):
        return (
            "For safe route guidance, choose routes with good lighting, active foot traffic, "
            "and nearby security or public services. Avoid isolated roads and shortcuts."
        )

    if any(keyword in normalized for keyword in ["report", "incident", "file", "complaint"]):
        return (
            "Use the incident report module to document the event, attach any evidence, "
            "and notify authorities if the threat is ongoing."
        )

    if any(keyword in normalized for keyword in ["contacts", "sos", "alert", "emergency contact"]):
        return (
            "Add trusted family or friends to your emergency contacts. In an emergency, use the SOS button "
            "to notify them with your location."
        )

    return (
        "Stay alert, trust your instincts, and prioritize your safety. If you need immediate help, contact local authorities or use the SOS feature."
    )
