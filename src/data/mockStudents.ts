import { Student } from '@/types/lab';

export const mockStudents: Student[] = [
  { id: '1', name: 'Emma Wilson', email: 'emma.w@school.edu', status: 'online', workstation: 'WS-01', lastActive: new Date(), isLocked: false, currentApp: 'VS Code' },
  { id: '2', name: 'James Chen', email: 'james.c@school.edu', status: 'online', workstation: 'WS-02', lastActive: new Date(), isLocked: false, currentApp: 'Chrome' },
  { id: '3', name: 'Sofia Rodriguez', email: 'sofia.r@school.edu', status: 'online', workstation: 'WS-03', lastActive: new Date(), isLocked: true, currentApp: 'Terminal' },
  { id: '4', name: 'Liam Johnson', email: 'liam.j@school.edu', status: 'away', workstation: 'WS-04', lastActive: new Date(Date.now() - 300000), isLocked: false },
  { id: '5', name: 'Olivia Brown', email: 'olivia.b@school.edu', status: 'online', workstation: 'WS-05', lastActive: new Date(), isLocked: false, currentApp: 'IntelliJ' },
  { id: '6', name: 'Noah Davis', email: 'noah.d@school.edu', status: 'online', workstation: 'WS-06', lastActive: new Date(), isLocked: false, currentApp: 'Figma' },
  { id: '7', name: 'Ava Martinez', email: 'ava.m@school.edu', status: 'offline', workstation: 'WS-07', lastActive: new Date(Date.now() - 3600000), isLocked: false },
  { id: '8', name: 'Ethan Garcia', email: 'ethan.g@school.edu', status: 'online', workstation: 'WS-08', lastActive: new Date(), isLocked: false, currentApp: 'Word' },
  { id: '9', name: 'Isabella Anderson', email: 'isabella.a@school.edu', status: 'online', workstation: 'WS-09', lastActive: new Date(), isLocked: false, currentApp: 'Excel' },
  { id: '10', name: 'Mason Taylor', email: 'mason.t@school.edu', status: 'online', workstation: 'WS-10', lastActive: new Date(), isLocked: false, currentApp: 'Slack' },
  { id: '11', name: 'Mia Thomas', email: 'mia.t@school.edu', status: 'away', workstation: 'WS-11', lastActive: new Date(Date.now() - 600000), isLocked: false },
  { id: '12', name: 'Lucas Jackson', email: 'lucas.j@school.edu', status: 'online', workstation: 'WS-12', lastActive: new Date(), isLocked: false, currentApp: 'Python IDE' },
  { id: '13', name: 'Charlotte White', email: 'charlotte.w@school.edu', status: 'online', workstation: 'WS-13', lastActive: new Date(), isLocked: false, currentApp: 'Unity' },
  { id: '14', name: 'Henry Harris', email: 'henry.h@school.edu', status: 'offline', workstation: 'WS-14', lastActive: new Date(Date.now() - 7200000), isLocked: false },
  { id: '15', name: 'Amelia Martin', email: 'amelia.m@school.edu', status: 'online', workstation: 'WS-15', lastActive: new Date(), isLocked: false, currentApp: 'Photoshop' },
  { id: '16', name: 'Alexander Lee', email: 'alex.l@school.edu', status: 'online', workstation: 'WS-16', lastActive: new Date(), isLocked: false, currentApp: 'Blender' },
  { id: '17', name: 'Harper Clark', email: 'harper.c@school.edu', status: 'online', workstation: 'WS-17', lastActive: new Date(), isLocked: true, currentApp: 'VS Code' },
  { id: '18', name: 'Sebastian Lewis', email: 'sebastian.l@school.edu', status: 'away', workstation: 'WS-18', lastActive: new Date(Date.now() - 900000), isLocked: false },
  { id: '19', name: 'Evelyn Walker', email: 'evelyn.w@school.edu', status: 'online', workstation: 'WS-19', lastActive: new Date(), isLocked: false, currentApp: 'Chrome' },
  { id: '20', name: 'Jack Robinson', email: 'jack.r@school.edu', status: 'online', workstation: 'WS-20', lastActive: new Date(), isLocked: false, currentApp: 'Terminal' },
];
