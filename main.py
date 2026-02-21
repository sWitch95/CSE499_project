import os
import sys
import webview
import threading
import time
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from pathlib import Path
from backend.api import api_bp  # API ব্লুপ্রিন্ট ইম্পোর্ট করুন

# Flask অ্যাপ ইনিশিয়ালাইজ করুন
app = Flask(__name__, 
            static_folder=os.path.join(os.path.dirname(__file__), 'dist'),
            static_url_path='/')

# CORS সক্ষম করুন সমস্ত অরিজিন থেকে অনুরোধ গ্রহণ করতে
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
})

# Flask-SocketIO ইনিশিয়ালাইজ করুন (Remote Control এবং Real-time কমিউনিকেশনের জন্য)
socketio = SocketIO(app, cors_allowed_origins="*")

# API ব্লুপ্রিন্ট রেজিস্টার করুন
app.register_blueprint(api_bp)

# Remote Control WebSocket ইভেন্ট রেজিস্টার করুন
from backend.routes.websocket.remote_control import register_remote_control_events
register_remote_control_events(socketio)

# স্বাস্থ্য পরীক্ষা এন্ডপয়েন্ট
@app.route('/api/health', methods=['GET'])
def health():
    """স্বাস্থ্য পরীক্ষা এন্ডপয়েন্ট"""
    return jsonify({'status': 'ok', 'message': 'সার্ভার চলছে - Lab Vision Grid'})

@app.route('/api/python-info', methods=['GET'])
def python_info():
    """Python সংস্করণ এবং সিস্টেম তথ্য রিটার্ন করুন"""
    return jsonify({
        'python_version': sys.version,
        'platform': sys.platform
    })

@app.route('/')
def index():
    """React অ্যাপ পরিবেশন করুন"""
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def serve_static(path):
    """স্ট্যাটিক ফাইল পরিবেশন করুন, React রাউটিংয়ের জন্য index.html এ ফিরে যান"""
    file_path = os.path.join(app.static_folder, path)
    
    if os.path.isfile(file_path):
        return app.send_static_file(path)
    return app.send_static_file('index.html')

def create_app():
    """Flask অ্যাপ তৈরি এবং কনফিগার করুন"""
    return app

def start_server():
    """Flask ডেভেলপমেন্ট সার্ভার এবং WebSocket চালু করুন"""
    # নেটওয়ার্কের সমস্ত ইন্টারফেসে শোনুন (0.0.0.0)
    socketio.run(app, debug=False, port=5000, host='0.0.0.0', use_reloader=False, allow_unsafe_werkzeug=True)

if __name__ == '__main__':
    # সার্ভার টাইপ চেক করুন (টিচার বা স্টুডেন্ট)
    is_teacher = os.getenv('TEACHER_DEVICE', 'true').lower() == 'true'
    device_name = os.getenv('DEVICE_NAME', 'Lab Vision Grid PC')
    
    # dist ফোল্ডার চেক করুন
    dist_path = os.path.join(os.path.dirname(__file__), 'dist')
    
    if not os.path.exists(dist_path):
        print("⚠️  'dist' ফোল্ডার পাওয়া যায় নি। অনুগ্রহ করে প্রথমে 'npm run build' চালান।")
        print("React অ্যাপ তৈরি করছি...")
        exit_code = os.system('npm run build')
        if exit_code != 0:
            print("❌ বিল্ড ব্যর্থ হয়েছে!")
            sys.exit(1)
    
    if is_teacher:
        print("=" * 60)
        print("🎓 টিচার মোড - Lab Vision Grid")
        print("=" * 60)
        print(f"📱 ডিভাইসের নাম: {device_name}")
        print("🚀 Flask সার্ভার চালু করছি...")
        print("📡 পোর্ট: 5000")
        print("🌐 সমস্ত ইন্টারফেসে শোনছি (0.0.0.0)")
        print("=" * 60)
    else:
        print("=" * 60)
        print("👨‍🎓 স্টুডেন্ট মোড - Lab Vision Grid")
        print("=" * 60)
        print(f"📱 ডিভাইসের নাম: {device_name}")
        print("⏳ টিচার সার্ভারের সাথে সংযোগ করার চেষ্টা করছি...")
        print("=" * 60)
    
    # Flask সার্ভার ব্যাকগ্রাউন্ড থ্রেডে চালু করুন
    flask_thread = threading.Thread(target=start_server, daemon=True)
    flask_thread.start()
    
    # Flask সার্ভারকে শুরু করার সময় দিন
    time.sleep(2)
    
    print("📱 ডেস্কটপ উইন্ডো খুলছি...")
    
    # Webview উইন্ডো তৈরি করুন
    webview.create_window(
        title='Lab Vision Grid',
        url='http://localhost:5000',
        width=1400,
        height=900
    )
    
    webview.start(debug=False)

