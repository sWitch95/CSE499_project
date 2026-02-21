import { useEffect, useState, useRef, useCallback } from 'react';

interface StudentConnectionStatus {
  studentId: string;
  deviceName: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  teacherIP: string;
  lastConnected?: Date;
  errorMessage?: string;
}

interface ConnectionConfig {
  studentId: string;
  teacherIP: string;
  teacherPort?: number;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  timeout?: number;
}

const DEFAULT_TEACHER_PORT = 5000;
const DEFAULT_RECONNECT_INTERVAL = 5000;
const DEFAULT_TIMEOUT = 10000;

export function useStudentConnection(config: ConnectionConfig) {
  const [connectionStatus, setConnectionStatus] = useState<StudentConnectionStatus>({
    studentId: config.studentId,
    deviceName: `StudentPC-${config.studentId}`,
    status: 'disconnected',
    teacherIP: config.teacherIP,
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

  const teacherPort = config.teacherPort || DEFAULT_TEACHER_PORT;
  const reconnectInterval = config.reconnectInterval || DEFAULT_RECONNECT_INTERVAL;
  const autoReconnect = config.autoReconnect !== false;
  const timeout = config.timeout || DEFAULT_TIMEOUT;

  // টিচার সার্ভারে আমাদের ডিভাইস রেজিস্টার করুন
  const registerStudent = useCallback(async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, status: 'connecting' }));

      const apiUrl = `http://${config.teacherIP}:${teacherPort}/api/register-student`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: config.studentId,
          device_name: connectionStatus.deviceName,
          hostname: window.location.hostname,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      setConnectionStatus(prev => ({
        ...prev,
        status: 'connected',
        lastConnected: new Date(),
        errorMessage: undefined,
      }));

      console.log('✓ সফলভাবে টিচারের সাথে সংযুক্ত:', data);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'অজানা ত্রুটি';
      
      setConnectionStatus(prev => ({
        ...prev,
        status: 'error',
        errorMessage,
      }));

      console.error('✗ সংযোগ ব্যর্থ:', errorMessage);
      
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(
          registerStudent,
          reconnectInterval
        );
      }

      return false;
    }
  }, [config.teacherIP, config.studentId, teacherPort, timeout, reconnectInterval, autoReconnect, connectionStatus.deviceName]);

  // নিয়মিত হার্টবিট পাঠান
  const sendHeartbeat = useCallback(async () => {
    if (connectionStatus.status !== 'connected') return;

    try {
      const apiUrl = `http://${config.teacherIP}:${teacherPort}/api/student-heartbeat/${config.studentId}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          status: 'online',
        }),
      });

      if (!response.ok && response.status !== 404) {
        throw new Error('হার্টবিট ব্যর্থ');
      }
    } catch (error) {
      console.warn('হার্টবিট সতর্কতা:', error);
    }
  }, [config.teacherIP, config.studentId, teacherPort, connectionStatus.status]);

  // সংযোগ স্থাপন করুন
  useEffect(() => {
    registerStudent();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [registerStudent]);

  // হার্টবিট শুরু করুন (প্রতি ৩০ সেকেন্ডে)
  useEffect(() => {
    if (connectionStatus.status === 'connected') {
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000);
    }

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [connectionStatus.status, sendHeartbeat]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    
    setConnectionStatus(prev => ({
      ...prev,
      status: 'disconnected',
      errorMessage: undefined,
    }));
  }, []);

  return {
    connectionStatus,
    registerStudent,
    disconnect,
    isConnected: connectionStatus.status === 'connected',
  };
}
