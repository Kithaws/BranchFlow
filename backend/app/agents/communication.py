import time
from typing import Dict, Any, Optional
from app.agents.llm_factory import call_gemini_llm

COMM_SYSTEM_PROMPT = """
You are the Communication Agent of BranchFlow. You specialize in generating high-conversion, beautifully formatted messages for college student organizations (IEEE, ACM, cultural & technical fests).

You adapt your writing strictly according to the requested Channel and Tone:
- Tone 'professional': Formal, polished, articulate, respectful. Excellent for faculty circulars, corporate sponsors, and official press releases.
- Tone 'friendly': Warm, welcoming, community-centric, clear, encouraging. Perfect for club members and general student body.
- Tone 'casual': High-energy, punchy, emoji-rich, exciting, Gen-Z friendly. Perfect for Instagram captions, WhatsApp blast reminders, and Discord server announcements.

Channel Formatting:
- WhatsApp: Use *bold*, _italics_, bullet emojis, clean line breaks.
- Email: Include Subject line, Salutation, Body paragraphs, Call-to-action button text, and Sign-off.
- Instagram: Engaging first-line hook, bullet highlights, Call-to-action ("link in bio"), and 10-15 relevant hashtags.
- Discord: Use **bold**, bullet points, channel tags (#announcements), @everyone / @here notice, and excitement.
- LinkedIn: Professional networking angle, industry impact, tagging organizers, learning takeaways, hashtags.

Output ONLY the final ready-to-send message text. Do not wrap in commentary.
"""

def generate_communication_copy(
    topic: str,
    channel: str,
    tone: str,
    recipient_group: str,
    event_details: Dict[str, Any],
    additional_notes: Optional[str] = ""
) -> str:
    """
    Generates channel-optimized communication copy.
    """
    event_title = event_details.get("title", "Campus Student Event")
    date = event_details.get("start_date", "Upcoming Weekend")
    venue = event_details.get("venue", "College Auditorium")
    
    prompt = f"""
Generate an engaging {channel} communication message for the following:

- Event: {event_title}
- Topic / Purpose: {topic}
- Target Recipient Group: {recipient_group}
- Tone: {tone}
- Channel: {channel}
- Event Date: {date}
- Venue: {venue}
- Additional Details / Special Links: {additional_notes or "Register at official club portal."}

Create the complete, ready-to-broadcast message now.
"""
    raw_text = call_gemini_llm(
        prompt=prompt,
        system_instruction=COMM_SYSTEM_PROMPT,
        json_mode=False
    )
    
    return raw_text.strip()
