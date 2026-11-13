import os
import json
import re
from typing import Dict, Any, Optional
from app.config import settings

# Global in-memory override for runtime settings change without server restart
RUNTIME_CONFIG = {
    "gemini_api_key": settings.GEMINI_API_KEY,
    "gemini_model": settings.GEMINI_MODEL
}

def get_active_gemini_key() -> str:
    key = RUNTIME_CONFIG.get("gemini_api_key") or os.getenv("GEMINI_API_KEY", "")
    return key.strip()

def is_gemini_active() -> bool:
    key = get_active_gemini_key()
    return bool(key and not key.startswith("YOUR_") and len(key) > 10)

def call_gemini_llm(prompt: str, system_instruction: Optional[str] = None, json_mode: bool = False) -> str:
    """
    Calls Gemini API via google.genai or google.generativeai if key is present; 
    otherwise falls back to intelligent heuristic simulator.
    """
    key = get_active_gemini_key()
    if is_gemini_active():
        # Try modern google.genai first
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=key)
            model_name = RUNTIME_CONFIG.get("gemini_model") or "gemini-1.5-flash"
            
            config = types.GenerateContentConfig()
            if system_instruction:
                config.system_instruction = system_instruction
            if json_mode:
                config.response_mime_type = "application/json"
                
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config
            )
            if response and response.text:
                return response.text
        except Exception as e_new:
            # Try legacy google.generativeai
            try:
                import google.generativeai as legacy_genai
                legacy_genai.configure(api_key=key)
                model_name = RUNTIME_CONFIG.get("gemini_model") or "gemini-1.5-flash"
                generation_config = {}
                if json_mode:
                    generation_config["response_mime_type"] = "application/json"
                
                model = legacy_genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction,
                    generation_config=generation_config
                )
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text
            except Exception as e_legacy:
                print(f"[Gemini API Failed: {e_new} / {e_legacy}] Falling back to heuristic engine.")

    # Intelligent Heuristic Fallback
    return generate_heuristic_response(prompt, system_instruction, json_mode)


