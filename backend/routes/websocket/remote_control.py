"""
WebSocket handlers for Remote Control
Handles real-time communication between teacher and student
"""

from flask import Blueprint, request
from flask_socketio import emit, join_room, leave_room, rooms
import logging
import json
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

# Import the service
from ...services.remote_control_service import (
    remote_control_service, 
    ControlType
)

# Blueprint for WebSocket events
remote_control_bp = Blueprint('remote_control_bp', __name__)


class RemoteControlManager:
    """Manages WebSocket connections for remote control"""
    
    def __init__(self):
        # {user_id: socket_id}
        self.connected_users: Dict[str, str] = {}
    
    def register_user(self, user_id: str, socket_id: str) -> None:
        """Register a user connection"""
        self.connected_users[user_id] = socket_id
        logger.info(f"User registered: {user_id} -> {socket_id}")
    
    def unregister_user(self, user_id: str) -> None:
        """Unregister a user connection"""
        if user_id in self.connected_users:
            del self.connected_users[user_id]
            logger.info(f"User unregistered: {user_id}")
    
    def get_socket_id(self, user_id: str) -> str:
        """Get socket ID for a user"""
        return self.connected_users.get(user_id)
    
    def is_user_connected(self, user_id: str) -> bool:
        """Check if user is connected"""
        return user_id in self.connected_users


# Global manager
remote_control_manager = RemoteControlManager()


