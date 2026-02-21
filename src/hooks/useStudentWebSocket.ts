import { useEffect, useCallback, useRef } from 'react';
import { Student } from '@/types/lab';
import { toast } from '@/hooks/use-toast';

type StudentEvent = {
  type: 'status_change' | 'app_change' | 'lock_change' | 'activity';
  studentId: string;
  payload: Partial<Student>;
};

const RESTRICTED_APPS = ['Discord', 'Spotify', 'Netflix', 'YouTube', 'TikTok', 'Instagram', 'Twitter', 'Facebook', 'Reddit', 'Twitch'];

const SAFE_APPS = ['VS Code', 'Chrome', 'IntelliJ', 'Terminal', 'Word', 'Excel', 'PowerPoint', 'Figma', 'Python IDE', 'Unity', 'Blender', 'Photoshop', 'Slack', 'Zoom'];

export function useStudentWebSocket(
  students: Student[],
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>,
  isExamMode: boolean = false
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const studentsRef = useRef(students);

  // Keep ref updated
  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  const generateRandomEvent = useCallback((): StudentEvent | null => {
    const currentStudents = studentsRef.current;
    const onlineStudents = currentStudents.filter(s => s.status !== 'offline');
    
    if (onlineStudents.length === 0) return null;

    const randomStudent = onlineStudents[Math.floor(Math.random() * onlineStudents.length)];
    const eventType = Math.random();

    // 15% chance of status change
    if (eventType < 0.15) {
      const newStatus = Math.random() < 0.3 ? 'offline' : (Math.random() < 0.5 ? 'away' : 'online');
      return {
        type: 'status_change',
        studentId: randomStudent.id,
        payload: { status: newStatus, lastActive: new Date() }
      };
    }

    // 60% chance of app change
    if (eventType < 0.75) {
      const useRestricted = isExamMode && Math.random() < 0.1;
      const appList = useRestricted ? RESTRICTED_APPS : SAFE_APPS;
      const newApp = appList[Math.floor(Math.random() * appList.length)];
      return {
        type: 'app_change',
        studentId: randomStudent.id,
        payload: { currentApp: newApp, lastActive: new Date() }
      };
    }

    // 25% chance of activity update only
    return {
      type: 'activity',
      studentId: randomStudent.id,
      payload: { lastActive: new Date() }
    };
  }, [isExamMode]);

  const handleEvent = useCallback((event: StudentEvent) => {
    const currentStudents = studentsRef.current;
    const student = currentStudents.find(s => s.id === event.studentId);
    if (!student) return;

    // Handle offline alerts
    if (event.type === 'status_change' && event.payload.status === 'offline') {
      toast({
        title: '⚠️ Student Offline',
        description: `${student.name} (${student.workstation}) has gone offline unexpectedly.`,
        variant: 'destructive',
      });
    }

    // Handle away status
    if (event.type === 'status_change' && event.payload.status === 'away') {
      toast({
        title: '💤 Student Away',
        description: `${student.name} is now away from their workstation.`,
      });
    }

    // Handle restricted app alerts
    if (event.type === 'app_change' && event.payload.currentApp) {
      const isRestricted = RESTRICTED_APPS.includes(event.payload.currentApp);
      if (isRestricted) {
        toast({
          title: '🚨 Restricted Application',
          description: `${student.name} opened ${event.payload.currentApp} - This app is not allowed!`,
          variant: 'destructive',
        });
      }
    }

    // Update student state
    setStudents(prev => prev.map(s => 
      s.id === event.studentId 
        ? { ...s, ...event.payload }
        : s
    ));
  }, [setStudents]);

  // Simulated WebSocket connection
  useEffect(() => {
    // Start "connection"
    console.log('[WebSocket] Simulated connection established');
    
    // Generate events every 3-8 seconds
    const startEventLoop = () => {
      const delay = 3000 + Math.random() * 5000;
      intervalRef.current = setTimeout(() => {
        const event = generateRandomEvent();
        if (event) {
          handleEvent(event);
        }
        startEventLoop();
      }, delay);
    };

    startEventLoop();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      console.log('[WebSocket] Simulated connection closed');
    };
  }, [generateRandomEvent, handleEvent]);

  // Manual event triggers for testing
  const triggerOfflineEvent = useCallback((studentId: string) => {
    handleEvent({
      type: 'status_change',
      studentId,
      payload: { status: 'offline', lastActive: new Date() }
    });
  }, [handleEvent]);

  const triggerRestrictedAppEvent = useCallback((studentId: string, app: string) => {
    handleEvent({
      type: 'app_change',
      studentId,
      payload: { currentApp: app, lastActive: new Date() }
    });
  }, [handleEvent]);

  return {
    triggerOfflineEvent,
    triggerRestrictedAppEvent,
    RESTRICTED_APPS,
  };
}
