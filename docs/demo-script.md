# BridgeCare — Demo Script for Judges

## The one story to tell

**Persona:** "I'm a 20-year-old student. I've been sleeping badly, feeling dizzy, anxious, and having chest tightness for 3 days. I'm away from home, on my parent's insurance, and I don't know whether to wait, use telehealth, or go to urgent care."

---

## Demo flow (5–7 minutes)

### 1. Landing page (30s)
- Show the hero: "Health feels less overwhelming from here."
- Point out: "No diagnosis. Just navigation."
- Click **Start a health check**

### 2. Onboarding (45s)
- Age: 18–24
- ZIP: your demo city
- Insurance: Parent's plan
- Language: English
- Mode: Guided
- Click **Start my check**

### 3. Intake chat (90s)
- Type: "I've been feeling dizzy, anxious, and I have chest tightness for 3 days"
- AI asks follow-up: "How severe is the chest tightness? Any shortness of breath?"
- Type: "It's about a 5/10, no trouble breathing, just feels tight sometimes"
- AI asks: "Any other symptoms — fever, racing heart, nausea?"
- Type: "No fever, but I've been really tired and not sleeping well"
- One more turn → triage triggers

### 4. Results page (60s)
- Urgency card shows: **Medium — See a doctor within 1–3 days**
- Score: ~48/100
- Explanation: "Your combination of chest tightness, dizziness, and sleep issues could be anxiety or stress-related, but warrants a check-up to rule out other causes."
- Show: Warning signs strip
- Show: Visit prep section

### 5. Care options (45s)
- 3 options ranked: Telehealth (best fit), Primary care, Pharmacy clinic
- Click telehealth card → shows cost ($0–$50), why it fits, phone number

### 6. Cost & coverage (30s)
- Show parent plan section: "Covered — show your insurance card"
- Show glossary: "Here's what copay actually means"

### 7. Follow-up (20s)
- "We'll check in on you in 3 days"
- Show dashboard with the case saved

---

## Key lines to say

**Opening:**
> "BridgeCare is the AI health front door for Gen Z students. It helps young adults understand urgency, care options, cost direction, and next steps — in one calm, accessible flow."

**On triage:**
> "We are not using AI to decide if this is an emergency. A deterministic rule engine checks red flags first. AI only explains the result in plain language. The model can't invent urgency."

**Closing:**
> "We are not replacing clinicians. We are reducing confusion before care happens."

---

## Common judge questions

**"How is this different from WebMD?"**
> WebMD shows you a list of possible diagnoses and sends you spiraling. BridgeCare tells you what to DO — urgency level, specific care options near you, cost estimates, and what to say when you get there.

**"How do you ensure safety?"**
> Rules engine runs first — always. AI can never route someone to self-care if red flags are present. If critical keywords appear, we surface an emergency warning immediately regardless of what the AI says.

**"What about HIPAA?"**
> We run AI locally with Ollama — no health data leaves the device in demo mode. For production, we'd use BAA-covered infrastructure.
