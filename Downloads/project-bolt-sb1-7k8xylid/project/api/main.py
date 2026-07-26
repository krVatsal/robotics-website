from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil
import uuid
import json
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import ConversationalRetrievalChain
# Load environment variables
load_dotenv()

# Configure API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for storing uploads and vector DB
os.makedirs("uploads", exist_ok=True)
os.makedirs("vector_db", exist_ok=True)

# Initialize Gemini embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# Store document data and vector stores
documents = {}
vector_stores = {}

class ChatRequest(BaseModel):
    query: str
    document_name: Optional[str] = None

class SummarizeRequest(BaseModel):
    document_name: str

class ChatResponse(BaseModel):
    response: str

class SummaryResponse(BaseModel):
    summary: str

def process_document(file_path: str, file_extension: str):
    # Load document based on file type
    if file_extension == '.pdf':
        loader = PyPDFLoader(file_path)
    elif file_extension == '.docx':
        loader = Docx2txtLoader(file_path)
    else:
        loader = TextLoader(file_path)
    
    documents = loader.load()
    
    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    splits = text_splitter.split_documents(documents)
    
    # Create and save vector store
    vector_store = FAISS.from_documents(splits, embeddings)
    return vector_store

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        document_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in ['.pdf', '.docx', '.txt']:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        file_path = f"uploads/{document_id}{file_extension}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document and create vector store
        vector_store = process_document(file_path, file_extension)
        
        # Store document info and vector store
        documents[file.filename] = {
            "id": document_id,
            "path": file_path,
            "type": file.content_type,
        }
        vector_stores[file.filename] = vector_store
        
        return {"success": True, "document_id": document_id, "filename": file.filename}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Initialize Gemini chat model
        llm = ChatGoogleGenerativeAI(model="gemini-pro")
        
        # If there's a document, use it for context
        if request.document_name and request.document_name in vector_stores:
            vector_store = vector_stores[request.document_name]
            
            # Create conversational chain with document context
            qa_chain = ConversationalRetrievalChain.from_llm(
                llm=llm,
                retriever=vector_store.as_retriever(),
                return_source_documents=True,
            )
            
            # Get response with document context
            result = qa_chain({"question": request.query, "chat_history": []})
            return ChatResponse(response=result["answer"])
        else:
            # General conversation without document context
            # Create a simple chat prompt for general tutoring
            prompt = f"""You are Mira, a helpful AI tutor. You can help students with various academic topics, 
            provide explanations, answer questions, and assist with learning. 
            
            Student question: {request.query}
            
            Please provide a helpful, educational response."""
            
            # Get response from Gemini
            response = llm.invoke(prompt)
            return ChatResponse(response=response.content)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

@app.post("/api/summarize", response_model=SummaryResponse)
async def summarize_document(request: SummarizeRequest):
    try:
        if request.document_name not in vector_stores:
            raise HTTPException(status_code=404, detail="Document not found")
        
        vector_store = vector_stores[request.document_name]
        llm = ChatGoogleGenerativeAI(model="gemini-pro")
        
        # Create summary chain
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vector_store.as_retriever(),
            return_source_documents=True,
        )
        
        # Get summary
        result = qa_chain({"question": "Please provide a comprehensive summary of this document.", "chat_history": []})
        
        return SummaryResponse(summary=result["answer"])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@app.post("/api/generate-avatar-response")
async def generate_avatar_response(text: str = Form(...)):
    try:
        # In a real implementation, this would call Tavus API
        # This is a simplified version that just returns a success message
        # You'd need to implement the actual Tavus API integration here
        
        return {
            "success": True,
            "message": "Avatar response generated successfully",
            "url": "https://example.com/placeholder-video.mp4"  # Added URL for testing
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate avatar response: {str(e)}")

@app.get("/api/test")
async def test_endpoint():
    """Simple test endpoint to verify API is working."""
    return {"status": "ok", "message": "API is working!"}

@app.get("/api/video-status/{video_id}")
async def get_video_status(video_id: str):
    # In a real implementation, this would check the status with Tavus API
    # This is a simplified version that always returns completed status
    return {
        "status": "completed",
        "url": "https://example.com/placeholder-video.mp4",
        "id": video_id
    }

if __name__ == "__main__":
    import uvicorn
    
    # Run without SSL for local development
    uvicorn.run(
        app,
        host="localhost",
        port=8000
    )
