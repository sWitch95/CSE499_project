#!/usr/bin/env python3
"""
Lab Vision Grid - দ্রুত সেটআপ স্ক্রিপ্ট
এটি টিচার এবং স্টুডেন্ট পিসির সেটআপ প্রক্রিয়া সহজ করে।
"""

import os
import sys
import subprocess
import platform
import socket
from pathlib import Path

# রঙিন আউটপুটের জন্য
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^60}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.CYAN}ℹ {text}{Colors.END}")

def get_local_ip():
    """স্থানীয় আইপি অ্যাড্রেস পান"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def check_python():
    """Python ইন্সটল করা আছে কিনা পরীক্ষা করুন"""
    print_info(f"Python সংস্করণ: {sys.version}")
    if sys.version_info < (3, 8):
        print_error("Python 3.8+ প্রয়োজন!")
        return False
    print_success("Python সংস্করণ উপযুক্ত")
    return True

def check_node():
    """Node.js ইন্সটল করা আছে কিনা পরীক্ষা করুন"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        print_info(f"Node.js সংস্করণ: {result.stdout.strip()}")
        print_success("Node.js ইন্সটল করা আছে")
        return True
    except:
        print_error("Node.js ইন্সটল করা নেই!")
        print_warning("https://nodejs.org থেকে ডাউনলোড করুন")
        return False

def check_git():
    """Git ইন্সটল করা আছে কিনা পরীক্ষা করুন"""
    try:
        result = subprocess.run(['git', '--version'], capture_output=True, text=True)
        print_success("Git ইন্সটল করা আছে")
        return True
    except:
        print_warning("Git ইন্সটল করা নেই (ঐচ্ছিক)")
        return False

def install_python_dependencies():
    """Python ডিপেন্ডেন্সি ইন্সটল করুন"""
    print_header("Python ডিপেন্ডেন্সি ইন্সটল করছি")
    
    if not os.path.exists('requirements.txt'):
        print_error("requirements.txt পাওয়া যায় নি")
        return False
    
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
        print_success("Python ডিপেন্ডেন্সি ইন্সটল সম্পূর্ণ")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"ইন্সটলেশন ব্যর্থ: {e}")
        return False

def install_node_dependencies():
    """Node.js ডিপেন্ডেন্সি ইন্সটল করুন"""
    print_header("Node.js ডিপেন্ডেন্সি ইন্সটল করছি")
    
    if not os.path.exists('package.json'):
        print_error("package.json পাওয়া যায় নি")
        return False
    
    try:
        subprocess.run(['npm', 'install'], check=True)
        print_success("Node.js ডিপেন্ডেন্সি ইন্সটল সম্পূর্ণ")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"ইন্সটলেশন ব্যর্থ: {e}")
        return False

def create_env_file(is_teacher=True):
    """কনফিগারেশন ফাইল তৈরি করুন"""
    print_header("পরিবেশ কনফিগারেশন সেটআপ")
    
    env_path = Path('.env')
    
    if is_teacher:
        print_info("টিচার পিসির জন্য কনফিগারেশন তৈরি করছি...")
        local_ip = get_local_ip()
        
        env_content = f"""# টিচার পিসি কনফিগারেশন
TEACHER_DEVICE=true
DEVICE_NAME=TeacherPC-{local_ip.split('.')[-1]}
FLASK_ENV=production
FLASK_PORT=5000
FLASK_HOST=0.0.0.0
FLASK_CORS_ORIGINS=*
LOG_LEVEL=INFO
VITE_PORT=8080
"""
        print_info(f"টিচার IP: {Colors.BOLD}{local_ip}{Colors.END}")
        print_warning("স্টুডেন্টদের এই IP দিন")
        
    else:
        teacher_ip = input(f"{Colors.BOLD}টিচার পিসির IP (192.168.x.x): {Colors.END}").strip()
        if not teacher_ip:
            teacher_ip = "192.168.1.100"
            print_warning(f"ডিফল্ট IP ব্যবহার করছি: {teacher_ip}")
        
        student_id = input(f"{Colors.BOLD}স্টুডেন্ট আইডি (student001): {Colors.END}").strip()
        if not student_id:
            student_id = "student001"
        
        print_info("স্টুডেন্ট পিসির জন্য কনফিগারেশন তৈরি করছি...")
        
        env_content = f"""# স্টুডেন্ট পিসি কনফিগারেশন
TEACHER_DEVICE=false
STUDENT_ID={student_id}
DEVICE_NAME=StudentPC-{student_id}
TEACHER_SERVER_IP={teacher_ip}
TEACHER_SERVER_PORT=5000
API_BASE_URL=http://{teacher_ip}:5000
AUTO_RECONNECT=true
RECONNECT_INTERVAL=5000
LOG_LEVEL=INFO
"""
    
    env_path.write_text(env_content)
    print_success(f".env ফাইল তৈরি হয়েছে")
    return True

