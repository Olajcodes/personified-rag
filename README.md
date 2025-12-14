# Olajcodes AI Assistant (RAG)

## 📄 Overview

This project is a **Privacy-First Retrieval-Augmented Generation (RAG)** system designed to act as an AI portfolio assistant for **OlajCodes**. It aggregates professional knowledge from **GitHub repositories** and **LinkedIn profiles** to answer inquiries about skills, projects, and experience, while strictly enforcing privacy guardrails to protect Personally Identifiable Information (PII).

**Live Demo:** [olajcodes-ai.vercel.app](https://olajcodes-ai.vercel.app)

---

## ✨ Key Features

* **📚 Multi-Source Knowledge Base:** Ingests codebases (GitHub) and professional resumes (LinkedIn PDF).
* **🛡️ Privacy Guardrails:** Engineered via System Prompts to **refuse** answering questions about:
    * Home Address / Physical Location
    * Personal Phone Numbers & Emails
    * Age & Date of Birth
* **🧠 Context-Aware:** Uses **LangChain** and **ChromaDB** for semantic search and retrieval.
* **💬 Conversational Memory:** Remembers context across the chat session.
* **⚡ High Performance:** Powered by **OpenAI GPT-4o** and **OpenAI Embeddings**.

-----

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Lucide Icons |
| **Backend** | Python (FastAPI), Uvicorn |
| **Orchestration** | LangChain, LCEL (LangChain Expression Language) |
| **Vector DB** | ChromaDB |
| **LLM Provider** | OpenAI (gpt-4o) & Embeddings (text-embedding-3-small) |

-----

## 🚀 Getting Started

### Prerequisites

  * Python 3.10+
  * Node.js & npm
  * OpenAI API Key

### 1\. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# macOS/Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

Install Dependencies:

```bash
pip install -r requirements.txt
```

**Configure Environment Variables:**
Create a `.env` file in the `backend` folder:

```ini
OPENAI_API_KEY=sk-proj-your-key-here
```

**Generate the Vector Database:**
Run the Jupyter Notebook `RAG_System.ipynb` to scrape GitHub/LinkedIn and save the embeddings to the `./chroma_db` folder.

**Run the Server:**

```bash
uvicorn main:app --reload
```

*The server will start at `http://localhost:8000`*

### 2\. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install Dependencies:

```bash
npm install
```

Run Development Server:

```bash
npm run dev
```

*The frontend will run at `http://localhost:5137`*

-----

## 🔒 Privacy Implementation

The system implements a **Strict Refusal Policy** at the System Prompt level.

**System Prompt Snippet:**

```plaintext
### PRIVACY GUARDRAILS:
You MUST REFUSE to answer questions about the following personal sensitive information:
- Age / Date of birth
- Home Address
- Phone number / Personal Email

If a user asks for this information, reply EXACTLY with:
"I cannot share personal or sensitive information such as contact details or age. Please ask about my professional experience or projects."
```

-----

## 📡 API Reference

### `POST /chat`

Sends a user query to the RAG chain.

**Request Body:**

```json
{
  "question": "What is his experience with Python?",
  "history": [
    {"role": "user", "content": "Hi"},
    {"role": "assistant", "content": "Hello!"}
  ]
}
```

**Response:**

```json
{
  "answer": "He has 4 years of experience with Python, specifically building RAG pipelines... [Source: resume.pdf]"
}
```

-----

## 📦 Deployment

1.  **Backend:** Deploy to Render, Railway, or AWS.
      * *Important:* Ensure the `chroma_db` folder is generated during the build process or uploaded with the codebase.
2.  **Frontend:** Deploy to Vercel or Netlify.
      * Update the fetch URL in `ChatInterface.jsx` to point to your production backend URL.

-----

## 📄 License

This project is proprietary and confidential.
Copyright © 2025 OlajCodes.

```