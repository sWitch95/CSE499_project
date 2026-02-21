"""
Remote Control Service
Handles mouse, keyboard, and screen control between teacher and student
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ControlType(str, Enum):
    """Types of remote control commands"""
    MOUSE_MOVE = "mouse_move"
    MOUSE_CLICK = "mouse_click"
    MOUSE_SCROLL = "mouse_scroll"
    KEY_PRESS = "key_press"
    KEY_RELEASE = "key_release"
    TYPE_TEXT = "type_text"
    SCREENSHOT = "screenshot"
    FOCUS_WINDOW = "focus_window"
    LOCK_SCREEN = "lock_screen"
    UNLOCK_SCREEN = "unlock_screen"


class MouseButton(str, Enum):
    """Mouse button types"""
    LEFT = "left"
    RIGHT = "right"
    MIDDLE = "middle"


@dataclass
class RemoteControlSession:
    """Represents an active remote control session"""
    teacher_id: str
    student_id: str
    session_id: str
    is_active: bool = True
    created_at: datetime = None
    last_activity: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.last_activity is None:
            self.last_activity = datetime.now()


@dataclass
class ControlCommand:
    """Represents a remote control command"""
    command_id: str
    control_type: ControlType
    timestamp: datetime
    payload: Dict[str, Any]
    status: str = "pending"  # pending, executing, completed, failed
    error_message: Optional[str] = None


class RemoteControlService:
    """Service to manage remote control sessions and commands"""
    
    def __init__(self):
        # Active sessions: {session_id: RemoteControlSession}
        self.active_sessions: Dict[str, RemoteControlSession] = {}
        
        # Command queue: {student_id: [ControlCommand]}
        self.command_queue: Dict[str, List[ControlCommand]] = {}
        
        # Session lookup: {(teacher_id, student_id): session_id}
        self.session_lookup: Dict[tuple, str] = {}
    
    def create_session(self, teacher_id: str, student_id: str) -> Optional[str]:
        """Create a new remote control session"""
        try:
            # Check if session already exists
            key = (teacher_id, student_id)
            if key in self.session_lookup:
                session_id = self.session_lookup[key]
                if session_id in self.active_sessions:
                    logger.info(f"Session already exists: {session_id}")
                    return session_id
            
            # Create new session
            from uuid import uuid4
            session_id = f"rc_{uuid4().hex[:8]}"
            
            session = RemoteControlSession(
                teacher_id=teacher_id,
                student_id=student_id,
                session_id=session_id
            )
            
            self.active_sessions[session_id] = session
            self.session_lookup[key] = session_id
            
            # Initialize command queue for student
            if student_id not in self.command_queue:
                self.command_queue[student_id] = []
            
            logger.info(f"Created remote control session: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            return None
    
    def close_session(self, session_id: str) -> bool:
        """Close a remote control session"""
        try:
            if session_id not in self.active_sessions:
                logger.warning(f"Session not found: {session_id}")
                return False
            
            session = self.active_sessions[session_id]
            session.is_active = False
            
            # Remove from lookup
            key = (session.teacher_id, session.student_id)
            if key in self.session_lookup:
                del self.session_lookup[key]
            
            del self.active_sessions[session_id]
            logger.info(f"Closed session: {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error closing session: {str(e)}")
            return False
    
    def add_command(self, student_id: str, control_type: ControlType, 
                   payload: Dict[str, Any]) -> Optional[str]:
        """Add a control command to the queue"""
        try:
            from uuid import uuid4
            command_id = f"cmd_{uuid4().hex[:8]}"
            
            command = ControlCommand(
                command_id=command_id,
                control_type=control_type,
                timestamp=datetime.now(),
                payload=payload
            )
            
            if student_id not in self.command_queue:
                self.command_queue[student_id] = []
            
            self.command_queue[student_id].append(command)
            logger.debug(f"Added command {command_id} for student {student_id}")
            return command_id
            
        except Exception as e:
            logger.error(f"Error adding command: {str(e)}")
            return None
    
    def get_pending_commands(self, student_id: str) -> List[ControlCommand]:
        """Get all pending commands for a student"""
        try:
            if student_id not in self.command_queue:
                return []
            
            pending = [cmd for cmd in self.command_queue[student_id] 
                      if cmd.status == "pending"]
            return pending
            
        except Exception as e:
            logger.error(f"Error getting commands: {str(e)}")
            return []
    
    def update_command_status(self, student_id: str, command_id: str, 
                             status: str, error_message: Optional[str] = None) -> bool:
        """Update command execution status"""
        try:
            if student_id not in self.command_queue:
                return False
            
            for cmd in self.command_queue[student_id]:
                if cmd.command_id == command_id:
                    cmd.status = status
                    if error_message:
                        cmd.error_message = error_message
                    logger.debug(f"Updated command {command_id} status: {status}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error updating command: {str(e)}")
            return False
    
    def get_session(self, session_id: str) -> Optional[RemoteControlSession]:
        """Get session details"""
        return self.active_sessions.get(session_id)
    
    def get_session_by_users(self, teacher_id: str, student_id: str) -> Optional[RemoteControlSession]:
        """Get session by teacher and student IDs"""
        key = (teacher_id, student_id)
        session_id = self.session_lookup.get(key)
        if session_id:
            return self.active_sessions.get(session_id)
        return None
    
    def get_student_sessions(self, student_id: str) -> List[RemoteControlSession]:
        """Get all active sessions for a student"""
        sessions = []
        for session in self.active_sessions.values():
            if session.student_id == student_id and session.is_active:
                sessions.append(session)
        return sessions
    
    def cleanup_inactive_sessions(self) -> int:
        """Remove inactive sessions (older than 1 hour)"""
        try:
            from datetime import timedelta
            now = datetime.now()
            timeout = timedelta(hours=1)
            
            inactive_sessions = []
            for session_id, session in self.active_sessions.items():
                if now - session.last_activity > timeout:
                    inactive_sessions.append(session_id)
            
            for session_id in inactive_sessions:
                self.close_session(session_id)
            
            logger.info(f"Cleaned up {len(inactive_sessions)} inactive sessions")
            return len(inactive_sessions)
            
        except Exception as e:
            logger.error(f"Error cleaning up sessions: {str(e)}")
            return 0


# Global instance
remote_control_service = RemoteControlService()
