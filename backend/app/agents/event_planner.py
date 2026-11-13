import time
import json
from typing import Dict, Any, Optional
from app.agents.llm_factory import call_gemini_llm

EVENT_PLANNER_SYSTEM_PROMPT = """
You are the Event Planning Agent of BranchFlow, an AI-powered student organization management system for college clubs and IEEE student branches.
Your job is to analyze the user's natural language event description and return a rigorous, highly structured JSON event plan.

The JSON response MUST strictly follow this structure:
{
  "title": "Extracted or inferred official event title",
  "event_type": "Workshop | Hackathon | Conference | Seminar | Cultural Fest | Exhibition",
  "description": "2-3 sentences summarizing the purpose, target attendees, and key learning outcomes",
  "duration_days": 1,
  "expected_participants": 100,
  "budget": 15000.0,
  "venue": "Suggested campus venue (e.g. Auditorium, Lab 4, Seminar Hall)",
  "teams": [
    {
      "name": "Team name (e.g. Technical Instruction, Logistics & Venue, Publicity & PR, Sponsorship, Hospitality)",
      "lead": "TBD",
      "headcount": 3,
      "focus": "Key operational responsibility of this team"
    }
  ],
  "schedule": [
    {
      "time": "Day 1 - 09:30 AM",
      "title": "Session or Milestone title",
      "team": "Responsible team",
      "details": "Actionable description of the session"
    }
  ],
  "tasks": [
    {
      "title": "Actionable task name",
      "category": "Technical | Logistics | PR & Media | Sponsorship | Hospitality | Documentation",
      "priority": "Urgent | High | Medium | Low",
      "estimated_hours": 3.0,
      "required_skills": ["Skill1", "Skill2"]
    }
  ],
  "checklist": [
    {
      "category": "Approvals | Logistics | Publicity | Finance",
      "item": "Specific milestone checklist item",
      "completed": false
    }
  ]
}

Ensure all monetary values are realistic in INR (₹) or the user's currency.
Generate at least 5-7 realistic tasks and at least 4 timeline schedule entries.
Return ONLY valid JSON.
"""

def plan_event_from_prompt(prompt: str) -> Dict[str, Any]:
    """
    Executes the Event Planning Agent to produce a structured event plan.
    """
    start_time = time.time()
    user_query = f"Analyze this event request and output the structured JSON event plan:\n\n{prompt}"
    
    raw_response = call_gemini_llm(
        prompt=user_query,
        system_instruction=EVENT_PLANNER_SYSTEM_PROMPT,
        json_mode=True
    )
    
    # Clean and parse JSON
    try:
        # Strip code fences if present
        cleaned = raw_response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        plan_dict = json.loads(cleaned)
    except Exception as e:
        print(f"JSON parsing error: {e}. Raw was: {raw_response[:200]}")
        # Fallback to default heuristic structure
        from app.agents.llm_factory import generate_heuristic_response
        plan_dict = json.loads(generate_heuristic_response(prompt, json_mode=True))

    elapsed_ms = int((time.time() - start_time) * 1000)
    plan_dict["_execution_time_ms"] = elapsed_ms
    return plan_dict

