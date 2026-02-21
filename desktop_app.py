"""
Advanced pywebview + Flask desktop application
Runs Flask in a background thread and displays the UI via pywebview
"""

import os
import sys
import threading
import time
import webview
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path

class DesktopApp:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.setup_routes()
        self.dist_path = os.path.join(os.path.dirname(__file__), 'dist')
        
    def setup_routes(self):
        """Configure Flask routes"""
        
        @self.app.route('/api/health', methods=['GET'])
        def health():
            return jsonify({'status': 'ok'})
        
        @self.app.route('/api/python-info', methods=['GET'])
        def python_info():
            return jsonify({
                'python_version': sys.version,
                'platform': sys.platform,
                'working_directory': os.getcwd()
            })
        
        # Serve React frontend
        @self.app.route('/')
        def index():
            return send_from_directory(self.dist_path, 'index.html')
        
        @self.app.route('/<path:filename>')
        def serve_static(filename):
            return send_from_directory(self.dist_path, filename)
    
    def run_flask(self):
        """Run Flask in background thread"""
        self.app.run(debug=False, port=5000, use_reloader=False, threaded=True)
    
    def start(self):
        """Start the desktop application"""
        # Check if dist exists
        if not os.path.exists(self.dist_path):
            print("⚠️  Building React app first...")
            exit_code = os.system('npm run build')
            if exit_code != 0:
                print("❌ Build failed!")
                return
        
        # Start Flask in background thread
        flask_thread = threading.Thread(target=self.run_flask, daemon=True)
        flask_thread.start()
        
        # Give Flask time to start
        time.sleep(2)
        
        print("🚀 Starting Lab Vision Grid Desktop App...")
        print("📱 Opening window...")
        
        # Create and display pywebview window
        webview.create_window(
            title='Lab Vision Grid - Desktop',
            url='http://localhost:5000',
            width=1400,
            height=900
        )
        
        webview.start(debug=False)

if __name__ == '__main__':
    app = DesktopApp()
    app.start()
