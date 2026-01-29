# This handles the settings (Env variables and constants)

import os
from dotenv import load_dotenv

# Loading the environment
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PERSIST_DIRECTORY = "./chroma_db"

if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY not found in .env file")
    