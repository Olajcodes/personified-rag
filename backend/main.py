import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from operator import itemgetter

# LangChain Imports
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

# Load Environment Variables (We keep this for the server setup, but won't use the key for chat)
load_dotenv()
# Load new variable
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
SERVER_API_KEY = os.getenv("OPENAI_API_KEY")

if not ADMIN_PASSWORD:
    print("WARNING: ADMIN_PASSWORD not set in .env. Admin bypass disabled.")

PERSIST_DIRECTORY = "./chroma_db"

app = FastAPI(title="OlajCodes AI Backend (BYOK)", version="1.0.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- System Prompt ---
system_prompt_text = """
You are a professional assistant representing a developer. Your knowledge is based STRICTLY on the provided context.

### PRIVACY GUARDRAILS:
You MUST REFUSE to answer questions about the following personal sensitive information:
- Age / Date of birth
- Home Address
- Phone number / Personal Email

If a user asks for this information, reply EXACTLY with:
"I cannot share personal or sensitive information. Please ask about my professional experience or projects."

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

# --- API Models ---
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[Message]] = []

# --- Dynamic Chain Creator ---
def get_chain_for_user(api_key: str):
    """
    Creates the RAG chain dynamically using the user's specific API key.
    """
    try:
        # 1. Initialize Embeddings with User's Key
        user_embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=api_key
        )

        # 2. Connect to Vector Store with User's Embeddings
        # We only READ from the DB, so we re-use the persist directory
        vectorstore = Chroma(
            persist_directory=PERSIST_DIRECTORY,
            embedding_function=user_embeddings
        )
        retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

        # 3. Initialize LLM with User's Key
        llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0,
            openai_api_key=api_key
        )

        # 4. Build Chain
        chain = (
            {
                "context": itemgetter("question") | retriever | format_docs,
                "chat_history": itemgetter("chat_history"),
                "question": itemgetter("question")
            }
            | prompt_template
            | llm
            | StrOutputParser()
        )
        return chain
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid API Key or OpenAI Error: {str(e)}")

# --- Helper to determine which key to use ---
def resolve_api_key(auth_token: str):
    """
    Decides whether to use the Server Key (Admin) or the User's Key.
    """
    if not auth_token:
        raise HTTPException(status_code=401, detail="Authentication required (API Key or Admin Password).")

    # 1. Check if token matches Admin Password
    if auth_token == ADMIN_PASSWORD:
        if not SERVER_API_KEY:
            raise HTTPException(status_code=500, detail="Server API Key is not configured.")
        return SERVER_API_KEY
    
    # 2. Otherwise, treat token as a User API Key
    # Basic validation to reject obvious non-keys
    if not auth_token.startswith("sk-"):
        raise HTTPException(status_code=401, detail="Invalid OpenAI API Key format.")
    
    return auth_token

# --- Updated Endpoint ---
@app.post("/chat")
async def chat_endpoint(
    request: ChatRequest, 
    # specific header for the token
    x_auth_token: str = Header(None, alias="x-auth-token") 
):
    try:
        # 1. Determine the correct API Key to use
        active_api_key = resolve_api_key(x_auth_token)

        # 2. Convert History
        chat_history_objects = []
        for msg in request.history:
            if msg.role == "user":
                chat_history_objects.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant" or msg.role == "ai":
                chat_history_objects.append(AIMessage(content=msg.content))

        # 3. Get Chain (using the resolved key)
        # Note: We pass the resolved key to our chain creator
        user_chain = get_chain_for_user(active_api_key)

        # 4. Invoke
        response_text = user_chain.invoke({
            "question": request.question,
            "chat_history": chat_history_objects
        })

        return {"answer": response_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))