def register_remote_control_events(socketio):
    """
    Register WebSocket events for remote control
    
    Usage in your main.py:
        from backend.routes.websocket.remote_control import register_remote_control_events
        socketio = SocketIO(app)
        register_remote_control_events(socketio)
    """
    
    @socketio.on('rc:connect')
    def handle_rc_connect(data):
        """Handle remote control connection"""
        try:
            user_id = data.get('user_id')
            user_type = data.get('user_type')  # 'teacher' or 'student'
            
            if not user_id or not user_type:
                emit('rc:error', {'message': 'user_id and user_type required'})
                return
            
            # Register the user
            remote_control_manager.register_user(user_id, request.sid)
            
            # Join a room for this user
            join_room(f"user_{user_id}")
            
            logger.info(f"RC Connect: {user_type}/{user_id}")
            
            emit('rc:connected', {
                'user_id': user_id,
                'user_type': user_type,
                'timestamp': datetime.now().isoformat(),
                'socket_id': request.sid
            })
            
        except Exception as e:
            logger.error(f"Error in rc:connect: {str(e)}")
            emit('rc:error', {'message': str(e)})
    
    
    @socketio.on('rc:disconnect')
    def handle_rc_disconnect():
        """Handle remote control disconnect"""
        try:
            # Find user by socket ID and unregister
            for user_id, socket_id in list(remote_control_manager.connected_users.items()):
                if socket_id == request.sid:
                    remote_control_manager.unregister_user(user_id)
                    leave_room(f"user_{user_id}")
                    logger.info(f"RC Disconnect: {user_id}")
                    break
        except Exception as e:
            logger.error(f"Error in rc:disconnect: {str(e)}")
    
    
    @socketio.on('rc:start_session')
    def handle_start_session(data):
        """
        Teacher starts controlling a student
        
        Data:
        {
            "teacher_id": "teacher_1",
            "student_id": "student_1"
        }
        """
        try:
            teacher_id = data.get('teacher_id')
            student_id = data.get('student_id')
            
            if not teacher_id or not student_id:
                emit('rc:error', {'message': 'teacher_id and student_id required'})
                return
            
            # Create session
            session_id = remote_control_service.create_session(teacher_id, student_id)
            
            if not session_id:
                emit('rc:error', {'message': 'Failed to create session'})
                return
            
            # Notify student that teacher wants to control
            student_socket = remote_control_manager.get_socket_id(student_id)
            if student_socket:
                socketio.emit('rc:control_request', {
                    'teacher_id': teacher_id,
                    'session_id': session_id,
                    'timestamp': datetime.now().isoformat()
                }, room=f"user_{student_id}")
            
            # Confirm to teacher
            emit('rc:session_started', {
                'session_id': session_id,
                'student_id': student_id,
                'timestamp': datetime.now().isoformat()
            })
            
            logger.info(f"RC Session started: {session_id}")
            
        except Exception as e:
            logger.error(f"Error in rc:start_session: {str(e)}")
            emit('rc:error', {'message': str(e)})
    
    
    @socketio.on('rc:end_session')
    def handle_end_session(data):
        """End remote control session"""
        try:
            session_id = data.get('session_id')
            
            if not session_id:
                emit('rc:error', {'message': 'session_id required'})
                return
            
            session = remote_control_service.get_session(session_id)
            if not session:
                emit('rc:error', {'message': 'Session not found'})
                return
            
            teacher_id = session.teacher_id
            student_id = session.student_id
            
            # Close session
            remote_control_service.close_session(session_id)
            
            # Notify both parties
            socketio.emit('rc:session_ended', {
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            }, room=f"user_{teacher_id}")
            
            socketio.emit('rc:session_ended', {
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            }, room=f"user_{student_id}")
            
            logger.info(f"RC Session ended: {session_id}")
            
        except Exception as e:
            logger.error(f"Error in rc:end_session: {str(e)}")
            emit('rc:error', {'message': str(e)})
    
    
    @socketio.on('rc:control_command')
    def handle_control_command(data):
        """
        Teacher sends a control command (mouse, keyboard, etc.)
        
        Data:
        {
            "session_id": "rc_xxx",
            "control_type": "mouse_move",
            "payload": {"x": 100, "y": 200}
        }
        """
        try:
            session_id = data.get('session_id')
            control_type = data.get('control_type')
            payload = data.get('payload', {})
            
            if not session_id or not control_type:
                emit('rc:error', {'message': 'session_id and control_type required'})
                return
            
            # Validate session
            session = remote_control_service.get_session(session_id)
            if not session or not session.is_active:
                emit('rc:error', {'message': 'Session not active'})
                return
            
            # Add command to queue
            command_id = remote_control_service.add_command(
                session.student_id,
                ControlType(control_type),
                payload
            )
            
            if not command_id:
                emit('rc:error', {'message': 'Failed to queue command'})
                return
            
            # Send command to student
            socketio.emit('rc:execute_command', {
                'command_id': command_id,
                'control_type': control_type,
                'payload': payload,
                'timestamp': datetime.now().isoformat()
            }, room=f"user_{session.student_id}")
            
            # Acknowledge to teacher
            emit('rc:command_queued', {
                'command_id': command_id,
                'control_type': control_type
            })
            
            logger.debug(f"Command queued: {command_id} for student {session.student_id}")
            
        except Exception as e:
            logger.error(f"Error in rc:control_command: {str(e)}")
            emit('rc:error', {'message': str(e)})
    
    
    @socketio.on('rc:command_result')
    def handle_command_result(data):
        """
        Student sends back execution result for a command
        
        Data:
        {
            "student_id": "student_1",
            "command_id": "cmd_xxx",
            "status": "completed",
            "result": {...}
        }
        """
        try:
            student_id = data.get('student_id')
            command_id = data.get('command_id')
            status = data.get('status', 'completed')
            result = data.get('result', {})
            error_message = data.get('error_message')
            
            if not student_id or not command_id:
                emit('rc:error', {'message': 'student_id and command_id required'})
                return
            
            # Update command status
            remote_control_service.update_command_status(
                student_id,
                command_id,
                status,
                error_message
            )
            
            logger.debug(f"Command result: {command_id} -> {status}")
            
            emit('rc:command_result_ack', {
                'command_id': command_id,
                'status': status
            })
            
        except Exception as e:
            logger.error(f"Error in rc:command_result: {str(e)}")
            emit('rc:error', {'message': str(e)})
    
    
    @socketio.on('rc:screenshot')
    def handle_screenshot(data):
        """
        Student sends a screenshot to teacher
        
        Data:
        {
            "student_id": "student_1",
            "image_base64": "...",
            "timestamp": "..."
        }
        """
        try:
            student_id = data.get('student_id')
            image_data = data.get('image_base64')
            
            if not student_id or not image_data:
                emit('rc:error', {'message': 'student_id and image_base64 required'})
                return
            
            # Get all sessions for this student
            sessions = remote_control_service.get_student_sessions(student_id)
            
            # Send screenshot to all connected teachers
            for session in sessions:
                socketio.emit('rc:screenshot_received', {
                    'student_id': student_id,
                    'image_base64': image_data,
                    'session_id': session.session_id,
                    'timestamp': datetime.now().isoformat()
                }, room=f"user_{session.teacher_id}")
            
            logger.debug(f"Screenshot received from {student_id}")
            
        except Exception as e:
            logger.error(f"Error in rc:screenshot: {str(e)}")
            emit('rc:error', {'message': str(e)})
    
    
    @socketio.on('rc:heartbeat')
    def handle_heartbeat(data):
        """Keep-alive heartbeat"""
        try:
            user_id = data.get('user_id')
            if user_id:
                # Update session activity
                sessions = remote_control_service.get_student_sessions(user_id)
                for session in sessions:
                    session.last_activity = datetime.now()
            
            emit('rc:heartbeat_ack', {
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            logger.error(f"Error in rc:heartbeat: {str(e)}")
