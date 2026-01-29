import os
import shutil
from core.config import OPENAI_API_KEY, PERSIST_DIRECTORY

# Loaders
from langchain_community.document_loaders import GitLoader, PyPDFLoader, TextLoader

# Splitters & Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings 
from langchain_chroma import Chroma

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

GITHUB_REPO_URL = "https://github.com/Olajcodes/Olajcodes"
LINKEDIN_PDF_PATH = "Profile.pdf"
LOCAL_DATA_FOLDER = "./data"  

def get_embeddings():
    print("INFO: Using OpenAI Embeddings (text-embedding-3-small)...")
    return OpenAIEmbeddings(model="text-embedding-3-small")

def main():
    # Clear existing DB
    if os.path.exists(PERSIST_DIRECTORY):
        print(f"Removing existing database at {PERSIST_DIRECTORY}...")
        shutil.rmtree(PERSIST_DIRECTORY)

    documents = []

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

    print(f"Checking for local documents in {LOCAL_DATA_FOLDER}...")
    if os.path.exists(LOCAL_DATA_FOLDER):
        local_docs = []
        for filename in os.listdir(LOCAL_DATA_FOLDER):
            file_path = os.path.join(LOCAL_DATA_FOLDER, filename)
            
            if os.path.isfile(file_path) and filename.endswith((".md", ".txt")):
                try:
                    print(f"   - Loading: {filename}")
                    loader = TextLoader(file_path, encoding='utf-8')
                    docs = loader.load()
                    
                    for doc in docs:
                        doc.metadata["source"] = f"Local File: {filename}"
                    
                    local_docs.extend(docs)
                except Exception as e:
                    print(f"   ! Failed to load {filename}: {e}")
        
        documents.extend(local_docs)
        print(f"Loaded {len(local_docs)} local documents.")
    else:
        print(f"Notice: Folder '{LOCAL_DATA_FOLDER}' does not exist. Create it to add local text files.")

    # Split Text
    if not documents:
        print("No documents found to ingest.")
        return

    print(f"Splitting {len(documents)} total documents...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    print(f"Total chunks created: {len(splits)}")

    # Embed and Store
    print("Generating embeddings and Storing in ChromaDB...")
    embedding_function = get_embeddings()
    
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embedding_function,
        persist_directory=PERSIST_DIRECTORY
    )

    print("Success! Database created.")

if __name__ == "__main__":
    main()