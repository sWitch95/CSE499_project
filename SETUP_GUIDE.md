# Lab Vision Grid - Desktop App Setup Guide

## Prerequisites
- Python 3.8+
- Node.js / npm
- pip (Python package manager)

## Installation

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Node Dependencies
```bash
npm install
```

## Running the Desktop App

### Option 1: Simple (Recommended for beginners)
```bash
npm run desktop
```
This will:
1. Build your React app (`npm run build`)
2. Start the Python backend with pywebview
3. Open a desktop window with your app

### Option 2: Advanced (Background Flask thread)
```bash
npm run desktop:advanced
```
Uses threading for better control and separate Flask + pywebview instances.

## Development Workflow

### During Development:
1. **Terminal 1** - Start the React dev server:
   ```bash
   npm run dev
   ```
   Access at: `http://localhost:8080`

2. **Terminal 2** - Start a separate Flask dev server:
   ```bash
   python -m flask --app main:app run --port 5000
   ```
   Access at: `http://localhost:5000`

### Build Production Desktop App:
```bash
npm run build
npm run desktop
```

## Python Integration

### Calling Python Endpoints from React:

```typescript
// src/api/client.ts (or similar)
const API_BASE = 'http://localhost:5000/api';

export async function getPythonInfo() {
  const response = await fetch(`${API_BASE}/python-info`);
  return response.json();
}

export async function getSystemInfo() {
  const response = await fetch(`${API_BASE}/system-info`);
  return response.json();
}
```

### Using in React:
```typescript
import { useEffect, useState } from 'react';
import { getPythonInfo } from '@/api/client';

export function PythonIntegration() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getPythonInfo().then(setInfo);
  }, []);

  return <div>{JSON.stringify(info)}</div>;
}
```

## API Endpoints Available

- `GET /api/health` - Health check
- `GET /api/python-info` - Python version and system info
- `GET /api/system-info` - Detailed system information
- `POST /api/file-operations/list` - List files in directory
- `POST /api/execute-command` - Execute shell commands

## Packaging as Executable

To create a standalone .exe for Windows:

```bash
# Install PyInstaller
pip install pyinstaller

# Create executable
pyinstaller --onefile --windowed --name "Lab-Vision-Grid" main.py

# Find executable in dist/Lab-Vision-Grid.exe
```

## Troubleshooting

**Port 5000 already in use:**
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**React build not updating:**
```bash
npm run build
```

**Python module not found:**
```bash
pip install -r requirements.txt
```

## Directory Structure
```
project/
├── src/                    # React frontend
├── dist/                   # Built React app (created by npm run build)
├── backend/               # Python backend modules
│   ├── api.py            # API endpoints
│   └── __init__.py
├── main.py                # Entry point for desktop app
├── desktop_app.py         # Alternative advanced entry point
├── requirements.txt       # Python dependencies
└── package.json           # Node dependencies
```