def setup_firewall():
    """Windows ফায়ারওয়াল সেটআপ করুন"""
    if platform.system() != 'Windows':
        return True
    
    print_header("ফায়ারওয়াল কনফিগারেশন")
    
    if os.name != 'nt':
        print_warning("Windows জন্য ফায়ারওয়াল কনফিগারেশন প্রয়োজন")
        return True
    
    print_warning("নিম্নলিখিত কমান্ড প্রশাসক হিসাবে চালান:")
    print(f"{Colors.BOLD}netsh advfirewall firewall add rule name=\"Lab Vision Grid\" dir=in action=allow protocol=tcp localport=5000{Colors.END}")
    print(f"{Colors.BOLD}netsh advfirewall firewall add rule name=\"Lab Vision Grid Dev\" dir=in action=allow protocol=tcp localport=8080{Colors.END}")
    
    return True

def run_setup():
    """সম্পূর্ণ সেটআপ রান করুন"""
    print_header("Lab Vision Grid - দ্রুত সেটআপ স্ক্রিপ্ট")
    
    # প্রি-চেক
    print_header("প্রয়োজনীয় সফটওয়্যার পরীক্ষা করছি")
    
    if not check_python():
        print_error("সেটআপ ব্যর্থ: Python প্রয়োজন")
        return False
    
    if not check_node():
        print_error("সেটআপ ব্যর্থ: Node.js প্রয়োজন")
        return False
    
    check_git()
    
    # ডিভাইস প্রকার নির্বাচন
    print_header("ডিভাইসের ধরন নির্বাচন করুন")
    print(f"{Colors.BOLD}1. টিচার পিসি{Colors.END}")
    print(f"{Colors.BOLD}2. স্টুডেন্ট পিসি{Colors.END}")
    
    choice = input(f"\n{Colors.BOLD}আপনার পছন্দ (1/2): {Colors.END}").strip()
    is_teacher = choice == '1'
    
    # ডিপেন্ডেন্সি ইন্সটলেশন
    if not install_python_dependencies():
        return False
    
    if not install_node_dependencies():
        return False
    
    # পরিবেশ ফাইল তৈরি
    if not create_env_file(is_teacher):
        return False
    
    # ফায়ারওয়াল সেটআপ
    setup_firewall()
    
    # সম্পূর্ণতার বার্তা
    print_header("সেটআপ সম্পূর্ণ!")
    
    if is_teacher:
        print(f"{Colors.BOLD}টিচার পিসি শুরু করতে:{Colors.END}")
        print(f"  {Colors.CYAN}npm run build{Colors.END}")
        print(f"  {Colors.CYAN}npm run desktop{Colors.END}")
        print(f"\n অথবা ডেভেলপমেন্ট মোডে:")
        print(f"  {Colors.CYAN}npm run dev{Colors.END} (একটি টার্মিনালে)")
        print(f"  {Colors.CYAN}python main.py{Colors.END} (অন্য টার্মিনালে)")
    else:
        print(f"{Colors.BOLD}স্টুডেন্ট পিসি শুরু করতে:{Colors.END}")
        print(f"  {Colors.CYAN}npm run dev{Colors.END}")
        print(f"\n ব্রাউজারে খুলুন: {Colors.CYAN}http://localhost:8080{Colors.END}")
    
    return True

if __name__ == '__main__':
    try:
        success = run_setup()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}সেটআপ বাতিল করা হয়েছে{Colors.END}")
        sys.exit(1)
    except Exception as e:
        print_error(f"সেটআপ ত্রুটি: {e}")
        sys.exit(1)
