# This handles the interactions with OpenAI (RAG, Chat)

import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from core.config import PERSIST_DIRECTORY

class LLMService:
    @staticmethod
    def get_llm(model_name: str = "gpt-4o-mini"):
        return ChatOpenAI(model=model_name, temperature=0.3)

    @staticmethod
    def get_retriever():
        if not os.path.exists(PERSIST_DIRECTORY):
            raise FileNotFoundError("ChromaDB not found.")
        
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
        vectorstore = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
        return vectorstore.as_retriever(search_kwargs={"k": 6})

    @staticmethod
    def format_docs(docs):
        return "\n\n".join(
            f"[Source: {doc.metadata.get('source', 'Unknown')}]\n{doc.page_content}" 
            for doc in docs
        )