def generate_heuristic_response(prompt: str, system_instruction: Optional[str] = None, json_mode: bool = False) -> str:
    """
    Heuristic analyzer that provides realistic, structured output when running without an external API key.
    """
    prompt_lower = prompt.lower()
    
    # 1. Event Planning Extraction
    if "extract" in prompt_lower or "event plan" in prompt_lower or "workshop" in prompt_lower or "hackathon" in prompt_lower:
        # Extract title
        title_match = re.search(r'(?:organize|plan|host)\s+(?:a|an)?\s*([a-zA-Z0-9\s\-]+?)(?:for|with|in|at|\.|$)', prompt, re.IGNORECASE)
        extracted_title = title_match.group(1).strip().title() if title_match else "Campus Innovation Summit"
        if len(extracted_title) < 4:
            extracted_title = "Tech Innovation Workshop"
            
        # Extract participants
        participants_match = re.search(r'(\d+)\s*(?:students|participants|attendees|hackers|people)', prompt, re.IGNORECASE)
        participants = int(participants_match.group(1)) if participants_match else 100
        
        # Extract budget
        budget_match = re.search(r'(?:₹|rs\.?|inr|\$)\s*([\d,]+)', prompt, re.IGNORECASE) or re.search(r'budget\s*(?:of)?\s*(?:₹|rs\.?|inr|\$)?\s*([\d,]+)', prompt, re.IGNORECASE)
        if budget_match:
            budget = float(budget_match.group(1).replace(",", ""))
        else:
            budget = 20000.0
            
        # Extract duration
        duration = 1
        if "two-day" in prompt_lower or "2-day" in prompt_lower or "2 days" in prompt_lower or "two day" in prompt_lower:
            duration = 2
        elif "three-day" in prompt_lower or "3-day" in prompt_lower or "3 days" in prompt_lower or "36-hour" in prompt_lower or "36 hours" in prompt_lower:
            duration = 3
        elif "week" in prompt_lower:
            duration = 5
            
        # Extract volunteers
        vol_match = re.search(r'(\d+)\s*(?:volunteers|organizers|mentors|members)', prompt, re.IGNORECASE)
        target_volunteers = int(vol_match.group(1)) if vol_match else 10

        event_type = "Workshop"
        if "hackathon" in prompt_lower:
            event_type = "Hackathon"
        elif "conference" in prompt_lower or "symposium" in prompt_lower:
            event_type = "Conference"
        elif "seminar" in prompt_lower or "talk" in prompt_lower or "webinar" in prompt_lower:
            event_type = "Seminar"
        elif "fest" in prompt_lower or "cultural" in prompt_lower:
            event_type = "Cultural Fest"

        result = {
            "title": extracted_title,
            "event_type": event_type,
            "description": f"Comprehensive {duration}-day {event_type.lower()} designed for {participants} participants, focusing on hands-on practical skills and peer collaboration.",
            "duration_days": duration,
            "expected_participants": participants,
            "budget": budget,
            "target_volunteers": target_volunteers,
            "venue": "Campus Main Auditorium & Advanced Computing Labs",
            "teams": [
                {"name": "Technical Instruction & Lab Operations", "lead": "TBD", "headcount": max(2, target_volunteers // 3), "focus": "Setup environments, software dependencies, and lab mentorship."},
                {"name": "Logistics & Stage Management", "lead": "TBD", "headcount": max(2, target_volunteers // 3), "focus": "Auditorium booking, seating arrangement, PA system, and attendee kits."},
                {"name": "Publicity, PR & Registration", "lead": "TBD", "headcount": max(2, target_volunteers // 4), "focus": "Promotional banners, social media marketing, and check-in desks."},
                {"name": "Hospitality & Sponsorship Liaison", "lead": "TBD", "headcount": max(2, target_volunteers // 4), "focus": "Refreshments, speaker accommodation, and sponsor welcome."}
            ],
            "schedule": [
                {"time": "Day 1 - 09:00 AM", "title": "Check-in & Registration Desk", "team": "Publicity & Registration", "details": "Issue attendee badges, welcome kits, and Wi-Fi credentials."},
                {"time": "Day 1 - 10:00 AM", "title": "Inaugural Ceremony & Keynote Address", "team": "Logistics & Stage", "details": "Address by Chief Guest and Faculty Advisor with lighting of lamp."},
                {"time": "Day 1 - 11:30 AM", "title": "Session 1: Core Architecture & Foundations", "team": "Technical Instruction", "details": "Interactive conceptual lecture with live code demonstrations."},
                {"time": "Day 1 - 01:00 PM", "title": "Networking Lunch & Refreshments", "team": "Hospitality", "details": "Buffet lunch for participants and invited dignitaries."},
                {"time": "Day 1 - 02:00 PM", "title": "Session 2: Hands-on Lab Implementation", "team": "Technical Instruction", "details": "Guided lab exercises with 1-on-1 mentor support."},
                {"time": f"Day {duration} - 03:00 PM", "title": "Project Showcase & Peer Evaluation", "team": "Technical Instruction", "details": "Participant demonstrations judged on innovation and execution."},
                {"time": f"Day {duration} - 04:30 PM", "title": "Valedictory & Certificate Distribution", "team": "Logistics & Stage", "details": "Presentation of participation certificates and closing remarks."}
            ],
            "tasks": [
                {"title": "Book Auditorium and Computing Lab Workstations", "category": "Logistics", "priority": "Urgent", "estimated_hours": 3.0, "required_skills": ["Venue Logistics", "Event Operations"]},
                {"title": "Create Promotional Posters & Social Media Copy", "category": "PR & Media", "priority": "High", "estimated_hours": 4.0, "required_skills": ["Graphic Design", "Social Media PR", "Canva"]},
                {"title": "Finalize Speaker Itinerary and Honorarium Approval", "category": "Logistics", "priority": "High", "estimated_hours": 2.5, "required_skills": ["Corporate Outreach", "Hospitality"]},
                {"title": "Configure High-Speed Network & Lab Machine Images", "category": "Technical", "priority": "Urgent", "estimated_hours": 5.0, "required_skills": ["Python", "Technical Workshops", "Web Development"]},
                {"title": "Procure Participant ID Badges & Welcome Stationery", "category": "Logistics", "priority": "Medium", "estimated_hours": 3.0, "required_skills": ["Event Operations", "Logistics"]},
                {"title": "Coordinate Catering for Lunch and Morning/Evening Tea", "category": "Hospitality", "priority": "High", "estimated_hours": 3.5, "required_skills": ["Hospitality", "Event Operations"]},
                {"title": "Setup Registration Desk & QR Attendance Scanning", "category": "Technical", "priority": "Medium", "estimated_hours": 2.0, "required_skills": ["Registration Desk", "QR Scanning"]}
            ],
            "checklist": [
                {"category": "Approvals", "item": "Formal approval letter signed by Principal/HOD", "completed": False},
                {"category": "Budget", "item": "Advance grant requisition submitted to Accounts department", "completed": False},
                {"category": "Venue", "item": "Inspect audio-visual systems and projector in Auditorium", "completed": False},
                {"category": "Materials", "item": "Print feedback forms and certificates of completion", "completed": False}
            ]
        }
        return json.dumps(result, indent=2) if json_mode else str(result)
        
    return json.dumps({"status": "completed", "data": "Analysis processed successfully."}, indent=2)
