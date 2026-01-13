import os
import sys
import shutil
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from operator import itemgetter

# --- CHROMA DB FIX FOR RENDER (Linux Only) ---
# This fixes the "Old SQLite" error on Render without breaking your Windows local setup
if sys.platform == "linux":
    try:
        __import__('pysqlite3')
        sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')
    except ImportError:
        pass

# LangChain Imports
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

# Load Environment Variables
load_dotenv()

# API Keys
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configuration
PERSIST_DIRECTORY = "./chroma_db"

app = FastAPI(title="OlajCodes AI Backend (Render)", version="3.1.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Embeddings ---
def get_embeddings():
    # Using Local Embeddings to match ingest.py
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# --- System Prompt ---
system_prompt_text = """
You are a professional assistant representing a developer. Your knowledge is based STRICTLY on the provided context.

### GUIDELINES:
- Output clear, well-structured text.
- Do NOT use asterisks (e.g., **bold**, *italics*) unless necessary for code.
- If context is missing, say "I don't have that information."

### PRIVACY GUARDRAILS:
You MUST REFUSE to answer questions about:
- Age / Date of birth / Home Address / Phone number / Personal Email
Reply EXACTLY with: "I cannot share personal or sensitive information. Please ask about my professional experience."

Context:
{context}
"""

prompt_template = ChatPromptTemplate.from_messages([
    ("system", system_prompt_text),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# --- Models ---
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[Message]] = []
    model: Optional[str] = "google/gemini-2.0-flash-001"

# --- LLM Factory ---
def get_llm_chain(model_preference: str):
    # 1. OpenRouter (Primary)
    if OPENROUTER_API_KEY:
        return ChatOpenAI(
            model=model_preference,
            openai_api_key=OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            temperature=0,
            default_headers={"HTTP-Referer": "https://olajcodes.com", "X-Title": "OlajCodes AI"}
        )
    
    # 2. Google Fallback
    if GOOGLE_API_KEY:
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0
        )

    raise ValueError("No API Keys configured on Render!")

# --- RAG Chain ---
def get_rag_chain(user_model_preference: str):
    try:
        # Check if DB exists
        if not os.path.exists(PERSIST_DIRECTORY):
            print("WARNING: chroma_db not found. Answering without context.")
            # Return a simple chain that just asks the LLM without context
            return get_llm_chain(user_model_preference) | StrOutputParser()

        embeddings = get_embeddings()
        vectorstore = Chroma(
            persist_directory=PERSIST_DIRECTORY,
            embedding_function=embeddings
        )
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
        
        chain = (
            {
                "context": itemgetter("question") | retriever | format_docs,
                "chat_history": itemgetter("chat_history"),
                "question": itemgetter("question")
            }
            | prompt_template
            | get_llm_chain(user_model_preference)
            | StrOutputParser()
        )
        return chain
    except Exception as e:
        print(f"Chain Error: {e}")
        raise e

# --- Endpoint ---
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        chat_history_objects = []
        for msg in request.history:
            if msg.role == "user":
                chat_history_objects.append(HumanMessage(content=msg.content))
            elif msg.role in ["assistant", "ai"]:
                chat_history_objects.append(AIMessage(content=msg.content))

        rag_chain = get_rag_chain(request.model)

        # Handle simple LLM fallback (if DB is missing)
        if isinstance(rag_chain, (ChatOpenAI, ChatGoogleGenerativeAI)):
             response_text = rag_chain.invoke(request.question)
             return {"answer": response_text.content}

        response_text = rag_chain.invoke({
            "question": request.question,
            "chat_history": chat_history_objects
        })

        return {"answer": response_text}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))