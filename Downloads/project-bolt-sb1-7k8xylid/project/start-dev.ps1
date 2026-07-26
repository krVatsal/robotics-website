# Start both frontend and backend servers
# Windows PowerShell script

# Script to start both the frontend and backend servers
# Usage: Run this script from the project root directory
# Author: Kumar

# Define the startup function
function Start-DevelopmentEnvironment {
    Write-Host "Starting development environment for Mira AI Tutor..." -ForegroundColor Cyan
    
    # Create necessary directories
    if (-not (Test-Path -Path "api/uploads")) {
        New-Item -Path "api/uploads" -ItemType Directory | Out-Null
        Write-Host "Created uploads directory" -ForegroundColor Green
    }
    
    if (-not (Test-Path -Path "api/vector_db")) {
        New-Item -Path "api/vector_db" -ItemType Directory | Out-Null
        Write-Host "Created vector_db directory" -ForegroundColor Green
    }
    
    # Check if .env.local exists
    if (-not (Test-Path -Path ".env.local")) {
        Write-Host "Creating .env.local file with template values..." -ForegroundColor Yellow
        @"
# Tavus AI API credentials
TAVUS_API_KEY=your_tavus_api_key_here
TAVUS_VOICE_ID=your_tavus_voice_id_here

# API configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
"@ | Out-File -FilePath ".env.local" -Encoding utf8
        Write-Host "Created .env.local file. Please update with your API keys." -ForegroundColor Green
    }
    
    # Start backend server in a new window
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\api'; python -m uvicorn main:app --host localhost --port 8000 --reload"
    
    # Wait a moment for the backend to initialize
    Start-Sleep -Seconds 2
    
    # Start frontend server
    Write-Host "Starting frontend server..." -ForegroundColor Cyan
    npm run dev
}

# Run the startup function
Start-DevelopmentEnvironment
