"""
API endpoints for Python backend
Import these blueprints in your Flask app
"""

from flask import Blueprint, jsonify, request
import subprocess
import platform
from datetime import datetime
from typing import Dict, List, Optional

# In-memory student registry (ফলস্বরূপ সার্ভার পুনরায় চালু হলে সাফ হবে)
# উৎপাদনের জন্য ডেটাবেস ব্যবহার করুন
connected_students: Dict[str, dict] = {}

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/system-info', methods=['GET'])
def system_info():
    """Get system information"""
    return jsonify({
        'os': platform.system(),
        'architecture': platform.machine(),
        'processor_count': subprocess.check_output(['wmic', 'logicaldisk', 'get', 'size']).decode().strip() if platform.system() == 'Windows' else 'N/A'
    })

@api_bp.route('/file-operations/list', methods=['POST'])
def list_files():
    """List files in a directory"""
    data = request.json
    path = data.get('path', '.')
    try:
        import os
        files = os.listdir(path)
        return jsonify({'files': files, 'path': path})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api_bp.route('/execute-command', methods=['POST'])
def execute_command():
    """Execute a shell command (be careful with this!)"""
    data = request.json
    command = data.get('command', '')
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=10)
        return jsonify({
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Add more endpoints as needed
# ==================== স্টুডেন্ট সংযোগ এন্ডপয়েন্টস ====================

@api_bp.route('/register-student', methods=['POST'])
def register_student():
    """
    স্টুডেন্ট ডিভাইসকে রেজিস্টার করুন এবং সংযোগ ট্র্যাক করুন
    """
    try:
        data = request.json
        student_id = data.get('student_id')
        device_name = data.get('device_name')
        hostname = data.get('hostname', 'unknown')
        
        if not student_id:
            return jsonify({'error': 'student_id প্রয়োজন'}), 400
        
        # স্টুডেন্ট তথ্য সংরক্ষণ করুন
        connected_students[student_id] = {
            'student_id': student_id,
            'device_name': device_name or f'StudentPC-{student_id}',
            'ip_address': request.remote_addr,
            'hostname': hostname,
            'connected_at': datetime.now().isoformat(),
            'last_seen': datetime.now().isoformat(),
            'status': 'online'
        }
        
        return jsonify({
            'status': 'registered',
            'student_id': student_id,
            'device_name': connected_students[student_id]['device_name'],
            'message': f'{student_id} সফলভাবে সংযুক্ত হয়েছে'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/student-heartbeat/<student_id>', methods=['POST'])
def student_heartbeat(student_id):
    """
    স্টুডেন্ট থেকে হার্টবিট পান (সংযোগ সক্রিয় আছে তা নিশ্চিত করতে)
    """
    try:
        if student_id not in connected_students:
            return jsonify({'error': 'স্টুডেন্ট পাওয়া যায়নি'}), 404
        
        data = request.json
        connected_students[student_id]['last_seen'] = datetime.now().isoformat()
        connected_students[student_id]['status'] = data.get('status', 'online')
        
        return jsonify({
            'status': 'ok',
            'message': 'হার্টবিট গৃহীত হয়েছে'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/students/list', methods=['GET'])
def get_connected_students():
    """
    সমস্ত সংযুক্ত স্টুডেন্টের তালিকা পান
    """
    try:
        # সংযুক্ত স্টুডেন্টদের সক্রিয় সংযোগের তথ্য সহ রিটার্ন করুন
        active_students = [
            {
                'id': student_id,
                'name': info.get('device_name'),
                'ip': info.get('ip_address'),
                'status': info.get('status'),
                'connected_at': info.get('connected_at'),
                'last_seen': info.get('last_seen'),
                'hostname': info.get('hostname')
            }
            for student_id, info in connected_students.items()
        ]
        
        return jsonify({
            'total': len(active_students),
            'students': active_students
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/students/<student_id>', methods=['GET'])
def get_student_info(student_id):
    """
    একটি নির্দিষ্ট স্টুডেন্টের তথ্য পান
    """
    try:
        if student_id not in connected_students:
            return jsonify({'error': 'স্টুডেন্ট পাওয়া যায়নি'}), 404
        
        info = connected_students[student_id]
        return jsonify({
            'student_id': student_id,
            'device_name': info.get('device_name'),
            'ip_address': info.get('ip_address'),
            'status': info.get('status'),
            'connected_at': info.get('connected_at'),
            'last_seen': info.get('last_seen'),
            'hostname': info.get('hostname')
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/students/<student_id>/disconnect', methods=['POST'])
def disconnect_student(student_id):
    """
    একটি স্টুডেন্টকে ডিসকানেক্ট করুন
    """
    try:
        if student_id in connected_students:
            del connected_students[student_id]
            return jsonify({
                'status': 'disconnected',
                'student_id': student_id,
                'message': f'{student_id} ডিসকানেক্ট হয়েছে'
            }), 200
        return jsonify({'error': 'স্টুডেন্ট পাওয়া যায়নি'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/students/status/<student_id>', methods=['POST'])
def update_student_status(student_id):
    """
    স্টুডেন্টের স্ট্যাটাস আপডেট করুন (অ্যাপ্লিকেশন, স্ক্রিন শেয়ার, ইত্যাদি)
    """
    try:
        if student_id not in connected_students:
            return jsonify({'error': 'স্টুডেন্ট পাওয়া যায়নি'}), 404
        
        data = request.json
        connected_students[student_id].update({
            'last_seen': datetime.now().isoformat(),
            'app_info': data.get('app_info'),
            'screen_active': data.get('screen_active'),
            'activity': data.get('activity')
        })
        
        return jsonify({
            'status': 'updated',
            'student_id': student_id
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/health', methods=['GET'])
def health():
    """স্বাস্থ্য পরীক্ষা - একটি সাধারণ পরীক্ষা যে সার্ভার চলছে কিনা"""
    return jsonify({
        'status': 'ok',
        'message': 'সার্ভার চলছে',
        'connected_students': len(connected_students)
    }), 200