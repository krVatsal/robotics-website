# Mira - AI Document Tutor

Mira is an AI-powered document tutor that helps users understand and interact with their uploaded documents.

## Features

- **Document Analysis**: Upload PDF documents, research papers, or text files
- **Voice Interaction**: Ask questions about your documents using voice input
- **AI Avatar**: Video responses using Tavus AI for a more engaging experience
- **Document Summarization**: Get quick summaries of uploaded documents

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Tavus AI API key (for video generation)

### Quick Start (Windows)

The easiest way to start the development environment is to use the provided PowerShell script:

```powershell
# Run from the project root directory
.\start-dev.ps1
```

This script will:
1. Create necessary directories
2. Check for the `.env.local` file and create if needed
3. Start the backend server (FastAPI)
4. Start the frontend server (Next.js)

### Manual Setup

Create a `.env.local` file in the project root with the following:

```
# Tavus AI API credentials
TAVUS_API_KEY=your_tavus_api_key_here
TAVUS_VOICE_ID=your_tavus_voice_id_here

# API configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### Frontend Setup (Next.js)

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup (FastAPI)

1. Navigate to the API directory:
   ```
   cd api
   ```

2. Create and activate a virtual environment (recommended):
   ```
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the api directory:
   ```
   copy .env.sample .env
   ```
   Then edit the `.env` file to add your Google API key.

5. Run the API server:
   ```
   uvicorn main:app --host localhost --port 8000 --reload
   ```

## API Documentation

The API server will be available at `http://localhost:8000/docs` once running.

## Troubleshooting

### Video Generation Issues

If you encounter problems with video generation:

1. Check that your Tavus API key and voice ID are correctly set in `.env.local`
2. Ensure your network can connect to `api.tavus.io`
3. Try disabling video mode and use text-only responses

### Connection Timeouts

If you experience connection timeouts to the API:

1. Make sure the API server is running at `http://localhost:8000`
2. Check your firewall settings
3. Increase timeout values in the code if needed

## License

MIT
