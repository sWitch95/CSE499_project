import { useState, useMemo, useCallback, useEffect } from 'react';
import { mockStudents } from '@/data/mockStudents';
import { Student } from '@/types/lab';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherTopBar from '@/components/teacher/TeacherTopBar';
import StudentScreenCard from '@/components/teacher/StudentScreenCard';
import ScreenViewerModal from '@/components/teacher/ScreenViewerModal';
import NotificationPanel from '@/components/teacher/NotificationPanel';
import MultiSelectToolbar from '@/components/teacher/MultiSelectToolbar';
import RemoteControlPanel from '@/components/RemoteControlPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Monitor, Lock, Wifi } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useStudentWebSocket } from '@/hooks/useStudentWebSocket';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  // Remote Control state
  const [isRemoteControlOpen, setIsRemoteControlOpen] = useState(false);
  const [remoteControlStudent, setRemoteControlStudent] = useState<any>(null);
  const [teacherId] = useState('teacher_' + Math.random().toString(36).substr(2, 9));
  
  // Multi-select state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { addNotification } = useNotifications();

  // Initialize WebSocket simulation for real-time updates
  useStudentWebSocket(students, setStudents, false);

  // Fetch connected students from API
  useEffect(() => {
    const fetchConnectedStudents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/students/list');
        const data = await response.json();
        
        if (data.students && data.students.length > 0) {
          // Convert API format to Student format
          const apiStudents = data.students.map((student: any) => ({
            id: student.id,
            name: student.name || student.id,
            email: 'student@example.com',
            workstation: student.hostname || 'Unknown',
            status: student.status === 'online' ? 'online' : 'offline',
            isLocked: false,
            ipAddress: student.ip,
            connectedAt: student.connected_at
          }));
          
          // Merge with existing mock data (prefer API data)
          const mergedStudents = [
            ...apiStudents,
            ...mockStudents.filter(m => !apiStudents.find(a => a.id === m.id))
          ];
          
          setStudents(mergedStudents);
          console.log('✅ Loaded', data.total, 'students from API');
        }
      } catch (error) {
        console.log('Student list API not yet available, using mock data');
      }
    };

    // Fetch on mount
    fetchConnectedStudents();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchConnectedStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.workstation.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const stats = useMemo(() => ({
    total: students.length,
    online: students.filter((s) => s.status === 'online').length,
    locked: students.filter((s) => s.isLocked).length,
    away: students.filter((s) => s.status === 'away').length,
  }), [students]);

  const toggleStudentSelection = useCallback((studentId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  }, []);

  const handleStudentAction = (studentId: string, action: string) => {
    const student = students.find(s => s.id === studentId);
    
    // Handle remote control action
    if (action === 'remote-control' && student) {
      setRemoteControlStudent({
        id: student.id,
        name: student.name,
        workstation: student.workstation
      });
      setIsRemoteControlOpen(true);
      return;
    }
    
    // Handle view action separately to open modal
    if (action === 'view' && student) {
      setSelectedStudent(student);
      setIsViewerOpen(true);
      return;
    }

    // Handle selection toggle
    if (action === 'select') {
      toggleStudentSelection(studentId);
      return;
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        
        switch (action) {
          case 'lock':
            toast({ title: `Locked ${s.name}'s screen` });
            return { ...s, isLocked: true };
          case 'unlock':
            toast({ title: `Unlocked ${s.name}'s screen` });
            return { ...s, isLocked: false };
          case 'message':
            toast({ title: `Message sent to ${s.name}` });
            return s;
          case 'shutdown':
            toast({ title: `Shutting down ${s.workstation}`, variant: 'destructive' });
            return { ...s, status: 'offline' as const };
          case 'restart':
            toast({ title: `Restarting ${s.workstation}` });
            return s;
          default:
            return s;
        }
      })
    );

    // Update selected student if modal is open
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(prev => {
        if (!prev) return null;
        const updated = students.find(s => s.id === studentId);
        return updated || prev;
      });
    }
  };

  const handleBulkAction = (action: string, data?: string) => {
    const selectedStudentsList = students.filter(s => selectedIds.has(s.id));
    const count = selectedStudentsList.length;

    switch (action) {
      case 'lock':
        setStudents(prev => prev.map(s => 
          selectedIds.has(s.id) ? { ...s, isLocked: true } : s
        ));
        toast({ title: `Locked ${count} screens` });
        break;
      case 'unlock':
        setStudents(prev => prev.map(s => 
          selectedIds.has(s.id) ? { ...s, isLocked: false } : s
        ));
        toast({ title: `Unlocked ${count} screens` });
        break;
      case 'message':
        toast({ title: `Message sent to ${count} students`, description: data });
        break;
      case 'shutdown':
        setStudents(prev => prev.map(s => 
          selectedIds.has(s.id) ? { ...s, status: 'offline' as const } : s
        ));
        toast({ title: `Shutting down ${count} workstations`, variant: 'destructive' });
        break;
      case 'restart':
        toast({ title: `Restarting ${count} workstations` });
        break;
    }
    
    // Clear selection after action
    setSelectedIds(new Set());
    setIsSelecting(false);
  };

  const handleGlobalAction = (action: string) => {
    switch (action) {
      case 'lock-all':
        setStudents((prev) => prev.map((s) => ({ ...s, isLocked: true })));
        toast({ title: 'All screens locked' });
        break;
      case 'unlock-all':
        setStudents((prev) => prev.map((s) => ({ ...s, isLocked: false })));
        toast({ title: 'All screens unlocked' });
        break;
      case 'shutdown-all':
        setStudents((prev) => prev.map((s) => ({ ...s, status: 'offline' as const })));
        toast({ title: 'All workstations shutting down', variant: 'destructive' });
        break;
      case 'restart-all':
        toast({ title: 'Restarting all workstations' });
        break;
    }
  };

  const handleBroadcast = (title: string, message: string) => {
    // In a real app, this would send via WebSocket
    console.log('[Broadcast]', title, message);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <TeacherSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <TeacherSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border px-4 lg:px-6 flex items-center justify-between gap-4">
          <TeacherTopBar
            onSearch={setSearchQuery}
            onGlobalAction={handleGlobalAction}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            isMobileSidebarOpen={mobileSidebarOpen}
          />
          
          {/* Notification Panel */}
          <NotificationPanel onBroadcast={handleBroadcast} />
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Online
                </CardTitle>
                <Wifi className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">{stats.online}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Locked
                </CardTitle>
                <Lock className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">{stats.locked}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Away
                </CardTitle>
                <Monitor className="w-4 h-4 text-warning" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-warning">{stats.away}</p>
              </CardContent>
            </Card>
          </div>

          {/* Student Grid */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Student Workstations</h2>
            <p className="text-sm text-muted-foreground">
              {filteredStudents.length} of {students.length} workstations
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={cn(
                  "relative",
                  isSelecting && "cursor-pointer"
                )}
                onClick={() => isSelecting && toggleStudentSelection(student.id)}
              >
                {/* Selection Indicator */}
                {isSelecting && (
                  <div className={cn(
                    "absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center transition-colors",
                    selectedIds.has(student.id)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-card border-border"
                  )}>
                    {selectedIds.has(student.id) && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
                <StudentScreenCard
                  student={student}
                  onAction={handleStudentAction}
                />
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Monitor className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No students found matching your search</p>
            </div>
          )}
        </main>
      </div>

      {/* Multi-Select Toolbar */}
      <MultiSelectToolbar
        selectedCount={selectedIds.size}
        totalCount={filteredStudents.length}
        onSelectAll={() => setSelectedIds(new Set(filteredStudents.map(s => s.id)))}
        onDeselectAll={() => setSelectedIds(new Set())}
        onAction={handleBulkAction}
        isSelecting={isSelecting}
        onToggleSelecting={() => {
          setIsSelecting(!isSelecting);
          if (isSelecting) setSelectedIds(new Set());
        }}
      />

      {/* Remote Control Panel Modal */}
      <Dialog open={isRemoteControlOpen} onOpenChange={setIsRemoteControlOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Remote Control - {remoteControlStudent?.name}</DialogTitle>
            <DialogDescription>
              Controlling workstation: {remoteControlStudent?.workstation} (ID: {remoteControlStudent?.id})
            </DialogDescription>
          </DialogHeader>
          
          {remoteControlStudent && (
            <div className="flex-1 overflow-hidden p-6">
              <RemoteControlPanel
                teacherId={teacherId}
                studentId={remoteControlStudent.id}
                studentName={remoteControlStudent.name}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Screen Viewer Modal */}
      <ScreenViewerModal
        student={selectedStudent}
        open={isViewerOpen}
        onOpenChange={(open) => {
          setIsViewerOpen(open);
          if (!open) setSelectedStudent(null);
        }}
        onAction={handleStudentAction}
      />
    </div>
  );
}
