import time
import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Event
from app.agents.llm_factory import call_gemini_llm

DOC_TYPES = [
    "Proposal",
    "Permission Letter",
    "Sponsorship Proposal",
    "Budget Draft",
    "Meeting Agenda",
    "Event Report",
    "Post-event Summary"
]

DOC_SYSTEM_PROMPT = """
You are the Documentation Agent of BranchFlow. You specialize in generating formal, highly professional documentation for college organizations, IEEE Student Branches, ACM chapters, and university clubs.

Output clean, well-formatted Markdown with proper headings (#, ##, ###), bold highlights, tables, and bullet points.
Include realistic placeholders like [Date], [Principal Name], [Signatures] where appropriate.
Do not wrap in JSON; output the raw markdown document directly.
"""

def generate_document_content(
    doc_type: str,
    event_details: Dict[str, Any],
    additional_notes: Optional[str] = "",
    target_audience: Optional[str] = "College Administration"
) -> str:
    """
    Generates a formal document in Markdown.
    """
    event_title = event_details.get("title", "Student Technical Event")
    budget = event_details.get("budget", 20000)
    participants = event_details.get("expected_participants", 100)
    venue = event_details.get("venue", "Campus Main Auditorium")
    duration = event_details.get("duration_days", 1)
    
    prompt = f"""
Generate a professional {doc_type} for the following college event:

- Event Title: {event_title}
- Event Type: {event_details.get('event_type', 'Workshop')}
- Estimated Budget: ₹{budget:,.2f}
- Expected Participants: {participants}
- Venue: {venue}
- Duration: {duration} day(s)
- Target Audience/Recipient: {target_audience}
- Additional Organizer Notes: {additional_notes or "None provided"}

The document should be exhaustive, formal, ready for print/export, and specifically tailored for a collegiate student organization.
"""
    raw_markdown = call_gemini_llm(
        prompt=prompt,
        system_instruction=DOC_SYSTEM_PROMPT,
        json_mode=False
    )
    
    # Clean fences if LLM wrapped in ```markdown
    cleaned = raw_markdown.strip()
    if cleaned.startswith("```markdown"):
        cleaned = cleaned[11:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
        
    return cleaned.strip()

def generate_doc_heuristic(doc_type: str, event_details: Dict[str, Any], notes: str) -> str:
    """
    Fallback high-fidelity templates for each doc type when running offline/demo.
    """
    title = event_details.get("title", "Campus Tech Symposium")
    budget = event_details.get("budget", 20000)
    participants = event_details.get("expected_participants", 100)
    venue = event_details.get("venue", "College Auditorium & Labs")
    duration = event_details.get("duration_days", 1)

    if doc_type == "Permission Letter":
        return f"""# Institutional Permission Letter

**Date:** [Date]  
**To:** The Principal / Dean of Academic Affairs  
**From:** The Student Executive Committee, IEEE Student Branch  
**Subject:** Formal Permission Request to Conduct **{title}**  

Respected Sir/Madam,

We write to you on behalf of the student organization to seek formal sanction for organizing our upcoming event, **"{title}"**, planned for **{duration} day(s)**.

### 1. Key Objectives
- Expose students to cutting-edge technological advancements and peer-to-peer collaborative problem solving.
- Provide practical hands-on experience to approximately **{participants} registered students**.
- Strengthen the institutional research and technical reputation in regional collegiate forums.

### 2. Infrastructure & Venue Requisition
We request your approval for the reservation of the following college premises:
- **Primary Venue:** {venue}
- **Computing Resources:** High-speed internet access and audiovisual projection equipment.
- **Timing:** 09:00 AM to 05:30 PM.

### 3. Duty Leave (OD) Request
We also request on-duty attendance leave for the core volunteer team (10 students) who will be managing on-ground logistics.

We assure the administration that campus discipline and property will be safeguarded with utmost responsibility.

Thanking you.

Yours sincerely,  
**Organizing Secretary**  
IEEE Student Branch
"""
    elif doc_type == "Sponsorship Proposal":
        return f"""# Corporate Sponsorship & Industry Partnership Deck

## Event: {title}
**Organized by:** Student Branch Technical Council  
**Expected Footfall:** {participants}+ Ambitious Engineering Students & Developers  
**Target Date:** Upcoming Academic Term | **Venue:** {venue}  

---

### Executive Pitch
**{title}** connects industry leaders with top-tier student engineers, programmers, and designers. Sponsoring this event grants your company direct visibility among the most active future software and hardware innovators.

### Partnership Tiers

| Deliverables | Title Sponsor (₹50,000) | Associate Partner (₹25,000) | Event Supporter (₹10,000) |
|---|:---:|:---:|:---:|
| **Naming Rights ("Presented By")** | ✅ | ❌ | ❌ |
| **Keynote / Tech Talk (30 Mins)** | ✅ | 15 Mins Slot | ❌ |
| **Booth / Mentorship Space** | 2 Premium Booths | 1 Booth | ❌ |
| **Direct Access to Resumes** | Top 100% | Top 50% | Finalists Only |
| **Logo on Badges, Swag & Banners** | Large Size | Medium Size | Small Size |
| **Social Media Mentions (5,000+ Reach)** | 5 Dedicated Posts | 2 Dedicated Posts | 1 Group Post |

### Budget Allocation (Projected Expenditure: ₹{budget:,.2f})
- Technical Infrastructure & Swag: 40%
- Refreshments & Hospitality: 35%
- Winner Prizes & Citations: 25%

**Contact our Sponsorship Desk:** `sponsorship@zenith.edu` | Phone: `+91 98765 43211`
"""
    elif doc_type == "Budget Draft":
        half_budget = budget * 0.4
        quarter_budget = budget * 0.25
        refresh_budget = budget * 0.2
        buffer_budget = budget * 0.15
        return f"""# Financial Budget Draft & Cost Estimation

### Event: {title}
**Target Headcount:** {participants} attendees | **Venue:** {venue}  
**Total Sanctioned Budget:** ₹{budget:,.2f}  

---

### Itemized Expenditure Breakdown

| Category | Description | Unit Cost (₹) | Quantity | Total Cost (₹) |
|---|---|---|---|---|
| **Technical & Lab Setup** | Lab power strips, server cloud credits, printing ID tags | ₹{half_budget * 0.4:,.0f} | 1 Lot | ₹{half_budget * 0.4:,.0f} |
| **Audio-Visual & Stage** | Cordless mics, stage banner (12x8 ft), podium backdrop | ₹{half_budget * 0.6:,.0f} | 1 Set | ₹{half_budget * 0.6:,.0f} |
| **Hospitality & Catering** | Working lunch, bottled water, morning/evening tea & snacks | ₹{refresh_budget / max(1, participants):,.0f} | {participants} Pax | ₹{refresh_budget:,.0f} |
| **Prizes & Mementos** | Mementos for guest speakers, trophies, framed certificates | ₹{quarter_budget * 0.7:,.0f} | 1 Lot | ₹{quarter_budget * 0.7:,.0f} |
| **Participant Kits** | Branded notepads, pens, promotional sticker packs | ₹{quarter_budget * 0.3:,.0f} | {participants} Sets | ₹{quarter_budget * 0.3:,.0f} |
| **Contingency Fund** | Emergency medical kit, spare HDMI cables, last-minute runs | ₹{buffer_budget:,.0f} | 1 Lot | ₹{buffer_budget:,.0f} |

### Grand Total: ₹{budget:,.2f}

**Projected Funding Sources:**
- College Activity Fund Grant: ₹{budget * 0.4:,.2f}
- External Corporate Sponsorship: ₹{budget * 0.5:,.2f}
- Registration Entry Fees (Token): ₹{budget * 0.1:,.2f}

*Prepared by Treasurer & Finance Lead. Verified by Lead Organizer.*
"""
    elif doc_type == "Meeting Agenda":
        return f"""# Organizing Committee All-Hands Meeting Agenda

**Meeting Title:** Pre-Event Operational Alignment – {title}  
**Date & Time:** Friday, 04:30 PM – 05:45 PM  
**Venue:** Conference Room A / Google Meet  
**Chairperson:** Lead Student Organizer  
**Attendees:** Team Leads (Technical, Logistics, PR, Hospitality, Sponsorship)  

---

### Order of Business

1. **04:30 PM - 04:35 PM: Welcome & Roll Call**
   - Verification of all core lead presences.

2. **04:35 PM - 04:50 PM: Milestone Progress Review**
   - Venue clearances and Dean permission status.
   - Lab workstation readiness and network stress testing.

3. **04:50 PM - 05:10 PM: Budget & Vendor Procurement Sync**
   - Status of catering quotes and banner printing.
   - Review of sponsor funds deposited to student treasury.

4. **05:10 PM - 05:30 PM: Volunteer Shift Assignments & Risk Mitigation**
   - Check volunteer workload to prevent overburdening active members.
   - Walkie-talkie and emergency protocol briefing.

5. **05:30 PM - 05:45 PM: Open Floor Q&A and Action Items Confirmation**
   - Recording assigned tasks into BranchFlow.

**Next Sync:** T-minus 48 Hours Before Event Launch.
"""
    elif doc_type == "Post-event Summary" or doc_type == "Event Report":
        return f"""# Comprehensive Post-Event Summary & Impact Report

**Event Name:** {title}  
**Organized By:** IEEE Student Branch  
**Venue:** {venue}  
**Turnout:** {participants} Registered Delegates  

---

### 1. Executive Synopsis
The event **"{title}"** concluded with tremendous success. Spanning {duration} day(s), participants engaged in interactive technical sessions, mentored breakout exercises, and prototype presentations.

### 2. Quantitative Outcomes
- **Total Registrations:** {participants + 24}
- **Actual Attendance:** {participants} ({int(participants/(participants+24)*100)}% attendance rate)
- **Projects / Solutions Submitted:** 42 Completed Submissions
- **Budget Compliance:** Expended ₹{budget * 0.94:,.2f} of the sanctioned ₹{budget:,.2f} (Surplus: ₹{budget * 0.06:,.2f})

### 3. Key Achievements & Highlights
- High student satisfaction score: 4.8 / 5.0 based on 85 submitted survey responses.
- Active media coverage on college social media channels reaching 4,500+ impressions.
- Zero logistical downtime reported during live coding sessions.

### 4. Recommendations for Future Editions
- Pre-install development environments on lab machines 48 hours in advance to save on-day setup time.
- Expand registration capacity by booking an auxiliary seminar hall.

*Report compiled for institutional records and NAAC/NBA technical activities compliance.*
"""
    else: # Default Proposal
        return f"""# Official Event Proposal: {title}

**Presented To:** The Academic Dean & Faculty Council  
**Submitted By:** BranchFlow Organizing Committee  
**Target Duration:** {duration} Day(s) | **Expected Footfall:** {participants} Students  
**Proposed Budget:** ₹{budget:,.2f}  

---

## 1. Project Background
In alignment with our student branch mission to foster practical engineering competencies, we propose **{title}**. This program bridges the gap between academic curricula and contemporary industry practices.

## 2. Key Tracks & Curriculum
- Industry keynote on emerging engineering trends.
- Interactive workshop breakout pods with verified technical mentors.
- Collaborative hack/capstone build sprint.

## 3. Venue & Resource Requirements
- Main Campus Auditorium ({venue}) with projector and wireless microphones.
- Wi-Fi whitelist for attendee laptop MAC addresses.
- Basic hospitality arrangements for visiting speakers.

## 4. Expected Impact
Students will graduate from the session with tangible portfolio assets, GitHub repositories, and verified IEEE certificates of completion.

Submitted for formal institutional sanction.
"""

