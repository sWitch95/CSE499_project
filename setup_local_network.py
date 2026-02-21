#!/usr/bin/env python3
"""
Local Network Setup - দ্রুত সেটআপ সরঞ্জাম
এটি টিচার এবং স্টুডেন্ট উভয় মোডেই কাজ করে
"""

import os
import sys
import socket
import subprocess
from pathlib import Path

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
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^70}{Colors.END}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.CYAN}ℹ {text}{Colors.END}")

def get_local_ip():
    """স্থানীয় IP অ্যাড্রেস পান"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def create_teacher_env():
    """টিচার মোডের জন্য .env ফাইল তৈরি করুন"""
    print_header("টিচার ল্যাপটপ - .env কনফিগারেশন")
    
    local_ip = get_local_ip()
    
    env_content = f"""# ==================== টিচার কনফিগারেশন ====================
# এটি টিচার ল্যাপটপ/ডেস্কটপের জন্য

# ডিভাইস ধরন (IMPORTANT!)
TEACHER_DEVICE=true

# ডিভাইসের নাম
DEVICE_NAME=TeacherLaptop-01

# Flask সার্ভার সেটিংস (IMPORTANT!)
FLASK_PORT=5000
FLASK_HOST=0.0.0.0

# পরিবেশ
ENVIRONMENT=development
DEBUG=true

# ডাটাবেস (Development)
DATABASE_ENGINE=sqlite
SQLITE_DB=backend/lab_vision_grid.db

# CORS (সব ক্লায়েন্ট অনুমতি)
CORS_ORIGINS=*

# JWT (Development key)
JWT_SECRET_KEY=teacher-dev-secret-key-change-in-production

# Logging
LOG_LEVEL=INFO

# ==================== তথ্য ====================
# আপনার IP: {local_ip}
# স্টুডেন্টরা কানেক্ট করবে: {local_ip}:5000
# ডাটাবেস: {LOCAL_IP}D ডিভাইসে SQLite
"""
    
    env_path = Path('.env')
    env_path.write_text(env_content)
    
    print_success(f".env ফাইল তৈরি হয়েছে")
    print_info(f"আপনার IP: {Colors.BOLD}{local_ip}{Colors.END}")
    print_warning(f"এই IP স্টুডেন্টদের বলুন: {Colors.BOLD}{local_ip}{Colors.END}")
    
    return local_ip

def create_student_env():
    """স্টুডেন্ট মোডের জন্য .env ফাইল তৈরি করুন"""
    print_header("স্টুডেন্ট পিসি - .env কনফিগারেশন")
    
    # টিচার IP ইনপুট করান
    teacher_ip = input(f"\n{Colors.BOLD}টিচার ল্যাপটপের IP ইনপুট করুন (উদাহরণ: 192.168.0.100): {Colors.END}").strip()
    
    if not teacher_ip:
        teacher_ip = "192.168.1.100"
        print_warning(f"ডিফল্ট IP ব্যবহার করছি: {teacher_ip}")
    
    # স্টুডেন্ট ID ইনপুট করান
    student_id = input(f"\n{Colors.BOLD}স্টুডেন্ট ID (উদাহরণ: student001): {Colors.END}").strip()
    
    if not student_id:
        student_id = "student001"
    
    student_name = input(f"\n{Colors.BOLD}ডিভাইসের নাম (উদাহরণ: StudentPC-01): {Colors.END}").strip()
    
    if not student_name:
        student_name = "StudentPC-01"
    
    env_content = f"""# ==================== স্টুডেন্ট কনফিগারেশন ====================
# এটি স্টুডেন্ট পিসি/ল্যাপটপের জন্য

# ডিভাইস ধরন (IMPORTANT!)
TEACHER_DEVICE=false

# স্টুডেন্ট তথ্য
STUDENT_ID={student_id}
DEVICE_NAME={student_name}

# টিচার সার্ভার কানেকশন (IMPORTANT!)
TEACHER_SERVER_IP={teacher_ip}
TEACHER_SERVER_PORT=5000
API_BASE_URL=http://{teacher_ip}:5000

# স্বয়ংক্রিয় পুনঃসংযোগ
AUTO_RECONNECT=true
RECONNECT_INTERVAL=5000

# সংযোগ টাইমআউট
CONNECTION_TIMEOUT=10000

# পরিবেশ
ENVIRONMENT=development
DEBUG=true

# ডাটাবেস (Development)
DATABASE_ENGINE=sqlite
SQLITE_DB=backend/lab_vision_grid.db

# React Dev সার্ভার
VITE_PORT=8080

# JWT (Development key)
JWT_SECRET_KEY=student-dev-secret-key-change-in-production

# Logging
LOG_LEVEL=INFO

