import datetime
from sqlalchemy.orm import Session
from app.models import (
    Organization, User, Event, Volunteer, Task, 
    Document, Communication, AgentExecutionLog
)

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(Organization).first():
        print("Database already contains data. Skipping seed.")
        return

    print("Seeding database with realistic student organization data...")

    # 1. Organization
    org = Organization(
        name="IEEE Student Branch - Zenith Institute of Technology",
        type="IEEE Student Branch",
        description="Premier student technical society dedicated to advancing technology for humanity through hands-on hackathons, workshops, and symposiums."
    )
    db.add(org)
    db.flush()

    # 2. Users
    user1 = User(
        org_id=org.id,
        name="Aarav Sharma",
        email="aarav.lead@zenith.edu",
        role="Lead Organizer / Branch Chair",
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav"
    )
    user2 = User(
        org_id=org.id,
        name="Dr. Priya Nair",
        email="priya.nair@zenith.edu",
        role="Branch Counselor & Faculty Advisor",
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
    )
    db.add_all([user1, user2])
    db.flush()

    # 3. Volunteers
    volunteers_data = [
        {
            "name": "Rohan Mehta",
            "email": "rohan.m@zenith.edu",
            "phone": "+91 98765 43210",
            "department": "Computer Science & Engineering",
            "year": "3rd Year",
            "skills": ["Python", "Machine Learning", "Technical Workshops", "Git", "Cloud Mentoring"],
            "availability_status": "available",
            "max_tasks": 4,
            "current_task_count": 2,
            "rating": 4.9,
            "notes": "Excellent workshop conductor, handles technical speaker tracks."
        },
        {
            "name": "Ananya Iyer",
            "email": "ananya.i@zenith.edu",
            "phone": "+91 98765 43211",
            "department": "Electronics & Communication",
            "year": "2nd Year",
            "skills": ["Sponsorship", "Corporate Outreach", "Budgeting", "Public Speaking", "Pitch Decks"],
            "availability_status": "available",
            "max_tasks": 3,
            "current_task_count": 1,
            "rating": 4.8,
            "notes": "Secured major title sponsors in previous tech fests."
        },
        {
            "name": "Karthik Verma",
            "email": "karthik.v@zenith.edu",
            "phone": "+91 98765 43212",
            "department": "Information Technology",
            "year": "3rd Year",
            "skills": ["Graphic Design", "UI/UX", "Canva", "Figma", "Social Media PR", "Video Editing"],
            "availability_status": "available",
            "max_tasks": 4,
            "current_task_count": 3,
            "rating": 4.7,
            "notes": "Fast poster turnaround, manages Instagram campaigns."
        },
        {
            "name": "Sneha Kulkarni",
            "email": "sneha.k@zenith.edu",
            "phone": "+91 98765 43213",
            "department": "Computer Science & Engineering",
            "year": "4th Year",
            "skills": ["Event Operations", "Venue Logistics", "Stage Management", "Hospitality", "Security"],
            "availability_status": "busy",
            "max_tasks": 4,
            "current_task_count": 4,
            "rating": 4.9,
            "notes": "High workload warning: Currently assigned to 4 critical logistics tasks."
        },
        {
            "name": "Devendra Patel",
            "email": "dev.p@zenith.edu",
            "phone": "+91 98765 43214",
            "department": "Mechanical Engineering",
            "year": "2nd Year",
            "skills": ["Audio/Visual", "Stage Setup", "Photography", "Hardware Logistics", "Electricals"],
            "availability_status": "available",
            "max_tasks": 3,
            "current_task_count": 1,
            "rating": 4.6,
            "notes": "Reliable AV controller and hardware lab equipment manager."
        },
        {
            "name": "Tanya Das",
            "email": "tanya.d@zenith.edu",
            "phone": "+91 98765 43215",
            "department": "Artificial Intelligence & Data Science",
            "year": "3rd Year",
            "skills": ["Content Writing", "Documentation", "Press Releases", "Email Marketing", "Permission Drafts"],
            "availability_status": "available",
            "max_tasks": 3,
            "current_task_count": 1,
            "rating": 4.8,
            "notes": "Proficient in drafting formal college proposals and report writeups."
        },
        {
            "name": "Vikramaditya Rao",
            "email": "vikram.r@zenith.edu",
            "phone": "+91 98765 43216",
            "department": "Computer Science",
            "year": "1st Year",
            "skills": ["Registration Desk", "Attendee Support", "Crowd Control", "ID Badging"],
            "availability_status": "available",
            "max_tasks": 2,
            "current_task_count": 0,
            "rating": 4.4,
            "notes": "Enthusiastic first-year recruit, great for on-ground assistance."
        },
        {
            "name": "Meera Nambiar",
            "email": "meera.n@zenith.edu",
            "phone": "+91 98765 43217",
            "department": "Electrical & Electronics",
            "year": "3rd Year",
            "skills": ["Web Development", "Registration Portals", "QR Scanning", "Tech Support", "React"],
            "availability_status": "available",
            "max_tasks": 4,
            "current_task_count": 2,
            "rating": 4.9,
            "notes": "Built the QR check-in portal for hackathons."
        }
    ]

    vol_objs = []
    for vd in volunteers_data:
        vol = Volunteer(org_id=org.id, **vd)
        db.add(vol)
        vol_objs.append(vol)
    db.flush()

    # 4. Events
    now = datetime.datetime.utcnow()
    event1 = Event(
        org_id=org.id,
        title="HackZenith 2025: 36-Hour National Hackathon",
        description="Flagship inter-college hackathon focusing on AI for Sustainability, FinTech, and Smart Healthcare with 50+ mentor teams and ₹1,50,000 prize pool.",
        event_type="Hackathon",
        status="active",
        start_date=(now + datetime.timedelta(days=14)).strftime("%Y-%m-%d"),
        end_date=(now + datetime.timedelta(days=16)).strftime("%Y-%m-%d"),
        duration_days=3,
        budget=85000.0,
        expected_participants=250,
        venue="Auditorium & Turing Innovation Lab, Zenith Campus",
        raw_prompt="Organize a 36-hour national hackathon for 250 participants with 30 volunteers and budget of ₹85,000",
        schedule=[
            {"time": "Day 1, 08:30 AM", "title": "Check-in & Badge Distribution", "team": "Registration", "details": "Verify student IDs & provide welcome kits"},
            {"time": "Day 1, 10:00 AM", "title": "Opening Ceremony & Problem Statement Reveal", "team": "Stage & AV", "details": "Keynote by Chief Guest from Tech Partner"},
            {"time": "Day 1, 11:30 AM", "title": "Hacking Commences", "team": "Technical", "details": "Mentors assigned to lab clusters"},
            {"time": "Day 1, 08:00 PM", "title": "Round 1 Mentorship & Code Review", "team": "Technical", "details": "Evaluation on Git commits and architecture"},
            {"time": "Day 2, 02:00 AM", "title": "Midnight Energy Break & Gaming Jam", "team": "Hospitality", "details": "Coffee, snacks, and casual mini-games"},
            {"time": "Day 2, 11:00 AM", "title": "Final Submission & Grand Jury Pitches", "team": "Evaluation", "details": "Top 10 teams pitch on main stage"},
            {"time": "Day 2, 04:00 PM", "title": "Valedictory & Prize Distribution", "team": "Operations", "details": "Trophies and certificates handed out"}
        ],
        teams=[
            {"name": "Technical & Lab Team", "lead": "Rohan Mehta", "headcount": 6, "focus": "Wi-Fi setup, cloud credits, server infrastructure, jury dashboard"},
            {"name": "Logistics & Venue Team", "lead": "Sneha Kulkarni", "headcount": 8, "focus": "Power outlets, stage management, tables, lab access"},
            {"name": "Sponsorship & PR Team", "lead": "Ananya Iyer", "headcount": 5, "focus": "Sponsor booths, social media live coverage, sponsor branding"},
            {"name": "Hospitality & Food Team", "lead": "Devendra Patel", "headcount": 6, "focus": "Meals, energy drinks, midnight coffee, first aid kit"}
        ],
        checklist=[
            {"category": "Venue Approval", "item": "Dean clearance letter signed", "completed": True},
            {"category": "Infrastructure", "item": "Campus 1 Gbps high-speed Wi-Fi network test", "completed": True},
            {"category": "Sponsorship", "item": "Title sponsor contract signing & logo deliverables", "completed": True},
            {"category": "Hardware", "item": "Procure 40 extension power strips for hacker desks", "completed": False},
            {"category": "Food", "item": "Finalize catering contract for 4 meals + midnight snacks", "completed": False},
            {"category": "Certification", "item": "Print IEEE participant certificates & design digital badges", "completed": False}
        ]
    )

    event2 = Event(
        org_id=org.id,
        title="AI Agents & LLM Masterclass Workshop",
        description="Hands-on 2-day technical workshop on building autonomous agents using LangChain, LangGraph, and Gemini 1.5 Flash.",
        event_type="Workshop",
        status="planning",
        start_date=(now + datetime.timedelta(days=7)).strftime("%Y-%m-%d"),
        end_date=(now + datetime.timedelta(days=8)).strftime("%Y-%m-%d"),
        duration_days=2,
        budget=15000.0,
        expected_participants=100,
        venue="Seminar Hall 3 & Computing Center Lab 4",
        raw_prompt="Organize a two-day AI workshop for 100 students with 10 volunteers and a budget of ₹15,000",
        schedule=[
            {"time": "Day 1, 09:30 AM", "title": "Fundamentals of LLMs & Prompt Engineering", "team": "Technical", "details": "Live coding with Gemini API"},
            {"time": "Day 1, 02:00 PM", "title": "Building RAG Systems with Vector Databases", "team": "Technical", "details": "ChromaDB & embeddings lab"},
            {"time": "Day 2, 10:00 AM", "title": "Agentic Workflows with LangGraph", "team": "Technical", "details": "State machines, tool calling, and human loops"},
            {"time": "Day 2, 03:00 PM", "title": "Mini Hack Project Presentation & Awards", "team": "Evaluation", "details": "Certificates distribution"}
        ],
        teams=[
            {"name": "Technical Instruction Team", "lead": "Rohan Mehta", "headcount": 4, "focus": "GitHub repository, API keys distribution, lab troubleshooting"},
            {"name": "Media & Registration", "lead": "Karthik Verma", "headcount": 3, "focus": "Google Form check-ins, poster campaign, Instagram live"}
        ],
        checklist=[
            {"category": "Lab Booking", "item": "Reserve Lab 4 with 80 GPU-enabled workstations", "completed": True},
            {"category": "Speaker", "item": "Confirm visiting industry AI specialist itinerary", "completed": True},
            {"category": "Kits", "item": "Print stickers and cheatsheets for prompt engineering", "completed": False}
        ]
    )

    event3 = Event(
        org_id=org.id,
        title="RoboSprint & Autonomous Drone Expo",
        description="Annual robotics competition featuring line-following bots, obstacle rovers, and autonomous indoor drone flight trials.",
        event_type="Exhibition",
        status="completed",
        start_date=(now - datetime.timedelta(days=20)).strftime("%Y-%m-%d"),
        end_date=(now - datetime.timedelta(days=19)).strftime("%Y-%m-%d"),
        duration_days=2,
        budget=35000.0,
        expected_participants=300,
        venue="Campus Central Arena",
        raw_prompt="Organize a 2-day robotics expo for 300 participants with ₹35,000 budget",
        schedule=[],
        teams=[],
        checklist=[]
    )

    db.add_all([event1, event2, event3])
    db.flush()

    # 5. Tasks
    tasks_data = [
        # HackZenith tasks
        {
            "event_id": event1.id,
            "assigned_volunteer_id": vol_objs[0].id, # Rohan
            "title": "Deploy Hackathon Evaluation Portal on Cloud",
            "description": "Configure GitHub OAuth and team submission portal with judge grading rubric.",
            "category": "Technical",
            "priority": "High",
            "status": "in_progress",
            "due_date": (now + datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
            "estimated_hours": 8.0
        },
        {
            "event_id": event1.id,
            "assigned_volunteer_id": vol_objs[1].id, # Ananya
            "title": "Follow up with Platinum Cloud Sponsor for Swag Kits",
            "description": "Confirm dispatch of 250 t-shirts, stickers, and winner cash vouchers.",
            "category": "Sponsorship",
            "priority": "High",
            "status": "completed",
            "due_date": (now - datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
            "estimated_hours": 3.0
        },
        {
            "event_id": event1.id,
            "assigned_volunteer_id": vol_objs[2].id, # Karthik
            "title": "Design Instagram Countdown Story Series & Banners",
            "description": "Create 5 carousel slides highlighting problem statements and jury profiles.",
            "category": "PR & Media",
            "priority": "Medium",
            "status": "in_progress",
            "due_date": (now + datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
            "estimated_hours": 4.5
        },
        {
            "event_id": event1.id,
            "assigned_volunteer_id": vol_objs[3].id, # Sneha
            "title": "Procure 40 Heavy-Duty Power Strips for Lab Desks",
            "description": "Rent spike busters and test electrical load safety with campus electrician.",
            "category": "Logistics",
            "priority": "Urgent",
            "status": "pending",
            "due_date": (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d"), # OVERDUE!
            "estimated_hours": 5.0
        },
        {
            "event_id": event1.id,
            "assigned_volunteer_id": vol_objs[3].id, # Sneha
            "title": "Finalize Catering Contract for 250 Hackers",
            "description": "Arrange breakfast, lunch, midnight coffee, and hydration stations for Day 1 & 2.",
            "category": "Hospitality",
            "priority": "Urgent",
            "status": "pending",
            "due_date": (now + datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
            "estimated_hours": 6.0
        },
        {
            "event_id": event1.id,
            "assigned_volunteer_id": vol_objs[4].id, # Devendra
            "title": "Setup Dual Projectors and Audio Stage Systems",
            "description": "Coordinate wireless handheld mics, podium setup, and live YouTube streaming rig.",
            "category": "Technical",
            "priority": "Medium",
            "status": "pending",
            "due_date": (now + datetime.timedelta(days=6)).strftime("%Y-%m-%d"),
            "estimated_hours": 4.0
        },
        # AI Workshop tasks
        {
            "event_id": event2.id,
            "assigned_volunteer_id": vol_objs[0].id, # Rohan
            "title": "Prepare Colab Notebooks & Gemini API Keys for Lab",
            "description": "Fork starter code repo, verify rate limits, and preload exercise datasets.",
            "category": "Technical",
            "priority": "High",
            "status": "in_progress",
            "due_date": (now + datetime.timedelta(days=3)).strftime("%Y-%m-%d"),
            "estimated_hours": 5.0
        },
        {
            "event_id": event2.id,
            "assigned_volunteer_id": vol_objs[5].id, # Tanya
            "title": "Draft Official Circular & Faculty Permission Letter",
            "description": "Formal submission to Academic Dean requesting duty leave for organizers.",
            "category": "Documentation",
            "priority": "High",
            "status": "completed",
            "due_date": (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            "estimated_hours": 2.5
        },
        {
            "event_id": event2.id,
            "assigned_volunteer_id": vol_objs[7].id, # Meera
            "title": "Configure QR Check-in System on Registration Desk",
            "description": "Test QR scanning on mobile camera and sync check-ins with attendance spreadsheet.",
            "category": "Technical",
            "priority": "Medium",
            "status": "pending",
            "due_date": (now + datetime.timedelta(days=4)).strftime("%Y-%m-%d"),
            "estimated_hours": 3.0
        }
    ]

    for td in tasks_data:
        task = Task(**td)
        db.add(task)
    db.flush()

    # 6. Documents
    doc1 = Document(
        event_id=event1.id,
        title="Official Event Proposal - HackZenith 2025",
        doc_type="Proposal",
        content="""# Official Event Proposal: HackZenith 2025

**Presented to:** The Principal & Dean of Student Affairs, Zenith Institute of Technology  
**Organized by:** IEEE Student Branch (Branch Code: STB12345)  
**Date of Event:** 14th - 16th November 2025 (36 Hours Continuous)  
**Estimated Footfall:** 250+ Competitors (60 Selected Teams)  

---

## 1. Executive Summary
HackZenith 2025 is an intensive 36-hour national hackathon designed to spur technological innovation among undergraduate engineering students. The event provides a collaborative sandbox where students solve real-world problems spanning:
- Generative AI & Autonomous Agents
- FinTech & Decentralized Identity
- Smart Healthcare & Assistive Tech
- Green Tech & Energy Grid Optimization

## 2. Objective & Outcomes
- Enhance hands-on industry-grade engineering skills.
- Foster industry-academia partnerships with visiting corporate mentors from Google, AWS, and Microsoft.
- Position Zenith Institute as a regional center of excellence for student-led innovation.

## 3. Resource Requirements
1. **Venue:** Central Auditorium for Inauguration/Valedictory; Turing Computer Lab 1 & 2 for 36-hour hacking.
2. **Connectivity:** Dedicated high-speed 1 Gbps lease line with redundant backup.
3. **Power:** Uninterrupted power supply with diesel generator backup.
4. **Security & Medical:** 24x7 security staff on duty and college dispensary first-aid standby.

## 4. Proposed Budget Summary
- Total Estimated Expenditure: **₹85,000**
- Title & Associate Sponsorships Pledged: **₹1,00,000**
- Net Surplus Projected: **₹15,000** (To be remitted to IEEE Student Branch Fund)

Submitted respectfully for your kind approval.
""",
        status="approved",
        version=1,
        metadata_info={"author": "Aarav Sharma", "reviewed_by": "Dr. Priya Nair"}
    )

    doc2 = Document(
        event_id=event1.id,
        title="Sponsorship Pitch Deck - HackZenith 2025",
        doc_type="Sponsorship Proposal",
        content="""# Corporate Sponsorship Brochure: HackZenith 2025

### Connect with 250+ of the Brightest Engineering Minds in the Country

### Why Sponsor?
- **Direct Talent Pipeline:** Access resumes of 60 top engineering teams; conduct on-spot interviews for summer internships.
- **Brand Exposure:** Prominent branding across all event posters, certificates, Discord servers (2,000+ members), and live streaming.
- **API & Product Evangelism:** Provide custom tracks and API credits to see your developer tools in action.

### Tier Packages

| Tier | Investment | Deliverables |
|---|---|---|
| **Title Sponsor** | ₹50,000 | Named Title ("HackZenith powered by [Brand]"), Keynote slot, 5 mentors on jury, exclusive branding |
| **Gold Partner** | ₹25,000 | Custom Prize Track, booth space in innovation lounge, logo on all attendee swag |
| **Silver Partner** | ₹10,000 | Logo on banner, social media shoutouts, access to resume database |

Contact: `sponsorship@ieee-zenith.edu` | Phone: `+91 98765 43211`
""",
        status="reviewed",
        version=1
    )

    doc3 = Document(
        event_id=event2.id,
        title="Institutional Permission & Lab Allocation Letter",
        doc_type="Permission Letter",
        content="""# Formal Request for Computer Laboratory Allocation

**To:** The Head of Department, Computer Science & Engineering  
**Through:** Dr. Priya Nair, IEEE Branch Counselor  
**From:** Aarav Sharma, Branch Chairperson  
**Date:** Current Academic Term  

**Subject:** Request for Allocation of Lab 4 & Academic Duty Leave for AI Workshop

Respected Madam/Sir,

The IEEE Student Branch is conducting a 2-Day National Hands-On Workshop on **"AI Agents & LLM Masterclass"** for 100 students.

We kindly request you to grant permission for:
1. Utilization of **Computing Center Lab 4 (80 Workstations)** on the scheduled dates from 09:00 AM to 05:00 PM.
2. Granting **On-Duty (OD) Attendance** to the 8 registered student volunteer organizers for the duration of the event.
3. Guest Wi-Fi access credentials for visiting resource speakers.

We assure that the computer lab equipment and decorum will be maintained strictly.

Thanking you in anticipation.

Yours faithfully,  
**Aarav Sharma**  
Chairperson, IEEE Student Branch
""",
        status="draft",
        version=1
    )

    db.add_all([doc1, doc2, doc3])
    db.flush()

    # 7. Communications
    comm1 = Communication(
        event_id=event1.id,
        title="HackZenith 2025 Registration Blast",
        channel="WhatsApp",
        tone="friendly",
        recipient_group="All Students & Coding Groups",
        content="""🚀 *HACKZENITH 2025 IS HERE!* 🚀

Are you ready to build the next big thing? 💡

IEEE Zenith Student Branch invites all tech innovators to **HackZenith 2025** – our flagship 36-hour national hackathon!

🗓️ *Dates:* 14th - 16th November 2025
📍 *Venue:* Turing Innovation Lab, Zenith Campus
🏆 *Prizes:* ₹1,50,000+ Prize Pool + Paid Internship Offers!
🍕 *Perks:* Free meals, midnight pizza, awesome swag kits, and 1-on-1 industry mentorship!

👉 *Register your squad now:* https://zenith.edu/hackzenith
⏳ *Deadline:* Rolling shortlists until slots fill up!

See you on the leaderboard! 🔥
#HackZenith #IEEEYouth #BuildTheFuture""",
        status="ready"
    )

    comm2 = Communication(
        event_id=event1.id,
        title="Volunteer Duty Checklist & Briefing Notice",
        channel="Discord",
        tone="professional",
        recipient_group="Volunteers",
        content="""**[URGENT] Volunteer Operational Briefing - HackZenith 2025**

Team, please note the mandatory all-hands sync schedule:
- **Meeting:** Friday at 04:30 PM in Seminar Hall 2.
- **Agenda:** 
  1. Desk shifts allocation & walkie-talkie channel setup.
  2. Emergency protocol & hospital liaison handoff.
  3. Swag kit packaging sprint (target: 250 bags).

*Note:* Check the BranchFlow task dashboard for your assigned checklist items. Ensure overdue items are updated before Friday noon.

Let's deliver our best event yet!
— Organizing Core Team""",
        status="ready"
    )

    comm3 = Communication(
        event_id=event2.id,
        title="AI Masterclass Registration Announcement",
        channel="Instagram",
        tone="casual",
        recipient_group="Attendees",
        content="""Want to build autonomous AI agents with LangGraph & Gemini? 🤖⚡

Join us for the 2-Day AI Masterclass Bootcamp!
💻 Hands-on coding
🔥 No prior agent experience needed
📜 IEEE verified certificate

Link in bio to reserve your seat! Only 100 spots available. 🚀
#AI #LangGraph #Gemini #TechWorkshop #IEEE""",
        status="draft"
    )

    db.add_all([comm1, comm2, comm3])
    db.flush()

    # 8. Agent Execution Logs (to show LangGraph trace)
    log1 = AgentExecutionLog(
        event_id=event1.id,
        agent_name="Event Planning Agent",
        action_name="generate_event_plan",
        input_data={"prompt": "Organize a 36-hour national hackathon for 250 participants with 30 volunteers and budget of ₹85,000"},
        output_data={
            "status": "completed",
            "extracted_requirements": {
                "title": "HackZenith 2025",
                "duration": "36 Hours (3 Days)",
                "participants": 250,
                "budget": 85000,
                "key_milestones": 7
            },
            "teams_suggested": 4,
            "tasks_generated": 6
        },
        status="success",
        execution_time_ms=1240
    )

    log2 = AgentExecutionLog(
        event_id=event1.id,
        agent_name="Volunteer Management Agent",
        action_name="balance_workload_and_match",
        input_data={"event_id": event1.id, "active_tasks": 6},
        output_data={
            "matched_volunteers": 5,
            "workload_imbalance_detected": True,
            "overloaded_volunteer": "Sneha Kulkarni (4 active tasks - 100% capacity)",
            "underutilized_volunteers": ["Vikramaditya Rao (0 tasks)"]
        },
        status="warning",
        execution_time_ms=860
    )

    log3 = AgentExecutionLog(
        event_id=event1.id,
        agent_name="Progress Monitoring Agent",
        action_name="audit_progress",
        input_data={"event_id": event1.id},
        output_data={
            "total_tasks": 6,
            "completed": 1,
            "in_progress": 2,
            "pending": 3,
            "overdue": 1,
            "critical_warning": "Task 'Procure 40 Heavy-Duty Power Strips' is 1 day overdue."
        },
        status="warning",
        execution_time_ms=620
    )

    db.add_all([log1, log2, log3])
    db.commit()
    print("Database seeding successfully completed!")
