import { FolderSync, Upload, FileText, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherTopBar from '@/components/teacher/TeacherTopBar';
import { useState } from 'react';

const mockFiles = [
  { id: '1', name: 'Assignment_Week1.pdf', size: '2.4 MB', sentTo: 18, date: '2 hours ago' },
  { id: '2', name: 'Project_Template.zip', size: '15.8 MB', sentTo: 20, date: 'Yesterday' },
  { id: '3', name: 'Lecture_Notes.docx', size: '1.2 MB', sentTo: 20, date: '3 days ago' },
];

export default function FileDistribution() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">File Distribution</h1>
            <p className="text-muted-foreground">Send files to student workstations</p>
          </div>

          {/* Upload Area */}
          <Card className="glass-card mb-6">
            <CardContent className="p-8">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop files here to distribute</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse your computer
                </p>
                <Button variant="outline">
                  <FolderSync className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Distributions</CardTitle>
              <CardDescription>Files you've sent to students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4" />
                          {file.sentTo} students
                        </div>
                        <p className="text-xs text-muted-foreground">{file.date}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
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
