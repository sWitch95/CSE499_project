#!/usr/bin/env python
"""
Remote Control Setup and Quick Start Helper
"""

import os
import sys
import subprocess
import platform


def check_python_version():
    """Check if Python version is 3.7 or higher"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version.split()[0]} OK")


def install_dependencies():
    """Install required packages"""
    print("\n📦 Installing dependencies...")
    
    packages = [
        'flask',
        'flask-cors',
        'flask-socketio',
        'python-socketio',
        'pillow',
        'pyautogui',
    ]
    
    if platform.system() == 'Windows':
        packages.append('pygetwindow')
    
    for package in packages:
        print(f"  Installing {package}...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', package, '-q'],
                      capture_output=True)
    
    print("✓ Dependencies installed")


def test_imports():
    """Test if all required modules can be imported"""
    print("\n🔍 Checking imports...")
    
    modules = [
        'flask',
        'flask_cors',
        'flask_socketio',
        'socketio',
        'PIL',
        'pyautogui',
    ]
    
    failed = []
    for module in modules:
        try:
            __import__(module)
            print(f"  ✓ {module}")
        except ImportError as e:
            print(f"  ✗ {module}: {str(e)}")
            failed.append(module)
    
    if failed:
        print(f"\n❌ Failed to import: {', '.join(failed)}")
        return False
    
    print("\n✓ All imports OK")
    return True


def create_env_file():
    """Create .env file if it doesn't exist"""
    if os.path.exists('.env'):
        print("\n✓ .env file already exists")
        return
    
    print("\n📝 Creating .env file...")
    
    env_content = """# Lab Vision Grid Configuration

# Server Settings
FLASK_PORT=5000
FLASK_HOST=0.0.0.0
FLASK_ENV=development

# Device Type (true = teacher, false = student)
TEACHER_DEVICE=true
DEVICE_NAME=Teacher-PC-01

# Remote Control Settings
RC_ENABLED=true
RC_SCREENSHOT_INTERVAL=500
RC_MAX_SESSIONS=10
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✓ .env created")


def show_next_steps():
    """Show next steps for the user"""
    print("\n" + "="*60)
    print("🎉 Remote Control Setup Complete!")
    print("="*60)
    
    print("\n📖 Next Steps:")
    print("\n1️⃣  Start the Server:")
    print("   python main.py")
    
    print("\n2️⃣  Start Student Agent (on student PC):")
    print("   python backend/agents/student_agent.py http://server_ip:5000 student_id")
    
    print("\n3️⃣  Access Teacher Dashboard:")
    print("   http://localhost:5000")
    
    print("\n📚 Documentation:")
    print("   - Setup: REMOTE_CONTROL_GUIDE.md")
    print("   - Architecture: BACKEND_ARCHITECTURE.md")
    
    print("\n💡 Quick Test:")
    print("   python backend/agents/student_agent.py http://localhost:5000 test_student")
    
    print("\n" + "="*60)


def main():
    print("="*60)
    print("🚀 Lab Vision Grid - Remote Control Setup")
    print("="*60)
    
    try:
        check_python_version()
        install_dependencies()
        
        if not test_imports():
            print("\n❌ Setup failed - please install dependencies manually")
            sys.exit(1)
        
        create_env_file()
        show_next_steps()
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
