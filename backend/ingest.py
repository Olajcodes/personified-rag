import os
import shutil
from dotenv import load_dotenv

# Loaders
from langchain_community.document_loaders import GitLoader, PyPDFLoader, TextLoader

# Splitters & Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings 
from langchain_chroma import Chroma

# Load Environment Variables
load_dotenv()

# Verify API Key
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("ERROR: OPENAI_API_KEY not found in .env file. Please add it.")

# --- CONFIGURATION ---
GITHUB_REPO_URL = "https://github.com/Olajcodes/Olajcodes"
LINKEDIN_PDF_PATH = "Profile.pdf"

# ⚠️ IMPORTANT: Ensure this matches the folder name where your files are!
# Based on your logs, you named it "medium_articles"
LOCAL_DATA_FOLDER = "./medium_articles"  
PERSIST_DIRECTORY = "./chroma_db"

def get_embeddings():
    print("INFO: Using OpenAI Embeddings (text-embedding-3-small)...")
    return OpenAIEmbeddings(model="text-embedding-3-small")

def main():
    # 1. Clear existing DB
    if os.path.exists(PERSIST_DIRECTORY):
        print(f"Removing existing database at {PERSIST_DIRECTORY}...")
        shutil.rmtree(PERSIST_DIRECTORY)

    documents = []

    # --- SOURCE 1: GitHub ---
    try:
        print(f"Loading GitHub repository from {GITHUB_REPO_URL}...")
        if os.path.exists("./temp_repo"):
            shutil.rmtree("./temp_repo")
            
        loader_github = GitLoader(
            clone_url=GITHUB_REPO_URL,
            repo_path="./temp_repo",
            branch="main",
            file_filter=lambda file_path: file_path.endswith((".md", ".py", ".js", ".ts", ".html", ".ipynb"))
        )
        github_docs = loader_github.load()
        for doc in github_docs:
            doc.metadata["source"] = f"GitHub: {doc.metadata.get('file_name', 'Unknown')}"
        documents.extend(github_docs)
        print(f"Loaded {len(github_docs)} documents from GitHub.")
    except Exception as e:
        print(f"Error loading GitHub: {e}")

    # --- SOURCE 2: LinkedIn PDF ---
    try:
        if os.path.exists(LINKEDIN_PDF_PATH):
            print(f"Loading LinkedIn profile from {LINKEDIN_PDF_PATH}...")
            loader_linkedin = PyPDFLoader(LINKEDIN_PDF_PATH)
            linkedin_docs = loader_linkedin.load()
            for doc in linkedin_docs:
                doc.metadata["source"] = "LinkedIn Profile"
            documents.extend(linkedin_docs)
            print(f"Loaded {len(linkedin_docs)} pages from LinkedIn.")
        else:
            print(f"Warning: {LINKEDIN_PDF_PATH} not found. Skipping.")
    except Exception as e:
        print(f"Error loading LinkedIn: {e}")

    # --- SOURCE 3: Local Data (Manual Loop Fix) ---
    print(f"Checking for local documents in {LOCAL_DATA_FOLDER}...")
    if os.path.exists(LOCAL_DATA_FOLDER):
        local_docs = []
        # Manually loop through every file in the folder
        for filename in os.listdir(LOCAL_DATA_FOLDER):
            file_path = os.path.join(LOCAL_DATA_FOLDER, filename)
            
            # Check if it's a file and ends with .md or .txt
            if os.path.isfile(file_path) and filename.endswith((".md", ".txt")):
                try:
                    print(f"   - Loading: {filename}")
                    # Force UTF-8 encoding to avoid Windows errors
                    loader = TextLoader(file_path, encoding='utf-8')
                    docs = loader.load()
                    
                    # Add Metadata
                    for doc in docs:
                        doc.metadata["source"] = f"Article: {filename}"
                    
                    local_docs.extend(docs)
                except Exception as e:
                    print(f"   ! Failed to load {filename}: {e}")
        
        documents.extend(local_docs)
        print(f"Loaded {len(local_docs)} local documents.")
    else:
        print(f"Notice: Folder '{LOCAL_DATA_FOLDER}' does not exist.")

    # 4. Split Text
    print(f"Splitting {len(documents)} total documents...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    print(f"Total chunks created: {len(splits)}")

    # 5. Embed and Store
    if splits:
        print("Generating embeddings and Storing in ChromaDB...")
        embedding_function = get_embeddings()
        
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embedding_function,
            persist_directory=PERSIST_DIRECTORY
        )

        print("Success! Database created.")
    else:
        print("No documents to ingest.")

if __name__ == "__main__":
    main()