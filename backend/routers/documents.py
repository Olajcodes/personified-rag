# This is for the CV/Cover Letter endpoints

from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.schemas import DocRequest
from services.llm_service import LLMService
from services.doc_service import DocService
from core.prompts import CV_STRUCTURE_TEMPLATE, COVER_LETTER_TEMPLATE

router = APIRouter()

@router.post("/generate-cv")
async def generate_cv(request: DocRequest):
    try:
        retriever = LLMService.get_retriever()
        llm = LLMService.get_llm(request.model)
        
        today_str = datetime.now().strftime("%B %d, %Y")
        docs = retriever.invoke("My full professional experience, technical skills, and projects")
        context_text = LLMService.format_docs(docs)

        cv_prompt = f"""
        You are an expert Career Coach. 
        
        TODAY'S DATE: {today_str}
        
        STEP 1: RELEVANCE CHECK
        Compare the Job Description (JD) below with Olajide's Skills Context.
        - Olajide's Core Domain: AI Engineering, Python, Backend, Machine Learning.
        - If the JD is for a completely unrelated role (e.g., Nurse, Accountant, Chef), output ONLY: "NO_MATCH"
        
        STEP 2: GENERATION (Only if Match)
        If the role fits, generate a CV using the EXACT structure below.
        
        ### CRITICAL RULES:
        1. **Education Status:** Compare my graduation date (e.g., July 2025) with Today's Date ({today_str}). 
           - Since the graduation date is in the past, I have **GRADUATED**.
           - **NEVER** write "Currently pursuing". 
           - Instead, start the summary with: "Computer Science Graduate..." or "AI Engineer with..."
        
        2. **Summary:** Tailor the Professional Summary to the JD. Highlight years of experience and key tech.
        3. **Structure:** Follow the template below exactly.
        
        ### CV STRUCTURE:
        {CV_STRUCTURE_TEMPLATE}

        ---
        ### JOB DESCRIPTION:
        "{request.job_description}"
        
        ### SKILLS CONTEXT:
        {context_text}
        """

        print("Analyzing JD and Generating CV...")
        ai_response = llm.invoke(cv_prompt).content

        # 3. Check for Refusal
        if "NO_MATCH" in ai_response:
            raise HTTPException(status_code=400, detail="Job description is not relevant to Olajide's skillset. Generation refused.")

        # 4. Convert to File
        docx_file = DocService.create_docx_from_text(ai_response)

        return StreamingResponse(
            docx_file, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=Olajide_CV_Tailored.docx"}
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"CV Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-cover-letter")
async def generate_cover_letter(request: DocRequest):
    try:
        today_str = datetime.now().strftime("%B %d, %Y")
        
        retriever = LLMService.get_retriever()
        llm = LLMService.get_llm(request.model)
        docs = retriever.invoke("My full professional experience, motivation, and soft skills")
        context_text = LLMService.format_docs(docs)

        check_prompt = f"""
        You are a Career Relevance Analyzer.
        
        YOUR TASK:
        Determine if the Job Description (JD) below matches the profile of an AI Engineer/Python Developer.
        
        OLAJIDE'S PROFILE:
        - Roles: AI Engineer, Backend Developer, Data Scientist.
        - Tech: Python, FastAPI, React, RAG, LLMs, OpenAI, Vector DBs.
        
        ### COVER LETTER STRUCTURE:
        {COVER_LETTER_TEMPLATE}
        
        JOB DESCRIPTION:
        {request.job_description}
        
        INSTRUCTIONS:
        - If the job is related to Software, Tech, AI, Data, or Engineering -> Return "YES"
        - If the job is completely unrelated (e.g. Nurse, Chef, Driver, HR) -> Return "NO"
        - Be lenient. If there is a partial skill match, Return "YES".
        
        Output strictly one word: YES or NO.
        """
        
        print("Checking Relevance...")
        relevance_check = llm.invoke(check_prompt).content.strip().upper()

        if "NO" in relevance_check:
             raise HTTPException(status_code=400, detail="Job description is not relevant to Olajide's skillset. Generation refused.")


        write_prompt = f"""
        You are Olajide. Write a professional, persuasive cover letter for this job.
        
        CONTEXT (My Skills & Experience):
        {context_text}
        
        JOB DESCRIPTION:
        "{request.job_description}"
        
        CURRENT DATE: {today_str}

        INSTRUCTIONS:
        1. **Header Formatting:** - Replace [Date] with "{today_str}".
           - Extract the Company Name from the JD and replace [Company Name]. 
           - If NO Company Name is found, delete the [Company Name] line entirely.
        
        2. **Chronology & Accuracy:** - Look at dates in the context. 
           - **TIIDELab** was an internship in the past. Do NOT refer to it as "recent" or "current".
           - Focus heavily on my **current** work: 'xplainify-ai', 'Nelfund Navigator', 'Fiscal Sentinel', and my AI Engineering training.
        
        3. **Tone:** Confident, professional, enthusiastic.
        4. **Length:** Keep it under 350 words.
        
        OUTPUT:
        Return ONLY the body of the letter (starting from the Date). Do not include any markdown code blocks.
        """
   
        cover_letter_content = llm.invoke(write_prompt).content
        
        docx = DocService.create_docx_from_text(cover_letter_content)
        
        return StreamingResponse(
            docx, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=Olajide_Cover_Letter.docx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))