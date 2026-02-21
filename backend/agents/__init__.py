"""
Backend Agents
Autonomous processes that run on student/teacher PCs
"""

from .student_agent import StudentRemoteControlAgent, start_student_agent

__all__ = [
    'StudentRemoteControlAgent',
    'start_student_agent',
]
