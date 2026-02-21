import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ControlSessionData {
  sessionId: string;
  studentId: string;
  isActive: boolean;
  timestamp: string;
}

interface RemoteControlHookReturn {
  isConnected: boolean;
  activeSession: ControlSessionData | null;
  isConnecting: boolean;
  error: string | null;
  startSession: (teacherId: string, studentId: string) => Promise<void>;
  endSession: () => Promise<void>;
  sendCommand: (
    controlType: string,
    payload: Record<string, unknown>
  ) => Promise<void>;
  takeScreenshot: () => Promise<string | null>;
  requestScreenshot: (studentId: string) => Promise<void>;
  lastScreenshot: string | null;
}

export function useRemoteControl(
  teacherId: string,
  serverUrl: string = ''
): RemoteControlHookReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeSession, setActiveSession] = useState<ControlSessionData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [lastScreenshot, setLastScreenshot] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!teacherId) return;

    setIsConnecting(true);

    const url = serverUrl || window.location.origin;
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Connected to remote control server');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);

      // Register as teacher
      socket.emit('rc:connect', {
        user_id: teacherId,
        user_type: 'teacher',
      });
    });

    socket.on('rc:connected', (data) => {
      console.log('Remote control service connected:', data);
    });

    socket.on('rc:session_started', (data) => {
      console.log('Session started:', data);
      setActiveSession({
        sessionId: data.session_id,
        studentId: data.student_id,
        isActive: true,
        timestamp: data.timestamp,
      });
    });

    socket.on('rc:session_ended', (data) => {
      console.log('Session ended:', data);
      setActiveSession(null);
    });

    socket.on('rc:screenshot_received', (data) => {
      console.log('Screenshot received from student:', data.student_id);
      setLastScreenshot(data.image_base64);
    });

    socket.on('rc:command_queued', (data) => {
      console.log('Command queued:', data.command_id);
    });

    socket.on('rc:error', (data) => {
      console.error('Remote control error:', data.message);
      setError(data.message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setError('Disconnected from server');
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [teacherId, serverUrl]);

  const startSession = useCallback(
    async (teacherId: string, studentId: string) => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current?.connected) {
          reject(new Error('Not connected to server'));
          return;
        }

        socketRef.current.emit('rc:start_session', {
          teacher_id: teacherId,
          student_id: studentId,
        });

        // Wait for response
        const timeout = setTimeout(() => {
          reject(new Error('Session start timeout'));
        }, 5000);

        socketRef.current.once('rc:session_started', () => {
          clearTimeout(timeout);
          resolve();
        });

        socketRef.current.once('rc:error', (data) => {
          clearTimeout(timeout);
          reject(new Error(data.message));
        });
      });
    },
    []
  );

  const endSession = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      if (!activeSession) {
        reject(new Error('No active session'));
        return;
      }

      socketRef.current.emit('rc:end_session', {
        session_id: activeSession.sessionId,
      });

      const timeout = setTimeout(() => {
        reject(new Error('Session end timeout'));
      }, 5000);

      socketRef.current.once('rc:session_ended', () => {
        clearTimeout(timeout);
        resolve();
      });

      socketRef.current.once('rc:error', (data) => {
        clearTimeout(timeout);
        reject(new Error(data.message));
      });
    });
  }, [activeSession]);

  const sendCommand = useCallback(
    async (controlType: string, payload: Record<string, unknown>) => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current?.connected) {
          reject(new Error('Not connected to server'));
          return;
        }

        if (!activeSession) {
          reject(new Error('No active session'));
          return;
        }

        socketRef.current.emit('rc:control_command', {
          session_id: activeSession.sessionId,
          control_type: controlType,
          payload,
        });

        resolve();
      });
    },
    [activeSession]
  );

  const takeScreenshot = useCallback(async () => {
    if (!activeSession) {
      setError('No active session');
      return null;
    }

    try {
      await sendCommand('screenshot', {
        max_width: 1280,
        max_height: 720,
      });
      return lastScreenshot;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to take screenshot'
      );
      return null;
    }
  }, [activeSession, sendCommand, lastScreenshot]);

  const requestScreenshot = useCallback(
    async (studentId: string) => {
      try {
        await sendCommand('screenshot', {
          student_id: studentId,
          max_width: 1280,
          max_height: 720,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to request screenshot'
        );
      }
    },
    [sendCommand]
  );

  return {
    isConnected,
    isConnecting,
    activeSession,
    error,
    startSession,
    endSession,
    sendCommand,
    takeScreenshot,
    requestScreenshot,
    lastScreenshot,
  };
}
