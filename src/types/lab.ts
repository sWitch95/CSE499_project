export interface Student {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline' | 'away';
  workstation: string;
  screenPreview?: string;
  lastActive: Date;
  isLocked: boolean;
  currentApp?: string;
  labId?: string;
}

export interface LabSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  studentCount: number;
  isActive: boolean;
}

export interface Lab {
  id: string;
  name: string;
  description: string;
  room: string;
  capacity: number;
  studentIds: string[];
  createdAt: Date;
  isActive: boolean;
  color: string;
}
