"""
Student PC Agent for Remote Control
Runs on student computer to receive and execute control commands
"""

import socketio
import logging
import json
import base64
import time
from typing import Dict, Any, Optional
from threading import Thread
import platform

# Optional imports
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

logger = logging.getLogger(__name__)

# Conditionally import input control libraries
try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
except ImportError:
    PYAUTOGUI_AVAILABLE = False
    logger.warning("pyautogui not available - install with: pip install pyautogui")

try:
    from PIL import ImageGrab
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logger.warning("PIL not available - install with: pip install pillow")


class StudentRemoteControlAgent:
    """
    Agent that runs on student PC to receive and execute remote control commands
    """
    
    def __init__(self, server_url: str, student_id: str, student_name: str = None):
        """
        Initialize the remote control agent
        
        Args:
            server_url: WebSocket server URL (e.g., http://192.168.1.100:5000)
            student_id: Unique student identifier
            student_name: Optional student display name
        """
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
            logger.info(f"Connected to server: {data}")
            self.is_connected = True
            self._send_heartbeat()
        
        @self.sio.on('rc:control_request')
        def on_control_request(data):
            """Receive control request from teacher"""
            session_id = data.get('session_id')
            teacher_id = data.get('teacher_id')
            logger.info(f"Control request from {teacher_id} (session: {session_id})")
            self.active_session_id = session_id
            # In production, you might ask for user confirmation
        
        @self.sio.on('rc:execute_command')
        def on_execute_command(data):
            """Execute a remote control command"""
            try:
                command_id = data.get('command_id')
                control_type = data.get('control_type')
                payload = data.get('payload', {})
                
                logger.debug(f"Executing command {command_id}: {control_type}")
                
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
                logger.error(f"Error executing command: {str(e)}")
                self.sio.emit('rc:command_result', {
                    'student_id': self.student_id,
                    'command_id': data.get('command_id'),
                    'status': 'failed',
                    'error_message': str(e)
                })
        
        @self.sio.on('rc:session_ended')
        def on_session_ended(data):
            """Session ended by teacher"""
            logger.info("Remote control session ended")
            self.active_session_id = None
        
        @self.sio.on('rc:disconnect')
        def on_disconnect():
            logger.warning("Disconnected from server")
            self.is_connected = False
        
        @self.sio.on('rc:heartbeat_ack')
        def on_heartbeat_ack(data):
            pass  # Server acknowledged heartbeat
    
    def _execute_control_command(self, control_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a control command and return the result"""
        
        if control_type == 'mouse_move':
            return self._mouse_move(payload)
        elif control_type == 'mouse_click':
            return self._mouse_click(payload)
        elif control_type == 'mouse_scroll':
            return self._mouse_scroll(payload)
        elif control_type == 'key_press':
            return self._key_press(payload)
        elif control_type == 'key_release':
            return self._key_release(payload)
        elif control_type == 'type_text':
            return self._type_text(payload)
        elif control_type == 'screenshot':
            return self._take_screenshot(payload)
        elif control_type == 'focus_window':
            return self._focus_window(payload)
        else:
            raise ValueError(f"Unknown control type: {control_type}")
    
    def _mouse_move(self, payload: Dict) -> Dict:
        """Move mouse to coordinates"""
        if not PYAUTOGUI_AVAILABLE:
            raise RuntimeError("pyautogui not available")
        
        x = payload.get('x', 0)
        y = payload.get('y', 0)
        duration = payload.get('duration', 0.1)
        
        pyautogui.moveTo(x, y, duration=duration)
        return {'status': 'ok', 'x': x, 'y': y}
    
    def _mouse_click(self, payload: Dict) -> Dict:
        """Click mouse button"""
        if not PYAUTOGUI_AVAILABLE:
            raise RuntimeError("pyautogui not available")
        
        x = payload.get('x')
        y = payload.get('y')
        button = payload.get('button', 'left')
        clicks = payload.get('clicks', 1)
        interval = payload.get('interval', 0.1)
        
        if x is not None and y is not None:
            pyautogui.moveTo(x, y, duration=0.1)
        
        pyautogui.click(button=button, clicks=clicks, interval=interval)
        return {'status': 'ok', 'button': button, 'clicks': clicks}
    
    def _mouse_scroll(self, payload: Dict) -> Dict:
        """Scroll mouse wheel"""
        if not PYAUTOGUI_AVAILABLE:
            raise RuntimeError("pyautogui not available")
        
        x = payload.get('x')
        y = payload.get('y')
        amount = payload.get('amount', 3)  # positive = up, negative = down
        
        if x is not None and y is not None:
            pyautogui.moveTo(x, y, duration=0.1)
        
        pyautogui.scroll(amount)
        return {'status': 'ok', 'amount': amount}
    
    def _key_press(self, payload: Dict) -> Dict:
        """Press a key"""
        if not PYAUTOGUI_AVAILABLE:
            raise RuntimeError("pyautogui not available")
        
        key = payload.get('key')
        if not key:
            raise ValueError("key parameter required")
        
        pyautogui.press(key)
        return {'status': 'ok', 'key': key}
    
    def _key_release(self, payload: Dict) -> Dict:
        """Release a key (for held keys)"""
        if not PYAUTOGUI_AVAILABLE:
            raise RuntimeError("pyautogui not available")
        
        key = payload.get('key')
        if not key:
            raise ValueError("key parameter required")
        
        pyautogui.keyUp(key)
        return {'status': 'ok', 'key': key}
    
    def _type_text(self, payload: Dict) -> Dict:
        """Type text"""
        if not PYAUTOGUI_AVAILABLE:
            raise RuntimeError("pyautogui not available")
        
        text = payload.get('text', '')
        interval = payload.get('interval', 0.05)
        
        pyautogui.typewrite(text, interval=interval)
        return {'status': 'ok', 'text_length': len(text)}
    
    def _take_screenshot(self, payload: Dict) -> Dict:
        """Take a screenshot and return as base64"""
        if not PIL_AVAILABLE:
            raise RuntimeError("PIL not available")
        
        try:
            # Capture entire screen
            screenshot = ImageGrab.grab()
            
            # Resize if needed (to reduce size)
            max_width = payload.get('max_width', 1280)
            max_height = payload.get('max_height', 720)
            
            if screenshot.width > max_width or screenshot.height > max_height:
                screenshot.thumbnail((max_width, max_height))
            
            # Convert to base64
            import io
            buffer = io.BytesIO()
            screenshot.save(buffer, format='JPEG', quality=85)
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return {
                'status': 'ok',
                'image_base64': image_base64,
                'width': screenshot.width,
                'height': screenshot.height
            }
        except Exception as e:
            logger.error(f"Screenshot error: {str(e)}")
            raise
    
    def _focus_window(self, payload: Dict) -> Dict:
        """Focus a window (Windows only)"""
        if platform.system() != 'Windows':
            return {'status': 'ok', 'note': 'Not supported on this OS'}
        
        try:
            import pygetwindow
            window_name = payload.get('window_name')
            if window_name:
                windows = pygetwindow.getWindowsWithTitle(window_name)
                if windows:
                    windows[0].activate()
                    return {'status': 'ok', 'window': window_name}
        except Exception as e:
            logger.warning(f"Focus window error: {str(e)}")
        
        return {'status': 'ok', 'note': 'Window focus attempted'}
    
    def connect(self, max_retries: int = 5) -> bool:
        """
        Connect to the server
        
        Args:
            max_retries: Number of connection attempts
        
        Returns:
            True if connected successfully
        """
        for attempt in range(max_retries):
            try:
                logger.info(f"Connecting to {self.server_url} (attempt {attempt + 1}/{max_retries})")
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
                            logger.info(f"✅ Registered with HTTP API: {response.json()}")
                        else:
                            logger.warning(f"HTTP registration status: {response.status_code}")
                    except Exception as e:
                        logger.warning(f"HTTP registration failed: {str(e)}")
                else:
                    logger.warning("requests library not available - HTTP registration skipped")
                
                return True
                
            except Exception as e:
                logger.warning(f"Connection attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
        
        logger.error("Failed to connect to server")
        return False
    
    def disconnect(self):
        """Disconnect from the server"""
        try:
            self.sio.disconnect()
            self.is_connected = False
            logger.info("Disconnected from server")
        except Exception as e:
            logger.error(f"Error disconnecting: {str(e)}")
    
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
                            'image_base64': screenshot_result.get('image_base64'),
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
            
            logger.info(f"Remote control agent running for {self.student_name}")
            
            if PIL_AVAILABLE:
                logger.info("Screenshot streaming enabled (every 500ms)")
                self._send_screenshots()  # Start auto-screenshot thread
            else:
                logger.warning("Screenshot streaming disabled (PIL not available)")
            
            # Keep running in main thread
            self.sio.wait()
            
        except KeyboardInterrupt:
            logger.info("Agent interrupted by user")
            self.disconnect()
        except Exception as e:
            logger.error(f"Agent error: {str(e)}")
            self.disconnect()


def start_student_agent(server_url: str, student_id: str, student_name: str = None):
    """
    Convenience function to start the student agent
    
    Usage:
        python -c "from backend.agents.student_agent import start_student_agent; \
            start_student_agent('http://192.168.1.100:5000', 'student_001')"
    """
    agent = StudentRemoteControlAgent(server_url, student_id, student_name)
    agent.run()


if __name__ == '__main__':
    import sys
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    if len(sys.argv) < 2:
        print("Usage: python student_agent.py <server_url> <student_id> [student_name]")
        print("Example: python student_agent.py http://192.168.1.100:5000 student_001")
        sys.exit(1)
    
    server_url = sys.argv[1]
    student_id = sys.argv[2]
    student_name = sys.argv[3] if len(sys.argv) > 3 else None
    
    start_student_agent(server_url, student_id, student_name)
