# Pydantic models

from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str
    content: str
    
class ChatRequest(BaseModel):
    question: str
    history: Optional[List[Message]] = []
    model: Optional[str] = "gpt-4o-mini"
    
class DocRequest(BaseModel):
    job_description: str
    model: Optional[str] = "gpt-4o-mini"