# ==================== তথ্য ====================
# টিচার সার্ভার: {teacher_ip}:5000
# স্টুডেন্ট ID: {student_id}
# ডিভাইসের নাম: {student_name}
# ব্রাউজার URL: http://localhost:8080
"""
    
    env_path = Path('.env')
    env_path.write_text(env_content)
    
    print_success(f".env ফাইল তৈরি হয়েছে")
    print_info(f"টিচার IP: {Colors.BOLD}{teacher_ip}{Colors.END}")
    print_info(f"স্টুডেন্ট ID: {Colors.BOLD}{student_id}{Colors.END}")
    print_info(f"ডিভাইস নাম: {Colors.BOLD}{student_name}{Colors.END}")

def setup_firewall():
    """Windows ফায়ারওয়াল সেটআপ"""
    print_header("ফায়ারওয়াল কনফিগারেশন")
    
    if sys.platform != "win32":
        print_warning("Windows ফায়ারওয়াল সেটআপ শুধুমাত্র Windows এ উপলব্ধ")
        return
    
    print_info("নিম্নলিখিত কমান্ড প্রশাসক হিসেবে চালান:")
    print()
    
    cmd1 = 'netsh advfirewall firewall add rule name="Lab Vision Grid" dir=in action=allow protocol=tcp localport=5000'
    cmd2 = 'netsh advfirewall firewall add rule name="Flask Backend" dir=in action=allow protocol=tcp localport=5000'
    
    print(f"{Colors.BOLD}{cmd1}{Colors.END}")
    print("অথবা")
    print(f"{Colors.BOLD}{cmd2}{Colors.END}")
    print()
    
    response = input(f"{Colors.BOLD}এখনই ফায়ারওয়াল রুল যোগ করুন? (y/n): {Colors.END}").lower()
    
    if response == 'y':
        try:
            subprocess.run(['powershell', '-Command', f'netsh advfirewall firewall add rule name="Lab Vision Grid" dir=in action=allow protocol=tcp localport=5000'], check=True)
            print_success("ফায়ারওয়াল রুল যোগ করা হয়েছে")
        except Exception as e:
            print_error(f"ফায়ারওয়াল সেটআপ ব্যর্থ: {e}")
            print_info("প্রশাসক হিসেবে চালান এবং আবার চেষ্টা করুন")

def setup_dependencies():
    """ডিপেন্ডেন্সি ইনস্টল করুন"""
    print_header("ডিপেন্ডেন্সি ইনস্টল করছি")
    
    print_info("Python প্যাকেজ ইনস্টল করছি...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
        print_success("Python প্যাকেজ ইনস্টল সম্পূর্ণ")
    except subprocess.CalledProcessError:
        print_error("Python প্যাকেজ ইনস্টল ব্যর্থ")
        return False
    
    print_info("Node.js প্যাকেজ ইনস্টল করছি...")
    try:
        subprocess.run(['npm', 'install'], check=True)
        print_success("Node.js প্যাকেজ ইনস্টল সম্পূর্ণ")
    except subprocess.CalledProcessError:
        print_error("Node.js প্যাকেজ ইনস্টল ব্যর্থ")
        return False
    
    return True

def run_teacher_setup():
    """টিচার সেটআপ"""
    print_header("টিচার ল্যাপটপ সেটআপ")
    
    # .env তৈরি করুন
    teacher_ip = create_teacher_env()
    
    # ডিপেন্ডেন্সি ইনস্টল করুন
    if not setup_dependencies():
        return False
    
    # ফায়ারওয়াল সেটআপ করুন
    setup_firewall()
    
    # সেটআপ সম্পূর্ণ
    print_header("টিচার সেটআপ সম্পূর্ণ!")
    print()
    print(f"{Colors.BOLD}পরবর্তী ধাপগুলি:{Colors.END}")
    print(f"  1. React বিল্ড করুন:")
    print(f"     {Colors.CYAN}npm run build{Colors.END}")
    print()
    print(f"  २. সার্ভার চালু করুন:")
    print(f"     {Colors.CYAN}python main.py{Colors.END}")
    print()
    print(f"  ३. গুরুত্বপূর্ণ: {Colors.BOLD}টিশার IP স্টুডেন্টদের বলুন:{Colors.END}")
    print(f"     {Colors.BOLD}{teacher_ip}{Colors.END}")
    print()

def run_student_setup():
    """স্টুডেন্ট সেটআপ"""
    print_header("স্টুডেন্ট পিসি সেটআপ")
    
    # .env তৈরি করুন
    create_student_env()
    
    # ডিপেন্ডেন্সি ইনস্টল করুন
    if not setup_dependencies():
        return False
    
    # সেটআপ সম্পূর্ণ
    print_header("স্টুডেন্ট সেটআপ সম্পূর্ণ!")
    print()
    print(f"{Colors.BOLD}পরবর্তী ধাপগুলি:{Colors.END}")
    print(f"  1. হার্টবীট পরীক্ষা করুন:")
    print(f"     {Colors.CYAN}python test_connection.py{Colors.END}")
    print()
    print(f"  २. ডেভ সার্ভার চালু করুন:")
    print(f"     {Colors.CYAN}npm run dev{Colors.END}")
    print()
    print(f"  ३. ব্রাউজারে খুলুন:")
    print(f"     {Colors.CYAN}http://localhost:8080{Colors.END}")
    print()

def main():
    """মূল প্রোগ্রাম"""
    print_header("Lab Vision Grid - লোকাল নেটওয়ার্ক সেটআপ")
    
    print(f"{Colors.BOLD}ডিভাইসের ধরন নির্বাচন করুন:{Colors.END}")
    print(f"  {Colors.CYAN}1. টিচার ল্যাপটপ{Colors.END} (সার্ভার হবে)")
    print(f"  {Colors.CYAN}२. স্টুডেন্ট পিসি{Colors.END} (ক্লায়েন্ট হবে)")
    print()
    
    choice = input(f"{Colors.BOLD}আপনার পছন্দ (1/२): {Colors.END}").strip()
    
    if choice == '1':
        run_teacher_setup()
    elif choice == '२' or choice == '2':
        run_student_setup()
    else:
        print_error("অবৈধ পছন্দ। পুনরায় চালান।")
        return

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}সেটআপ বাতিল করা হয়েছে{Colors.END}")
        sys.exit(0)
    except Exception as e:
        print_error(f"সেটআপ ত্রুটি: {e}")
        sys.exit(1)
