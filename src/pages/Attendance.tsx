import { useState } from 'react';
import { Users, UserCheck, UserX, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherTopBar from '@/components/teacher/TeacherTopBar';
import { mockStudents } from '@/data/mockStudents';

export default function Attendance() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const present = mockStudents.filter(s => s.status !== 'offline').length;
  const absent = mockStudents.filter(s => s.status === 'offline').length;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden lg:block">
        <TeacherSidebar />
      </div>

      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <TeacherSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherTopBar
          onSearch={() => {}}
          onGlobalAction={() => {}}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isMobileSidebarOpen={mobileSidebarOpen}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Attendance</h1>
              <p className="text-muted-foreground">Track student attendance for today's session</p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{mockStudents.length}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Present
                </CardTitle>
                <UserCheck className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">{present}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Absent
                </CardTitle>
                <UserX className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">{absent}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Attendance Rate
                </CardTitle>
                <Clock className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {Math.round((present / mockStudents.length) * 100)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Student List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Student Attendance</CardTitle>
              <CardDescription>Today's session attendance record</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.workstation}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={student.status === 'offline' ? 'destructive' : 'default'}
                      className={student.status !== 'offline' ? 'bg-success/20 text-success border-success/30' : ''}
                    >
                      {student.status === 'offline' ? 'Absent' : 'Present'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
