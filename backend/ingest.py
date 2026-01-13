import os
import shutil
from dotenv import load_dotenv
from langchain_community.document_loaders import GitLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Load Environment Variables
load_dotenv()

# Configuration
GITHUB_REPO_URL = "https://github.com/Olajcodes/Olajcodes"
LINKEDIN_PDF_PATH = "Profile.pdf"
PERSIST_DIRECTORY = "./chroma_db"

def get_embeddings():
    """
    Returns the configured Embedding model.
    Uses Local HuggingFace Embeddings (Free, Private, No Rate Limits).
    """
    print("Using Local HuggingFace Embeddings (all-MiniLM-L6-v2)...")
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def main():
    # 1. Clear existing DB (Safe re-index)
    if os.path.exists(PERSIST_DIRECTORY):
        print(f"Removing existing database at {PERSIST_DIRECTORY}...")
        shutil.rmtree(PERSIST_DIRECTORY)

    documents = []

    # 2. Load GitHub
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
        documents.extend(github_docs)
        print(f"Loaded {len(github_docs)} documents from GitHub.")
    except Exception as e:
        print(f"Error loading GitHub: {e}")

    # 3. Load LinkedIn
    try:
        if os.path.exists(LINKEDIN_PDF_PATH):
            print(f"Loading LinkedIn profile from {LINKEDIN_PDF_PATH}...")
            loader_linkedin = PyPDFLoader(LINKEDIN_PDF_PATH)
            linkedin_docs = loader_linkedin.load()
            documents.extend(linkedin_docs)
            print(f"Loaded {len(linkedin_docs)} pages from LinkedIn.")
        else:
            print(f"Warning: {LINKEDIN_PDF_PATH} not found. Skipping.")
    except Exception as e:
        print(f"Error loading LinkedIn: {e}")

    # 4. Split Text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    print(f"Total split documents: {len(splits)}")

    # 5. Embed and Store
    if splits:
        print("Generating embeddings and Storing in ChromaDB...")
        embedding_function = get_embeddings()
        
        # Initialize VectorStore and add documents
        # No need for batching/delays with local model!
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
