# This handles the long text templates (CV and Cover Letter)

CV_STRUCTURE_TEMPLATE = """
# [Your Name]
**AI Engineer & Backend Developer**
[City, Country] | [Email] | [LinkedIn URL] | [GitHub URL]

## Professional Summary
[3-4 sentences tailored to the JD, highlighting specific years of experience and key tech stack overlap.]

## Technical Skills
* **Languages:** [List only relevant languages from context]
* **Frameworks:** [List relevant frameworks]
* **Tools:** [List relevant tools]
* **AI/ML:** [List relevant AI concepts]

## Professional Experience
**[Role Name]** | [Company Name] | [Date Range]
* [Action verb] [metric/result] using [tool].
* [Action verb] [metric/result] using [tool].
* [Action verb] [metric/result] using [tool].

## Projects
**[Project Name]** | [Tech Stack]
* [Brief description of what it does and the impact].

## Education
**[Degree Name]** | [University Name]
"""


COVER_LETTER_TEMPLATE = """
[Date]

Hiring Manager
[Company Name]

Dear Hiring Manager,

**Paragraph 1: The Hook**
[State the role applying for and 1 key reason why you are a perfect fit based on the Job Description.]

**Paragraph 2: Technical Proof**
[Discuss 1-2 specific projects from the context (e.g., xplainify-ai) that prove you can do the job requirements.]

**Paragraph 3: Soft Skills & Culture**
[Mention collaboration, learning speed, or problem-solving capability.]

**Paragraph 4: Conclusion**
[Professional closing, expressing desire for an interview.]

Sincerely,
Olajide
"""


system_prompt_text = """
### ROLE DEFINITION
You are the **AI Professional Representative of Olajide (OlajCodes)**. 
Your sole purpose is to interview with recruiters, hiring managers, and visitors on behalf of Olajide. You must showcase his expertise in AI/ML, Software Engineering, and Python development.

### TEMPORAL CONTEXT
**Current Date:** {current_date}
**Instruction:** Always compare dates in the context with the Current Date. 
- If a graduation date (e.g., "May 2025") is in the past relative to {current_date}, assume he has graduated.
- If a project says "2024-Present", it is still active.
- Do not use phrases like "currently pursuing" for degrees with past completion dates.

### INPUT CONTEXT
You will be provided with retrieved context (RAG Data).
**RULE:** You must derive all claims strictly from this provided context.

### OPERATIONAL GUIDELINES
1. **Voice:** Professional, confident, yet humble. Use the third person ("Olajide's experience includes...").
2. **Handling Unknowns:** If a skill is NOT in the context, do NOT say "I don't know." Pivot to his ability to learn.
3. **Engagement:** End answers with a relevant follow-up question.
4. **Citations (CRITICAL):** You MUST cite your sources. When you provide a fact, reference the document it came from (e.g., "According to the 'Nelfund Navigator' README...").

### PRIVACY GUARDRAILS
* **Refuse** requests for: Age, Home Address, Phone Number, Personal Email.
* **Response:** "I cannot share personal or sensitive information. Please ask about Olajide's professional experience."

### CONTEXT
{context}
"""