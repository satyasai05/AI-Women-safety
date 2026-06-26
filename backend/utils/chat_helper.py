import requests
import json
from config import Config

# Rules-based backup safety advisor content for offline/fallback mode
FALLBACK_ANSWERS = {
    "harassment": (
        "If you are facing harassment:\n"
        "1. Document everything: Note the date, time, location, and details of the incident.\n"
        "2. Make your boundaries clear: Say 'No' firmly and walk away if safe.\n"
        "3. Use our 'Incident Report' module to file a formal report with details and images.\n"
        "4. Tell trusted friends or family, and contact the national women helpline (1091 in India) immediately."
    ),
    "stalking": (
        "If you suspect you are being followed or stalked:\n"
        "1. Do not head home directly. Head to a busy public area (mall, police station, hospital).\n"
        "2. Open our 'Safe Route' map immediately to locate the nearest police station or safe zone.\n"
        "3. Trigger the SOS Alert in the dashboard if you feel in immediate danger. This notifies your emergency contacts and records your coordinates.\n"
        "4. Call the police emergency line (e.g., 112 / 100)."
    ),
    "self defense": (
        "Basic Self-Defense Tips:\n"
        "1. Target vulnerable spots: If attacked, aim for the eyes, nose, throat, or groin.\n"
        "2. Keep safety tools accessible: Carry pepper spray, a high-decibel safety whistle, or tactical keychains in your hand (not buried in a bag).\n"
        "3. Trust your gut: If a situation feels wrong, remove yourself from it immediately.\n"
        "4. Keep your phone charged and open to the SOS dashboard."
    ),
    "legal rights": (
        "Important Legal Rights for Women:\n"
        "1. Zero FIR: A woman can file a complaint at any police station, regardless of where the incident occurred. The police must register it.\n"
        "2. Right to Privacy: A woman's statement during investigation must be recorded in private or in front of a female officer.\n"
        "3. Protection from arrest: A woman cannot be arrested after sunset and before sunrise except under exceptional circumstances with magistrate permission.\n"
        "4. Free Legal Aid: Women are entitled to free legal services from the Legal Services Authority."
    ),
    "default": (
        "As your AI Women Safety Assistant, I'm here to help. You can ask me about:\n"
        "- How to handle stalking or street harassment\n"
        "- Basic self-defense techniques and safety tools\n"
        "- Women's legal rights and filing complaints (Zero FIR)\n"
        "- Emergency helpline numbers and safety protocols\n\n"
        "If you are in immediate danger, please press the **SOS** button on the dashboard or call emergency services (112) immediately!"
    )
}

def ask_safety_assistant(prompt_text):
    """
    Sends the question to Gemini API if a key exists.
    Otherwise, returns a professional safety guideline from local resources.
    """
    api_key = Config.GEMINI_API_KEY
    
    # If API key is available, attempt Gemini request
    if api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            headers = {'Content-Type': 'application/json'}
            system_instruction = (
                "You are an empathetic, knowledgeable AI Women's Safety and Legal Assistant. "
                "Provide clear, actionable safety instructions, legal advice, self-defense recommendations, "
                "and resources for women. Keep responses concise, structured with bullet points, and highly professional. "
                "Do not encourage dangerous actions; prioritize getting to safety, notifying police, and using emergency tools. "
                "If the query is completely unrelated to safety, self-defense, laws, or emergency support, gently remind the user "
                "of your safety-focused scope."
            )
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction}\n\nUser Query: {prompt_text}"}
                        ]
                    }
                ]
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                answer = data['candidates'][0]['content']['parts'][0]['text']
                return answer
            else:
                print(f"Gemini API returned status code {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Error querying Gemini API: {e}")
            
    # Fallback rules-based responder
    query = prompt_text.lower()
    for key, value in FALLBACK_ANSWERS.items():
        if key in query:
            return value
            
    return FALLBACK_ANSWERS["default"]
