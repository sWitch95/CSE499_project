
# ⚡ Lab Vision Grid - Quick Start (5 Minutes)

## For experienced developers who just need the commands

### Prerequisites Installed? ✅
- Python 3.8+
- Node.js & npm
- Git

### 1️⃣ Clone & Navigate
```bash
git clone <YOUR_GIT_URL>
cd lab-vision-grid-main
```

### 2️⃣ Python Setup
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
npm install
```

### 4️⃣ Configure (Choose One)

**Option A: Single Machine (Development)**
```bash
# Create .env file in project root:
echo DEBUG=true > .env
echo FLASK_PORT=5000 >> .env
echo FLASK_HOST=localhost >> .env
```

**Option B: Local Network (Teacher/Student)**
```bash
python setup_local_network.py
# Follow prompts
```

**Option C: Remote Control**
```bash
python setup_remote_control.py
# Follow prompts
```

### 5️⃣ Run the Project

**Development Mode (2 terminals):**

Terminal 1:
```bash
npm run dev
# Access: http://localhost:8080
```

Terminal 2:
```bash
python main.py
# Runs on http://localhost:5000
```

**OR Desktop App (Single command):**
```bash
npm run desktop
```

### 6️⃣ Success! 🎉
- Frontend: http://localhost:8080
- Backend: http://localhost:5000

---

## Common Issues

| Issue | Fix |
|-------|-----|
| `python: command not found` | Use `python3` instead (Mac/Linux) |
| `(venv)` not showing | Reactivate: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows) |
| Port 5000/8080 in use | Kill other processes, or change port in `.env` |
| Dependencies fail to install | Update pip: `pip install --upgrade pip` then try again |
| Module not found | Virtual environment not activated - check `(venv)` prefix |

---

## Have Questions?
👉 See **GROUP_SETUP_GUIDE.md** for detailed step-by-step instructions
