from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, documents

app = FastAPI(title="OlajCodes AI Agent", version="4.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat.router)
app.include_router(documents.router)

@app.get("/")
async def health_check():
    return {"status": "active", "message": "Backend Running"}