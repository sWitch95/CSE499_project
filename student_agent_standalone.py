#!/usr/bin/env python3
"""
Student PC Standalone Agent - Copy this to student computer and run it
Requirements: pip install python-socketio websocket-client python-engineio pyautogui
"""

import socketio
import logging
import json
import base64
import time
from typing import Dict, Any
from threading import Thread
import platform

# Optional imports
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== CONFIGURATION ====================
# Change these values for your setup
SERVER_URL = "http://172.20.133.166:5000"  # Teacher PC IP address
STUDENT_ID = "1234567"                     # Unique student ID
STUDENT_NAME = "Aqib"                      # Student name
# ====================================================

# Conditionally import libraries
try:
    import pyautogui
    pyautogui.FAILSAFE = False
    PYAUTOGUI_AVAILABLE = True
except ImportError:
    PYAUTOGUI_AVAILABLE = False
    logger.warning("⚠️  pyautogui not available - install with: pip install pyautogui")

try:
    from PIL import ImageGrab
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logger.warning("⚠️  PIL not available - install with: pip install pillow")


class StudentRemoteControlAgent:
    """Student PC agent for remote control"""
    
    def __init__(self, server_url: str, student_id: str, student_name: str = None):
        self.server_url = server_url
        self.student_id = student_id
        self.student_name = student_name or f"Student-{student_id}"
        
        self.sio = socketio.Client()
        self.is_connected = False
        self.active_session_id = None
        
        self._setup_event_handlers()
    
    def _setup_event_handlers(self):
        """Setup WebSocket event handlers"""
        
        @self.sio.on('rc:connected')
        def on_connected(data):
            logger.info(f"✅ Connected to server: {data}")
            self.is_connected = True
            self._send_heartbeat()
        
        @self.sio.on('rc:control_request')
        def on_control_request(data):
            """Receive control request from teacher"""
            session_id = data.get('session_id')
            teacher_id = data.get('teacher_id')
            logger.info(f"📱 Control request from {teacher_id} (session: {session_id})")
            self.active_session_id = session_id
        
        @self.sio.on('rc:execute_command')
        def on_execute_command(data):
            """Execute a remote control command"""
            try:
                command_id = data.get('command_id')
                control_type = data.get('control_type')
                payload = data.get('payload', {})
                
                logger.debug(f"⚡ Executing command {command_id}: {control_type}")
                
                # Execute the command
                result = self._execute_control_command(control_type, payload)
                
                # Send result back
                self.sio.emit('rc:command_result', {
                    'student_id': self.student_id,
                    'command_id': command_id,
                    'status': 'completed',
                    'result': result
                })
                
            except Exception as e:
                logger.error(f"❌ Error executing command: {str(e)}")
                self.sio.emit('rc:command_result', {
                    'student_id': self.student_id,
                    'command_id': data.get('command_id'),
                    'status': 'error',
                    'error': str(e)
                })
    
    def _execute_control_command(self, control_type: str, payload: Dict) -> Dict:
        """Execute a remote control command"""
        
        if not PYAUTOGUI_AVAILABLE:
            return {'status': 'error', 'message': 'pyautogui not available'}
        
        try:
            if control_type == 'mouse_move':
                x = payload.get('x', 0)
                y = payload.get('y', 0)
                pyautogui.moveTo(x, y, duration=0.1)
                return {'status': 'ok'}
            
            elif control_type == 'mouse_click':
                x = payload.get('x', 0)
                y = payload.get('y', 0)
                button = payload.get('button', 'left')
                pyautogui.click(x, y, button=button)
                return {'status': 'ok'}
            
            elif control_type == 'mouse_scroll':
                x = payload.get('x', 0)
                y = payload.get('y', 0)
                amount = payload.get('amount', 3)
                pyautogui.moveTo(x, y)
                pyautogui.scroll(amount)
                return {'status': 'ok'}
            
            elif control_type == 'key_press':
                key = payload.get('key', '')
                pyautogui.press(key)
                return {'status': 'ok'}
            
            elif control_type == 'type_text':
                text = payload.get('text', '')
                pyautogui.typewrite(text, interval=0.05)
                return {'status': 'ok'}
            
            elif control_type == 'screenshot':
                return self._take_screenshot()
            
            else:
                return {'status': 'error', 'message': f'Unknown command: {control_type}'}
        
        except Exception as e:
            logger.error(f"Command error: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def _take_screenshot(self) -> Dict:
        """Take a screenshot and return as base64"""
        if not PIL_AVAILABLE:
            return {'status': 'error', 'message': 'PIL not available for screenshots'}
        
        try:
            # Capture screen
            screenshot = ImageGrab.grab()
            
            # Resize to max 1280x720 for bandwidth
            screenshot.thumbnail((1280, 720))
            
            # Convert to JPEG and encode
            import io
            buffer = io.BytesIO()
            screenshot.save(buffer, format='JPEG', quality=85)
            
            # Encode to base64
            img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return {
                'status': 'ok',
                'image': img_base64,
                'width': screenshot.width,
                'height': screenshot.height
            }
        except Exception as e:
            logger.error(f"Screenshot error: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def connect(self, max_retries: int = 5) -> bool:
        """Connect to the server"""
        for attempt in range(max_retries):
            try:
                logger.info(f"🔌 Connecting to {self.server_url} (attempt {attempt + 1}/{max_retries})")
                self.sio.connect(self.server_url, auth={'student_id': self.student_id})
                
                # Register with server via WebSocket
                self.sio.emit('rc:connect', {
                    'user_id': self.student_id,
                    'user_type': 'student',
                    'name': self.student_name
                })
                
                # Also register via HTTP API so student appears in /api/students/list
                if REQUESTS_AVAILABLE:
                    try:
                        hostname = platform.node()
                        base_url = self.server_url.replace('ws://', 'http://').replace('wss://', 'https://')
                        register_url = f"{base_url}/api/register-student"
                        
                        response = requests.post(register_url, json={
                            'student_id': self.student_id,
                            'device_name': self.student_name,
                            'hostname': hostname
                        }, timeout=5)
                        
                        if response.status_code == 200:
                            logger.info(f"✅ Registered with HTTP API")
                        else:
                            logger.warning(f"HTTP registration status: {response.status_code}")
                    except Exception as e:
                        logger.warning(f"HTTP registration failed: {str(e)}")
                else:
                    logger.warning("⚠️  requests library not available - HTTP registration skipped (install: pip install requests)")
                
                return True
                
            except Exception as e:
                logger.warning(f"Connection attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
        
        logger.error("❌ Failed to connect to server")
        return False
    
    def _send_heartbeat(self):
        """Send periodic heartbeat to keep connection alive"""
        def heartbeat_loop():
            while self.is_connected:
                try:
                    # Send WebSocket heartbeat
                    self.sio.emit('rc:heartbeat', {
                        'user_id': self.student_id,
                        'timestamp': time.time()
                    })
                    
                    # Send HTTP heartbeat to update status in API
                    if REQUESTS_AVAILABLE:
                        try:
                            base_url = self.server_url.replace('ws://', 'http://').replace('wss://', 'https://')
                            heartbeat_url = f"{base_url}/api/student-heartbeat/{self.student_id}"
                            
                            requests.post(heartbeat_url, json={
                                'status': 'online'
                            }, timeout=5)
                        except Exception as e:
                            logger.debug(f"HTTP heartbeat failed: {str(e)}")
                    
                    time.sleep(30)  # Send every 30 seconds
                except Exception as e:
                    logger.warning(f"Heartbeat error: {str(e)}")
                    break
        
        thread = Thread(target=heartbeat_loop, daemon=True)
        thread.start()
    
    def _send_screenshots(self):
        """Send periodic screenshots to the server (every 500ms for ~2 FPS)"""
        def screenshot_loop():
            while self.is_connected:
                try:
                    if not PIL_AVAILABLE:
                        time.sleep(0.5)
                        continue
                    
                    screenshot_result = self._take_screenshot()
                    
                    if screenshot_result.get('status') == 'ok':
                        # Send screenshot to server
                        self.sio.emit('rc:screenshot', {
                            'student_id': self.student_id,
                            'image_base64': screenshot_result.get('image'),
                            'width': screenshot_result.get('width'),
                            'height': screenshot_result.get('height'),
                            'timestamp': time.time()
                        })
                        logger.debug("Screenshot sent")
                    
                    time.sleep(0.5)  # Capture every 500ms (~2 FPS)
                except Exception as e:
                    logger.debug(f"Screenshot loop error: {str(e)}")
                    time.sleep(0.5)
        
        thread = Thread(target=screenshot_loop, daemon=True)
        thread.start()
    
    def run(self):
        """Run the agent indefinitely"""
        try:
            if not self.connect():
                logger.error("Failed to establish initial connection")
                return
            
            logger.info(f"✨ Remote control agent running for {self.student_name}")
            logger.info(f"📍 Student ID: {self.student_id}")
            logger.info(f"🌐 Server: {self.server_url}")
            logger.info("💬 Listening for commands...")
            
            if PIL_AVAILABLE:
                logger.info("📸 Screenshot streaming enabled (every 500ms)")
                self._send_screenshots()  # Start auto-screenshot thread
            else:
                logger.warning("⚠️  Screenshot streaming disabled (PIL not available)")
            
            # Keep running
            self.sio.wait()
            
        except KeyboardInterrupt:
            logger.info("🛑 Shutting down agent...")
            self.disconnect()
        except Exception as e:
            logger.error(f"Fatal error: {str(e)}")
            self.disconnect()
    
    def disconnect(self):
        """Disconnect from the server"""
        try:
            self.sio.disconnect()
            self.is_connected = False
            logger.info("Disconnected from server")
        except Exception as e:
            logger.error(f"Error disconnecting: {str(e)}")


def main():
    """Main entry point"""
    print("=" * 60)
    print("🎓 Student Remote Control Agent")
    print("=" * 60)
    print(f"📱 Student Name: {STUDENT_NAME}")
    print(f"🔑 Student ID: {STUDENT_ID}")
    print(f"🌐 Server: {SERVER_URL}")
    print("=" * 60)
    print()
    
    # Check for required packages
    if not PYAUTOGUI_AVAILABLE:
        print("⚠️  WARNING: pyautogui not installed")
        print("Install with: pip install pyautogui")
        print()
    
    if not PIL_AVAILABLE:
        print("⚠️  WARNING: PIL/Pillow not installed")
        print("Install with: pip install pillow")
        print("(Optional - screenshots won't work but agent still functions)")
        print()
    
    if not REQUESTS_AVAILABLE:
        print("⚠️  WARNING: requests library not installed")
        print("Install with: pip install requests")
        print("(Optional - WebSocket commands still work but HTTP registration disabled)")
        print()
    
    # Create and run agent
    agent = StudentRemoteControlAgent(SERVER_URL, STUDENT_ID, STUDENT_NAME)
    agent.run()


if __name__ == '__main__':
    main()
