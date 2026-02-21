#!/usr/bin/env python3
"""
Lab Vision Grid - সংযোগ পরীক্ষা স্ক্রিপ্ট
এটি টিচার সার্ভার এবং স্টুডেন্ট সংযোগ পরীক্ষা করে।
"""

import os
import sys
import socket
import subprocess
import requests
import json
from pathlib import Path
from dotenv import load_dotenv

# .env লোড করুন
load_dotenv()

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

def check_local_server():
    """স্থানীয় সার্ভার পরীক্ষা করুন"""
    print_header("স্থানীয় সার্ভার পরীক্ষা")
    
    local_port = os.getenv('FLASK_PORT', '5000')
    
    try:
        response = requests.get(
            f'http://localhost:{local_port}/api/health',
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("স্থানীয় সার্ভার চলছে")
            print(f"  স্ট্যাটাস: {data.get('status')}")
            print(f"  বার্তা: {data.get('message')}")
            if 'connected_students' in data:
                print(f"  সংযুক্ত স্টুডেন্ট: {data.get('connected_students')}")
            return True
        else:
            print_error(f"সার্ভার উত্তর নেই: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("নেটওয়ার্ক সংযোগ ব্যর্থ - সার্ভার চলছে না?")
        print_info("চেষ্টা করুন: python main.py")
        return False
    except Exception as e:
        print_error(f"পরীক্ষা ব্যর্থ: {e}")
        return False

def check_remote_server():
    """দূরবর্তী টিচার সার্ভার পরীক্ষা করুন (স্টুডেন্টের জন্য)"""
    print_header("দূরবর্তী সার্ভার পরীক্ষা")
    
    teacher_ip = os.getenv('TEACHER_SERVER_IP', '192.168.1.100')
    teacher_port = os.getenv('TEACHER_SERVER_PORT', '5000')
    
    print_info(f"টিচার সার্ভার: {teacher_ip}:{teacher_port}")
    
    # Ping করুন
    print_info("Ping করছি...")
    try:
        if sys.platform == 'win32':
            result = subprocess.run(['ping', '-n', '1', teacher_ip], 
                                    capture_output=True, text=True, timeout=5)
        else:
            result = subprocess.run(['ping', '-c', '1', teacher_ip], 
                                    capture_output=True, text=True, timeout=5)
        
        if result.returncode == 0:
            print_success(f"{teacher_ip} এ পৌঁছানো যায়")
        else:
            print_warning("Ping সাফল্যহীন - নেটওয়ার্ক সমস্যা হতে পারে")
    except Exception as e:
        print_error(f"Ping ব্যর্থ: {e}")
    
    # API পরীক্ষা করুন
    print_info("API পরীক্ষা করছি...")
    try:
        response = requests.get(
            f'http://{teacher_ip}:{teacher_port}/api/health',
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("দূরবর্তী সার্ভার পৌঁছানো যায়")
            print(f"  স্ট্যাটাস: {data.get('status')}")
            print(f"  সংযুক্ত স্টুডেন্ট: {data.get('connected_students')}")
            return True
        else:
            print_error(f"সার্ভার উত্তর নেই: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("সংযোগ ব্যর্থ")
        print_info(f"নিশ্চিত করুন: {teacher_ip} এ সার্ভার চলছে")
        return False
    except Exception as e:
        print_error(f"পরীক্ষা ব্যর্থ: {e}")
        return False

def check_network():
    """নেটওয়ার্ক সংযোগ পরীক্ষা করুন"""
    print_header("নেটওয়ার্ক তথ্য")
    
    # হোস্টনেম
    hostname = socket.gethostname()
    print_info(f"হোস্টনেম: {hostname}")
    
    # স্থানীয় IP
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        print_success(f"স্থানীয় IP: {local_ip}")
    except:
        print_warning("স্থানীয় IP খুঁজে পেতে পারেনি")
    
    # DNS রিজোলিউশন
    print_info("DNS রিজোলিউশন পরীক্ষা করছি...")
    try:
        ip = socket.gethostbyname('localhost')
        print_success(f"localhost বিশ্লেষণ করা যায়: {ip}")
    except:
        print_warning("DNS সমস্যা হতে পারে")

def test_student_registration():
    """স্টুডেন্ট নিবন্ধন পরীক্ষা করুন"""
    print_header("স্টুডেন্ট নিবন্ধন পরীক্ষা")
    
    student_id = os.getenv('STUDENT_ID', 'test_student_001')
    device_name = os.getenv('DEVICE_NAME', 'TestPC')
    teacher_ip = os.getenv('TEACHER_SERVER_IP', 'localhost')
    teacher_port = os.getenv('TEACHER_SERVER_PORT', '5000')
    
    api_url = f'http://{teacher_ip}:{teacher_port}/api/register-student'
    
    print_info(f"স্টুডেন্ট ID: {student_id}")
    print_info(f"ডিভাইসের নাম: {device_name}")
    print_info(f"API URL: {api_url}")
    
    try:
        payload = {
            'student_id': student_id,
            'device_name': device_name,
            'hostname': socket.gethostname()
        }
        
        print_info("স্টুডেন্ট নিবন্ধন করছি...")
        response = requests.post(api_url, json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success("স্টুডেন্ট সফলভাবে নিবন্ধিত হয়েছে")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            return True
        else:
            print_error(f"নিবন্ধন ব্যর্থ: HTTP {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print_error(f"নিবন্ধন পরীক্ষা ব্যর্থ: {e}")
        return False

def test_get_students():
    """সংযুক্ত স্টুডেন্ট তালিকা পান"""
    print_header("সংযুক্ত স্টুডেন্ট তালিকা")
    
    teacher_ip = os.getenv('TEACHER_SERVER_IP', 'localhost')
    teacher_port = os.getenv('TEACHER_SERVER_PORT', '5000')
    
    api_url = f'http://{teacher_ip}:{teacher_port}/api/students/list'
    print_info(f"API URL: {api_url}")
    
    try:
        print_info("সংযুক্ত স্টুডেন্ট লোড করছি...")
        response = requests.get(api_url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"মোট সংযুক্ত স্টুডেন্ট: {data.get('total')}")
            
            students = data.get('students', [])
            if students:
                print(f"\n{Colors.BOLD}সংযুক্ত স্টুডেন্টগুলি:{Colors.END}")
                for student in students:
                    print(f"  {Colors.CYAN}ID: {student.get('id')}{Colors.END}")
                    print(f"    নাম: {student.get('name')}")
                    print(f"    IP: {student.get('ip')}")
                    print(f"    স্ট্যাটাস: {student.get('status')}")
                    print(f"    সংযুক্ত: {student.get('connected_at')}")
            else:
                print_warning("কোনো সংযুক্ত স্টুডেন্ট নেই")
            return True
        else:
            print_error(f"পরীক্ষা ব্যর্থ: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"তালিকা পরীক্ষা ব্যর্থ: {e}")
        return False

def check_environment():
    """পরিবেশ ভেরিয়েবল পরীক্ষা করুন"""
    print_header("পরিবেশ কনফিগারেশন")
    
    is_teacher = os.getenv('TEACHER_DEVICE', 'true').lower() == 'true'
    device_name = os.getenv('DEVICE_NAME', 'Unknown')
    device_type = "টিচার" if is_teacher else "স্টুডেন্ট"
    
    print_success(f"ডিভাইস ধরন: {device_type}")
    print_info(f"ডিভাইসের নাম: {device_name}")
    
    if is_teacher:
        print_info(f"Flask পোর্ট: {os.getenv('FLASK_PORT', '5000')}")
        print_info(f"Flask হোস্ট: {os.getenv('FLASK_HOST', '0.0.0.0')}")
    else:
        print_info(f"টিচার IP: {os.getenv('TEACHER_SERVER_IP', 'সেট করা হয়নি')}")
        print_info(f"টিচার পোর্ট: {os.getenv('TEACHER_SERVER_PORT', '5000')}")
        print_info(f"স্টুডেন্ট ID: {os.getenv('STUDENT_ID', 'সেট করা হয়নি')}")

def run_all_tests():
    """সমস্ত পরীক্ষা চালান"""
    print_header("Lab Vision Grid - সংযোগ পরীক্ষা স্যুট")
    
    # পরিবেশ পরীক্ষা করুন
    check_environment()
    
    # নেটওয়ার্ক পরীক্ষা করুন
    check_network()
    
    # ডিভাইস ধরন অনুযায়ী পরীক্ষা করুন
    is_teacher = os.getenv('TEACHER_DEVICE', 'true').lower() == 'true'
    
    if is_teacher:
        print_header("টিচার মোড - পরীক্ষা")
        check_local_server()
        print("\nস্টুডেন্ট সংযোগ পরীক্ষা করতে:")
        print_info("স্টুডেন্ট পিসিতে এই স্ক্রিপ্ট চালান এবং আপনার IP দিন")
    else:
        print_header("স্টুডেন্ট মোড - পরীক্ষা")
        check_remote_server()
        test_student_registration()
        test_get_students()
    
    print_header("পরীক্ষা সম্পূর্ণ")

if __name__ == '__main__':
    try:
        if len(sys.argv) > 1:
            if sys.argv[1] == '--help' or sys.argv[1] == '-h':
                print("ব্যবহার: python test_connection.py [বিকল্প]")
                print("\nবিকল্প:")
                print("  (কোনো): সমস্ত পরীক্ষা চালান")
                print("  --local: স্থানীয় সার্ভার পরীক্ষা করুন")
                print("  --remote: দূরবর্তী সার্ভার পরীক্ষা করুন")
                print("  --network: নেটওয়ার্ক পরীক্ষা করুন")
                print("  --register: স্টুডেন্ট রেজিস্ট্রেশন পরীক্ষা করুন")
                print("  --list: সংযুক্ত স্টুডেন্ট তালিকা পান")
            elif sys.argv[1] == '--local':
                check_local_server()
            elif sys.argv[1] == '--remote':
                check_remote_server()
            elif sys.argv[1] == '--network':
                check_network()
            elif sys.argv[1] == '--register':
                test_student_registration()
            elif sys.argv[1] == '--list':
                test_get_students()
        else:
            run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}পরীক্ষা বাতিল করা হয়েছে{Colors.END}")
        sys.exit(1)
    except Exception as e:
        print_error(f"পরীক্ষা ত্রুটি: {e}")
        sys.exit(1)
