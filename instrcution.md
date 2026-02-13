You are a Senior Full-Stack Engineer specializing in AI-powered real-time applications.

GOAL:
Build Version 1 of an AI-powered live mock interview platform using Next.js (frontend-focused) and Gemini Live Model for real-time AI interaction.

The product should simulate a 10-minute live technical/behavioral interview session using real-time audio-to-audio communication (no video required).

PROJECT NAME IDEAS (choose one or refine):
- InterviewForge AI
- EchoHire
- MockMate AI
- VerbalEdge
- PrepPulse AI
- HireSim
- SonicInterview
- RolePlay AI

CORE FUNCTIONAL REQUIREMENTS:

1. PRE-INTERVIEW SETUP SCREEN
   User must provide:
   - Job Role / Title (required)
   - CV Upload (PDF/DOCX required)
   - Job Description from Recruiter (optional text input)

   System must:
   - Extract structured information from CV
   - Parse job description if provided
   - Generate an interview strategy based on:
       - Role
       - CV strengths/weaknesses
       - Job requirements (if provided)

2. LIVE INTERVIEW SESSION
   - Duration: 10 minutes (hard limit)
   - Real-time Audio-to-Audio interaction using Gemini Live API
   - User speaks via microphone
   - AI responds via generated voice
   - AI response must ALSO display real-time transcription/captions
   - Countdown timer visible to user
   - Interview should dynamically adapt based on:
       - Candidate answers
       - CV
       - Missing skills
       - Behavioral cues

3. INTERVIEW LOGGING
   System must record:
   - Full transcript (AI + user)
   - Timestamped exchanges
   - Question types (technical / behavioral / situational)
   - Speaking duration ratio

4. POST-INTERVIEW ANALYSIS
   Immediately after 10 minutes:
   - Generate performance score (0–100%)
   - Break down scoring into:
       - Communication clarity
       - Technical accuracy
       - Confidence & structure
       - Relevance to job role
       - Depth of answers
   - Provide:
       - Strengths summary
       - Specific improvement areas
       - Suggested learning focus
       - Example improved answer snippets

5. UI REQUIREMENTS (Next.js Frontend)
   - Clean, professional interface
   - Interview screen with:
       - Live waveform visualization
       - Timer
       - Transcript panel
       - “End Interview” button
   - Post-session dashboard with:
       - Score visualization (circular progress or bar graph)
       - Expandable feedback sections
       - Option to download transcript (PDF)

TECH STACK CONSTRAINTS:
- Frontend: Next.js (App Router)
- Audio Handling: WebRTC or MediaRecorder API
- AI: Gemini Live model for:
    - Real-time conversation
    - Transcription
    - Evaluation analysis
- CV parsing: Use AI extraction (no heavy backend needed in V1)
- No full backend required for V1 — minimal server actions allowed

COGNITIVE ALIGNMENT FRAMEWORK (CAF):
The AI interviewer must:
- Act like a professional recruiter
- Avoid being overly friendly or robotic
- Maintain realistic pacing
- Ask follow-up questions when answers are weak
- Probe deeper on vague responses
- Challenge inconsistencies

REALITY ANCHORING FRAMEWORK (RAF):
Ensure:
- The AI does NOT hallucinate missing CV content
- It explicitly references provided information
- If job description is missing, it defaults to industry-standard expectations for the role
- The scoring logic must reference transcript evidence

META-CONTROL FRAMEWORK (MCF):
- Do not fabricate scoring metrics without transcript justification
- Do not inflate scores artificially
- If transcript quality is too poor, explicitly state limitations
- Ensure feedback is actionable and specific

HUMAN-IN-THE-LOOP CONTROL SYSTEM (HILCS):
- Provide a “Regenerate Feedback” button
- Allow user to manually flag a question as misunderstood
- Allow user to replay AI responses
- Show transcript so user can validate context

OUTPUT EVALUATION FRAMEWORK (OEF):
Before finalizing feedback:
- Verify score aligns with transcript evidence
- Ensure feedback contains:
    - At least 3 strengths
    - At least 3 improvement areas
    - 1 structured improvement roadmap
- Avoid generic advice like “practice more”

DELIVERABLES:
- Project folder structure
- Key implementation files
- Gemini Live integration example
- Audio streaming implementation
- Transcript rendering logic
- Scoring algorithm prompt template
- Post-interview evaluation prompt template
- UI layout structure
- Deployment instructions

Focus on building a functional V1 with scalable architecture.
Avoid overengineering.

Build this as a production-ready MVP.
