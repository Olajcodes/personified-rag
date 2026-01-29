# This is for the chat endpoints

from datetime import datetime
from fastapi import APIRouter, HTTPException
from operator import itemgetter

from models.schemas import ChatRequest
from services.llm_service import LLMService
from core.prompts import system_prompt_text
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        retriever = LLMService.get_retriever()
        llm = LLMService.get_llm(request.model)
        
        today_str = datetime.now().strftime("%B %d, %Y") 

        chat_history_objects = []
        if request.history:
            for msg in request.history:
                if msg.role.lower() == "user":
                    chat_history_objects.append(HumanMessage(content=msg.content))
                elif msg.role.lower() == "assistant":
                    chat_history_objects.append(AIMessage(content=msg.content))
        
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt_text),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}"),
        ])
        
        chain = (
            {
                "context": itemgetter("question") | retriever | LLMService.format_docs,
                "chat_history": lambda x: chat_history_objects,
                "current_date": lambda x: today_str, 
                "question": itemgetter("question")
            }
            | prompt_template
            | llm
            | StrOutputParser()
        )
        
        print(f"Processing query: {request.question}")
        response = chain.invoke({"question": request.question})
        return {"answer": response}

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
