import os
import uvicorn
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# LangChain Imports
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

# Load Environment Variables
load_dotenv()

# Verify API Key
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY is not set in the .env file")

# --- Configuration ---
PERSIST_DIRECTORY = "./chroma_db"  # Must match the directory in the Notebook
MODEL_NAME = "gpt-4o"

# --- App Initialization ---
app = FastAPI(title="OlajCodes AI Backend", version="1.0.0")

# --- CORS Configuration ---
# Allow requests from your Vercel frontend
origins = [
    "http://localhost:5173/",           # Local development
    "https://olajcodes-ai.vercel.app", # Production Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RAG Setup (Load Existing Vector Store) ---
print("Loading Vector Store...")
embedding_function = OpenAIEmbeddings(model="text-embedding-3-small")

# Note: We use the same persist_directory to load the data ingested by the notebook
vectorstore = Chroma(
    persist_directory=PERSIST_DIRECTORY,
    embedding_function=embedding_function
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

llm = ChatOpenAI(model=MODEL_NAME, temperature=0)

# --- System Prompt & Chain ---
system_prompt_text = """
You are a professional assistant representing a developer. Your knowledge is based STRICTLY on the provided context (GitHub repositories and LinkedIn profile).

### INSTRUCTIONS:
1. Answer questions about professional experience, skills, repositories, and technical implementation details.
2. If the context does not contain the answer, say "I don't have that information in my knowledge base."
3. ALWAYS cite your sources implicitly by referring to the specific file or section.
4. Format all responses as clean plain text with no markdown or special characters.

### PRIVACY GUARDRAILS (CRITICAL):
You MUST REFUSE to answer questions about the following personal sensitive information, even if it might be present in the context:
- Age
- Date of birth
- Home Address
- Phone number
- Personal Email address

If a user asks for this information, reply EXACTLY with:
"I cannot share personal or sensitive information such as contact details or age. Please ask about his professional experience or projects."

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

# Create the Chain
rag_chain = prompt_template | llm | StrOutputParser()

# --- API Models ---

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    question: str = Field(examples=["Who is Olajcodes?"])
    history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    answer: str

# --- Endpoints ---

@app.get("/")
async def root():
    return {"status": "ok", "message": "RAG Backend is running."}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Convert Pydantic history to LangChain message format
        chat_history_objects = []
        for msg in request.history:
            if msg.role == "user":
                chat_history_objects.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                chat_history_objects.append(AIMessage(content=msg.content))

        # Retrieve documents manually to pass into the chain
        # (This was done to handle the retrieving step explicitly if needed, or rely on the chain)
        retrieved_docs = retriever.invoke(request.question)
        formatted_context = format_docs(retrieved_docs)

        # Invoke Chain
        response_text = rag_chain.invoke({
            "question": request.question,
            "chat_history": chat_history_objects,
            "context": formatted_context
        })

        return ChatResponse(answer=response_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)